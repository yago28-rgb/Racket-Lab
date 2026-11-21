import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact endpoint. Validates input and records the message server-side.
 * Connect an email provider (Resend, Postmark, SES…) in `deliver` to receive it by email.
 */
async function deliver(msg: { name: string; email: string; topic: string; message: string }) {
  console.info("[contact]", JSON.stringify({ ...msg, message: msg.message.slice(0, 2000) }));
}

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 });
  }
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim();
  const topic = String(b.topic ?? "general").trim().slice(0, 80);
  const message = String(b.message ?? "").trim();
  // Honeypot
  if (b.company) return NextResponse.json({ ok: true });
  if (!name || name.length > 120) return NextResponse.json({ error: "Indica tu nombre." }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Email no válido." }, { status: 400 });
  if (message.length < 10 || message.length > 5000) return NextResponse.json({ error: "El mensaje debe tener entre 10 y 5000 caracteres." }, { status: 400 });
  await deliver({ name, email, topic, message });
  return NextResponse.json({ ok: true });
}
