import { Elysia, t } from "elysia";
import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { authPlugin, requireRole } from "../lib/auth";

const ListingTypeEnum = t.Union([t.Literal("LOCATION"), t.Literal("ACHAT")]);
const PropertyTypeEnum = t.Union([t.Literal("APPARTEMENT"), t.Literal("MAISON")]);
const HeatingTypeEnum = t.Union([
  t.Literal("INDIVIDUEL_GAZ"),
  t.Literal("INDIVIDUEL_ELECTRIQUE"),
  t.Literal("COLLECTIF"),
  t.Literal("POMPE_A_CHALEUR"),
  t.Literal("AUTRE"),
]);
const DpeGradeEnum = t.Union([
  t.Literal("A"),
  t.Literal("B"),
  t.Literal("C"),
  t.Literal("D"),
  t.Literal("E"),
  t.Literal("F"),
  t.Literal("G"),
]);
const FurnishedStatusEnum = t.Union([
  t.Literal("MEUBLE"),
  t.Literal("NON_MEUBLE"),
]);

const contactSelect = {
  select: { id: true, name: true, email: true },
} as const;

function buildFilters(query: Record<string, string | undefined>): Prisma.RealEstateWhereInput {
  const filters: Prisma.RealEstateWhereInput = {};

  if (query.listingType) filters.listingType = query.listingType as any;
  if (query.propertyType) filters.propertyType = query.propertyType as any;
  if (query.city) filters.city = query.city;
  if (query.dpe) filters.dpe = query.dpe as any;
  if (query.furnished) filters.furnished = query.furnished as any;
  if (query.rooms) filters.rooms = { gte: Number(query.rooms) };
  if (query.accessiblePMR) filters.accessiblePMR = query.accessiblePMR === "true";

  if (query.minSurface || query.maxSurface) {
    filters.surface = {
      ...(query.minSurface && { gte: Number(query.minSurface) }),
      ...(query.maxSurface && { lte: Number(query.maxSurface) }),
    };
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {
      ...(query.minPrice && { gte: Number(query.minPrice) }),
      ...(query.maxPrice && { lte: Number(query.maxPrice) }),
    };
  }

  return filters;
}

export const realEstateRoutes = new Elysia({ prefix: "/real-estate" })
  .use(authPlugin)

  .get("/", async ({ query }) => {
    return prisma.realEstate.findMany({
      where: buildFilters(query),
      include: { contact: contactSelect },
      orderBy: { createdAt: "desc" },
    });
  })
  .get(
    "/:id",
    async ({ params, set }) => {
      const property = await prisma.realEstate.findUnique({
        where: { id: params.id },
        include: { contact: contactSelect },
      });

      if (!property) {
        set.status = 404;
        return { error: "Property not found" };
      }

      return property;
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      const property = await prisma.realEstate.create({
        data: {
          listingType: body.listingType,
          propertyType: body.propertyType,
          surface: body.surface,
          rooms: body.rooms,
          floor: body.floor,
          constructionYear: body.constructionYear,
          heatingType: body.heatingType,
          furnished: body.furnished,
          dpe: body.dpe,
          ges: body.ges,
          price: body.price,
          charges: body.charges,
          address: body.address,
          street: body.street,
          quarter: body.quarter,
          city: body.city,
          zipCode: body.zipCode,
          nearTransport: body.nearTransport,
          transportDetails: body.transportDetails,
          availableFrom: new Date(body.availableFrom),
          accessiblePMR: body.accessiblePMR,
          hasElevator: body.hasElevator,
          images: body.images,
          contactId: body.contactId,
        },
        include: { contact: contactSelect },
      });

      set.status = 201;
      return property;
    },
    {
      body: t.Object({
        listingType: ListingTypeEnum,
        propertyType: PropertyTypeEnum,
        surface: t.Number({ minimum: 1 }),
        rooms: t.Integer({ minimum: 1 }),
        floor: t.Optional(t.Integer()),
        constructionYear: t.Integer(),
        heatingType: HeatingTypeEnum,
        furnished: t.Optional(FurnishedStatusEnum),
        dpe: DpeGradeEnum,
        ges: DpeGradeEnum,
        price: t.Number({ minimum: 0 }),
        charges: t.Optional(t.Number({ minimum: 0 })),
        address: t.String(),
        street: t.String(),
        quarter: t.String(),
        city: t.String(),
        zipCode: t.String(),
        nearTransport: t.Optional(t.Boolean()),
        transportDetails: t.Optional(t.String()),
        availableFrom: t.String(),
        accessiblePMR: t.Optional(t.Boolean()),
        hasElevator: t.Optional(t.Boolean()),
        images: t.Optional(t.Array(t.String())),
        contactId: t.String(),
      }),
      beforeHandle: requireRole("EMPLOYEE", "ADMINISTRATOR"),
    }
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const updatedFields: Prisma.RealEstateUpdateInput = {
        ...body,
        ...(body.availableFrom && { availableFrom: new Date(body.availableFrom) }),
      };

      const property = await prisma.realEstate.update({
        where: { id: params.id },
        data: updatedFields,
        include: { contact: contactSelect },
      });

      return property;
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        listingType: t.Optional(ListingTypeEnum),
        propertyType: t.Optional(PropertyTypeEnum),
        surface: t.Optional(t.Number({ minimum: 1 })),
        rooms: t.Optional(t.Integer({ minimum: 1 })),
        floor: t.Optional(t.Integer()),
        constructionYear: t.Optional(t.Integer()),
        heatingType: t.Optional(HeatingTypeEnum),
        furnished: t.Optional(FurnishedStatusEnum),
        dpe: t.Optional(DpeGradeEnum),
        ges: t.Optional(DpeGradeEnum),
        price: t.Optional(t.Number({ minimum: 0 })),
        charges: t.Optional(t.Number({ minimum: 0 })),
        address: t.Optional(t.String()),
        street: t.Optional(t.String()),
        quarter: t.Optional(t.String()),
        city: t.Optional(t.String()),
        zipCode: t.Optional(t.String()),
        nearTransport: t.Optional(t.Boolean()),
        transportDetails: t.Optional(t.String()),
        availableFrom: t.Optional(t.String()),
        accessiblePMR: t.Optional(t.Boolean()),
        hasElevator: t.Optional(t.Boolean()),
        images: t.Optional(t.Array(t.String())),
        contactId: t.Optional(t.String()),
      }),
      beforeHandle: requireRole("EMPLOYEE", "ADMINISTRATOR"),
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await prisma.realEstate.delete({
        where: { id: params.id },
      });

      return { message: "Property deleted" };
    },
    {
      params: t.Object({ id: t.String() }),
      beforeHandle: requireRole("ADMINISTRATOR"),
    }
  );
