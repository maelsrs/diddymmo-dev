import { Elysia, t } from "elysia";
import prisma from "../lib/prisma";
import { authPlugin, requireAuth, requireRole } from "../lib/auth";

const DocumentTypeEnum = t.Union([
  t.Literal("CONTRAT"),
  t.Literal("QUITTANCE"),
  t.Literal("FACTURE"),
  t.Literal("ETAT_DES_LIEUX"),
  t.Literal("AUTRE"),
]);

export const documentRoutes = new Elysia({ prefix: "/documents" })
  .use(authPlugin)

  .get(
    "/",
    async ({ query }) => {
      const where: any = {};
      if (query.propertyId) where.propertyId = query.propertyId;
      if (query.tenantId) where.tenantId = query.tenantId;

      return prisma.document.findMany({
        where,
        include: {
          property: { select: { id: true, address: true, city: true } },
          tenant: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    {
      beforeHandle: requireRole("EMPLOYEE", "ADMINISTRATOR"),
    },
  )

  .get(
    "/my",
    async ({ authUser }) => {
      return prisma.document.findMany({
        where: { tenantId: authUser.id },
        include: {
          property: { select: { id: true, address: true, city: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    {
      beforeHandle: requireAuth,
    },
  )

  .post(
    "/",
    async ({ body, set, authUser }) => {
      const doc = await prisma.document.create({
        data: {
          name: body.name,
          type: body.type,
          url: body.url,
          propertyId: body.propertyId,
          tenantId: body.tenantId,
          uploadedById: authUser.id,
        },
        include: {
          property: { select: { id: true, address: true, city: true } },
          tenant: { select: { id: true, name: true, email: true } },
        },
      });

      set.status = 201;
      return doc;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        type: DocumentTypeEnum,
        url: t.String({ minLength: 1 }),
        propertyId: t.String(),
        tenantId: t.String(),
      }),
      beforeHandle: requireRole("EMPLOYEE", "ADMINISTRATOR"),
    },
  )

  .delete(
    "/:id",
    async ({ params, set }) => {
      const doc = await prisma.document.findUnique({
        where: { id: params.id },
      });
      if (!doc) {
        set.status = 404;
        return { error: "Document not found" };
      }

      await prisma.document.delete({ where: { id: params.id } });
      return { message: "Document deleted" };
    },
    {
      params: t.Object({ id: t.String() }),
      beforeHandle: requireRole("EMPLOYEE", "ADMINISTRATOR"),
    },
  );
