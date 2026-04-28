import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { userRoutes } from "./routes/user.routes";
import { realEstateRoutes } from "./routes/realestate.routes";
import { authRoutes } from "./routes/auth.routes";
import { documentRoutes } from "./routes/document.routes";
import { ticketRoutes } from "./routes/ticket.routes";

const app = new Elysia()
  .onError(({ code, error, path, set }) => {
    console.error(`[${code}] ${path}:`, error);

    if (code === "VALIDATION") {
      set.status = 422;
      return { error: "Invalid request" };
    }

    set.status = 500;
    return { error: "Internal server error" };
  })
  .use(cors({ origin: true, credentials: true }))
  .get("/", () => ({ message: "Diddymmo API is running" }))
  .use(userRoutes)
  .use(realEstateRoutes)
  .use(authRoutes)
  .use(documentRoutes)
  .use(ticketRoutes)
  .listen(process.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
