import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Diddymmo <diddymo@lsblk2exa.beauty>";

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(to: string, code: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Votre code de vérification Diddymmo",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
        <h2 style="margin-bottom: 16px;">Vérification de votre email</h2>
        <p>Voici votre code de vérification :</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 24px; background: #f4f4f5; border-radius: 8px; margin: 24px 0;">
          ${code}
        </div>
        <p style="color: #71717a; font-size: 14px;">Ce code expire dans 10 minutes.</p>
      </div>
    `,
  });
}
