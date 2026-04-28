import { Elysia, t } from "elysia";
import prisma from "../lib/prisma";
import { authPlugin, requireAuth, requireRole } from "../lib/auth";

const TicketStatusEnum = t.Union([
  t.Literal("OPEN"),
  t.Literal("IN_PROGRESS"),
  t.Literal("CLOSED"),
]);

const isStaff = (rank: string) => ["EMPLOYEE", "ADMINISTRATOR"].includes(rank);

export const ticketRoutes = new Elysia({ prefix: "/tickets" })
  .use(authPlugin)

  // List all tickets — EMPLOYEE/ADMIN
  .get("/", async ({ query }) => {
    const where: any = {};
    if (query.status) where.status = query.status;

    return prisma.ticket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, address: true, city: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }, {
    beforeHandle: requireRole("EMPLOYEE", "ADMINISTRATOR"),
  })

  // My tickets — authenticated user
  .get("/my", async ({ authUser }) => {
    return prisma.ticket.findMany({
      where: { userId: authUser.id },
      include: {
        property: { select: { id: true, address: true, city: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }, {
    beforeHandle: requireAuth,
  })

  // Get ticket with messages — owner or staff
  .get(
    "/:id",
    async ({ params, set, authUser }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: params.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, address: true, city: true } },
          messages: {
            include: { author: { select: { id: true, name: true, rank: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!ticket) {
        set.status = 404;
        return { error: "Ticket not found" };
      }

      if (ticket.userId !== authUser.id && !isStaff(authUser.rank)) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      return ticket;
    },
    {
      params: t.Object({ id: t.String() }),
      beforeHandle: requireAuth,
    }
  )

  // Create ticket — any authenticated user
  .post(
    "/",
    async ({ body, set, authUser }) => {
      const ticket = await prisma.ticket.create({
        data: {
          subject: body.subject,
          userId: authUser.id,
          propertyId: body.propertyId,
        },
      });

      // Create the first message
      if (body.message) {
        await prisma.ticketMessage.create({
          data: {
            content: body.message,
            ticketId: ticket.id,
            authorId: authUser.id,
          },
        });
      }

      set.status = 201;
      return ticket;
    },
    {
      body: t.Object({
        subject: t.String({ minLength: 1 }),
        propertyId: t.Optional(t.String()),
        message: t.Optional(t.String()),
      }),
      beforeHandle: requireAuth,
    }
  )

  // Change ticket status — EMPLOYEE/ADMIN
  .put(
    "/:id/status",
    async ({ params, body, set }) => {
      const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
      if (!ticket) {
        set.status = 404;
        return { error: "Ticket not found" };
      }

      return prisma.ticket.update({
        where: { id: params.id },
        data: { status: body.status },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ status: TicketStatusEnum }),
      beforeHandle: requireRole("EMPLOYEE", "ADMINISTRATOR"),
    }
  )

  // Add message to ticket — owner or staff
  .post(
    "/:id/messages",
    async ({ params, body, set, authUser }) => {
      const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
      if (!ticket) {
        set.status = 404;
        return { error: "Ticket not found" };
      }

      if (ticket.userId !== authUser.id && !isStaff(authUser.rank)) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      const message = await prisma.ticketMessage.create({
        data: {
          content: body.content,
          ticketId: params.id,
          authorId: authUser.id,
        },
        include: { author: { select: { id: true, name: true, rank: true } } },
      });

      // Update ticket updatedAt
      await prisma.ticket.update({
        where: { id: params.id },
        data: { updatedAt: new Date() },
      });

      set.status = 201;
      return message;
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ content: t.String({ minLength: 1 }) }),
      beforeHandle: requireAuth,
    }
  );
