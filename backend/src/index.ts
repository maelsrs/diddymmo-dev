import { Elysia } from "elysia";
import { userRoutes } from "./routes/user.routes";
import { realEstateRoutes } from "./routes/realestate.routes";
import { authRoutes } from "./routes/auth.routes";

const app = new Elysia()
  .get("/", () => ({ message: "Diddymmo API is running" }))
  .use(userRoutes)
  .use(realEstateRoutes)
  .use(authRoutes)
  .listen(process.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
