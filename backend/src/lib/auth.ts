import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import type { Rank } from "@prisma/client";
import prisma from "./prisma";

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .derive(async ({ headers, jwt }) => {
    const auth = headers.authorization;
    if (!auth?.startsWith("Bearer ")) return { authUser: null };

    const payload = await jwt.verify(auth.slice(7));
    if (!payload) return { authUser: null };

    const user = await prisma.user.findUnique({ where: { id: payload.sub as string } });
    if (!user) return { authUser: null };

    const { password, ...safe } = user;
    return { authUser: safe };
  });

export function requireAuth({ authUser, set }: any) {
  if (!authUser) {
    set.status = 401;
    return { error: "Unauthorized" };
  }
}

export function requireRole(...roles: Rank[]) {
  return ({ authUser, set }: any) => {
    if (!authUser) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    if (!roles.includes(authUser.rank)) {
      set.status = 403;
      return { error: "Forbidden" };
    }
  };
}
