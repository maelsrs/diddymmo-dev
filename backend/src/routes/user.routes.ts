import { Elysia, t } from "elysia";
import type { User } from "@prisma/client";
import prisma from "../lib/prisma";
import { authPlugin, requireAuth, requireRole } from "../lib/auth";

const RankEnum = t.Union([
  t.Literal("USER"),
  t.Literal("EMPLOYEE"),
  t.Literal("ADMINISTRATOR"),
]);

function withoutPassword(user: User) {
  const { password, ...safe } = user;
  return safe;
}

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authPlugin)

  .get("/", async () => {
    const users = await prisma.user.findMany();
    return users.map(withoutPassword);
  }, {
    beforeHandle: requireRole("EMPLOYEE", "ADMINISTRATOR"),
  })

  .get(
    "/:id",
    async ({ params, set, authUser }) => {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
      });

      if (!user) {
        set.status = 404;
        return { error: "User not found" };
      }

      return withoutPassword(user);
    },
    {
      params: t.Object({ id: t.String() }),
      beforeHandle: ({ authUser, params, set }: any) => {
        if (!authUser) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
        if (authUser.id !== params.id && !["EMPLOYEE", "ADMINISTRATOR"].includes(authUser.rank)) {
          set.status = 403;
          return { error: "Forbidden" };
        }
      },
    }
  )

  .post(
    "/",
    async ({ body, set }) => {
      const hashedPassword = await Bun.password.hash(body.password, {
        algorithm: "bcrypt",
        cost: 10,
      });

      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: hashedPassword,
          rank: body.rank,
          emailVerified: true,
        },
      });

      set.status = 201;
      return withoutPassword(user);
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        name: t.String(),
        password: t.String({ minLength: 6 }),
        rank: t.Optional(RankEnum),
      }),
      beforeHandle: requireRole("ADMINISTRATOR"),
    }
  )

  .put(
    "/:id",
    async ({ params, body, authUser, set }) => {
      const isAdmin = authUser.rank === "ADMINISTRATOR";
      const isSelf = authUser.id === params.id;

      if (!isAdmin && !isSelf) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      if (!isAdmin && (body.rank || body.ownedRealEstate)) {
        set.status = 403;
        return { error: "Cannot modify rank or owned properties" };
      }

      const updatedFields: Partial<Pick<User, "email" | "name" | "password" | "rank" | "ownedRealEstate">> = {};

      if (body.email) updatedFields.email = body.email;
      if (body.name) updatedFields.name = body.name;
      if (body.password) {
        updatedFields.password = await Bun.password.hash(body.password, {
          algorithm: "bcrypt",
          cost: 10,
        });
      }

      if (isAdmin) {
        if (body.rank) updatedFields.rank = body.rank;
        if (body.ownedRealEstate) updatedFields.ownedRealEstate = body.ownedRealEstate;
      }

      const user = await prisma.user.update({
        where: { id: params.id },
        data: updatedFields,
      });

      return withoutPassword(user);
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        email: t.Optional(t.String({ format: "email" })),
        name: t.Optional(t.String()),
        password: t.Optional(t.String({ minLength: 6 })),
        rank: t.Optional(RankEnum),
        ownedRealEstate: t.Optional(t.Array(t.String())),
      }),
      beforeHandle: requireAuth,
    }
  )

  .delete(
    "/:id",
    async ({ params }) => {
      await prisma.user.delete({
        where: { id: params.id },
      });

      return { message: "User deleted" };
    },
    {
      params: t.Object({ id: t.String() }),
      beforeHandle: requireRole("ADMINISTRATOR"),
    }
  );
