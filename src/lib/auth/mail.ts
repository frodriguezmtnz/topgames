import { APP_URL } from "@/lib/config";

const FROM = process.env.MAIL_FROM ?? "TopVideoGames <noreply@topvideogames.lol>";

export function verificationLink(token: string): string {
  return `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
}

export function resetLink(token: string): string {
  return `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const subject = "Verify your email — TopVideoGames";
  const text = `Confirm your email to start voting:\n\n${verificationLink(token)}\n\nIf you didn't create an account, you can ignore this.`;
  await send(email, subject, text);
}

export async function sendResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const subject = "Password reset — TopVideoGames";
  const text = `Reset your password here:\n\n${resetLink(token)}\n\nThis link expires in 60 minutes. If you didn't request it, ignore this.`;
  await send(email, subject, text);
}

async function send(email: string, subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Modo desarrollo: sin clave de mail, mostramos el contenido por consola
    // para poder probar el flujo en local.
    console.log(`\n[Mail:dev] To: ${email}\nSubject: ${subject}\n\n${text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject,
      text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mail send failed (${res.status}): ${body}`);
  }
}
