import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { userRoutes } from "./routes/user.routes";
import { realEstateRoutes } from "./routes/realestate.routes";
import { authRoutes } from "./routes/auth.routes";

const app = new Elysia()
  .onError(({ code, error, path }) => {
    console.error(`[${code}] ${path}:`, error);
    return { error: error.message };
  })
  .use(cors({ origin: true, credentials: true }))
  .get("/", () => ({ message: "Diddymmo API is running" }))
  .use(userRoutes)
  .use(realEstateRoutes)
  .use(authRoutes)
  .listen(process.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
