import { Elysia, t } from "elysia";
import type { User } from "@prisma/client";
import prisma from "../lib/prisma";

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
  .get("/", async () => {
    const users = await prisma.user.findMany();
    return users.map(withoutPassword);
  })
  .get(
    "/:id",
    async ({ params, set }) => {
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
      params: t.Object({
        id: t.String(),
      }),
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
    }
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const updatedFields: Partial<Pick<User, "email" | "name" | "password" | "rank" | "ownedRealEstate">> = {
        email: body.email,
        name: body.name,
        rank: body.rank,
        ownedRealEstate: body.ownedRealEstate,
      };

      if (body.password) {
        updatedFields.password = await Bun.password.hash(body.password, {
          algorithm: "bcrypt",
          cost: 10,
        });
      }

      const user = await prisma.user.update({
        where: { id: params.id },
        data: updatedFields,
      });

      return withoutPassword(user);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        email: t.Optional(t.String({ format: "email" })),
        name: t.Optional(t.String()),
        password: t.Optional(t.String({ minLength: 6 })),
        rank: t.Optional(RankEnum),
        ownedRealEstate: t.Optional(t.Array(t.String())),
      }),
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
      params: t.Object({
        id: t.String(),
      }),
    }
  );
