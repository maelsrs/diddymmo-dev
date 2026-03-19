import { Elysia, t } from "elysia";
import prisma from "../lib/prisma";
import { generateCode, sendVerificationEmail } from "../lib/resend";

const CODE_EXPIRY_MINUTES = 10;

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/send-code",
    async ({ body, set }) => {
      const user = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (!user) {
        set.status = 404;
        return { error: "No account found with this email" };
      }

      if (user.emailVerified) {
        set.status = 400;
        return { error: "Email already verified" };
      }

      // delete old codes for this email
      await prisma.verificationCode.deleteMany({
        where: { email: body.email },
      });

      const code = generateCode();
      const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

      await prisma.verificationCode.create({
        data: {
          email: body.email,
          code,
          expiresAt,
        },
      });

      const result = await sendVerificationEmail(body.email, code);

      if (result.error) {
        set.status = 500;
        return { error: "Failed to send verification email" };
      }

      return { message: "Verification code sent" };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
      }),
    }
  )
  .post(
    "/verify",
    async ({ body, set }) => {
      const record = await prisma.verificationCode.findFirst({
        where: { email: body.email, code: body.code },
      });

      if (!record) {
        set.status = 400;
        return { error: "Invalid code" };
      }

      if (record.expiresAt < new Date()) {
        await prisma.verificationCode.delete({ where: { id: record.id } });
        set.status = 400;
        return { error: "Code expired" };
      }

      await prisma.user.update({
        where: { email: body.email },
        data: { emailVerified: true },
      });

      await prisma.verificationCode.deleteMany({
        where: { email: body.email },
      });

      return { message: "Email verified" };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        code: t.String(),
      }),
    }
  );
