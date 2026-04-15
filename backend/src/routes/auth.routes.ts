import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import prisma from "../lib/prisma";
import { generateCode, sendVerificationEmail } from "../lib/resend";

const CODE_TTL = 10 * 60 * 1000; // 10 min
const RATE_LIMITS = [30, 60, 120]; // progressive cooldowns in seconds

const strip = ({ password, ...user }: any) => user;

const codeSendLog = new Map<string, { count: number; lastSentAt: number }>();

function checkCodeRateLimit(email: string): { allowed: boolean; retryAfter?: number } {
  const entry = codeSendLog.get(email);
  if (!entry) return { allowed: true };

  const tier = Math.min(entry.count - 1, RATE_LIMITS.length - 1);
  const cooldown = RATE_LIMITS[tier] * 1000;
  const elapsed = Date.now() - entry.lastSentAt;

  if (elapsed < cooldown) {
    return { allowed: false, retryAfter: Math.ceil((cooldown - elapsed) / 1000) };
  }
  return { allowed: true };
}

function trackCodeSend(email: string) {
  const entry = codeSendLog.get(email);
  codeSendLog.set(email, {
    count: entry ? entry.count + 1 : 1,
    lastSentAt: Date.now(),
  });
}

async function sendCode(email: string) {
  await prisma.verificationCode.deleteMany({ where: { email } });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL);

  await prisma.verificationCode.create({ data: { email, code, expiresAt } });
  trackCodeSend(email);
  return sendVerificationEmail(email, code);
}

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET!, exp: "7d" }))

  .post("/register", async ({ body, set, jwt }) => {
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) {
      set.status = 409;
      return { error: "Un compte avec cet email existe déjà" };
    }

    const hash = await Bun.password.hash(body.password, { algorithm: "bcrypt", cost: 10 });

    await prisma.user.create({
      data: { email: body.email, name: body.name, password: hash },
    });

    await sendCode(body.email);

    set.status = 201;
    return { message: "Compte créé, code envoyé", email: body.email };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      name: t.String({ minLength: 2 }),
      password: t.String({ minLength: 6 }),
    }),
  })

  .post("/login", async ({ body, set, jwt }) => {
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await Bun.password.verify(body.password, user.password))) {
      set.status = 401;
      return { error: "Email ou mot de passe incorrect" };
    }

    if (!user.emailVerified) {
      set.status = 403;
      return { error: "Email non vérifié", needsVerification: true, email: user.email };
    }

    const token = await jwt.sign({ sub: user.id, email: user.email });
    return { user: strip(user), token };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String(),
    }),
  })

  .get("/me", async ({ headers, set, jwt }) => {
    const auth = headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Token manquant" };
    }

    const payload = await jwt.verify(auth.slice(7));
    if (!payload) {
      set.status = 401;
      return { error: "Token invalide" };
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub as string } });
    if (!user) {
      set.status = 404;
      return { error: "Utilisateur introuvable" };
    }

    return strip(user);
  })

  .post("/send-code", async ({ body, set }) => {
    const user = await prisma.user.findUnique({ where: { email: body.email } });

    if (!user) { set.status = 404; return { error: "Aucun compte trouvé" }; }
    if (user.emailVerified) { set.status = 400; return { error: "Email déjà vérifié" }; }

    const limit = checkCodeRateLimit(body.email);
    if (!limit.allowed) {
      set.status = 429;
      return { error: `Veuillez patienter avant de renvoyer un code`, retryAfter: limit.retryAfter };
    }

    const { error } = await sendCode(body.email);
    if (error) { set.status = 500; return { error: "Échec de l'envoi" }; }

    const entry = codeSendLog.get(body.email)!;
    const nextTier = Math.min(entry.count - 1, RATE_LIMITS.length - 1);

    return { message: "Code envoyé", retryAfter: RATE_LIMITS[nextTier] };
  }, {
    body: t.Object({ email: t.String({ format: "email" }) }),
  })

  .post("/verify", async ({ body, set, jwt }) => {
    const record = await prisma.verificationCode.findFirst({
      where: { email: body.email, code: body.code },
    });

    if (!record) { set.status = 400; return { error: "Code invalide" }; }

    if (record.expiresAt < new Date()) {
      await prisma.verificationCode.delete({ where: { id: record.id } });
      set.status = 400;
      return { error: "Code expiré" };
    }

    const user = await prisma.user.update({
      where: { email: body.email },
      data: { emailVerified: true },
    });

    await prisma.verificationCode.deleteMany({ where: { email: body.email } });

    const token = await jwt.sign({ sub: user.id, email: user.email });
    return { user: strip(user), token };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      code: t.String(),
    }),
  });
