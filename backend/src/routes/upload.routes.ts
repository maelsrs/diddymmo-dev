import { Elysia, t } from "elysia";
import { authPlugin, requireRole } from "../lib/auth";

const UPLOAD_DIR = "uploads";
const PUBLIC_URL = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

const extFor = (type: string) =>
  ({
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  })[type] ?? "bin";

export const uploadRoutes = new Elysia({ prefix: "/uploads" })
  .use(authPlugin)

  // Serve uploaded files (public)
  .get(
    "/:name",
    async ({ params, set }) => {
      // Prevent path traversal — only allow plain file names
      if (!/^[a-zA-Z0-9._-]+$/.test(params.name)) {
        set.status = 400;
        return { error: "Invalid file name" };
      }
      const file = Bun.file(`${UPLOAD_DIR}/${params.name}`);
      if (!(await file.exists())) {
        set.status = 404;
        return { error: "File not found" };
      }
      return file;
    },
    { params: t.Object({ name: t.String() }) },
  )

  // Upload an image (EMPLOYEE / ADMINISTRATOR only)
  .post(
    "/",
    async ({ body, set }) => {
      const file = body.file;
      if (!ALLOWED.includes(file.type)) {
        set.status = 422;
        return { error: "Type de fichier non supporté (image attendue)" };
      }
      const name = `${crypto.randomUUID()}.${extFor(file.type)}`;
      await Bun.write(`${UPLOAD_DIR}/${name}`, file);
      set.status = 201;
      return { url: `${PUBLIC_URL}/uploads/${name}` };
    },
    {
      body: t.Object({ file: t.File({ maxSize: "10m" }) }),
      beforeHandle: requireRole("EMPLOYEE", "ADMINISTRATOR"),
    },
  );
