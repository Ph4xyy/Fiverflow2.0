// supabase/functions/send-invoice-email/index.ts
// Envoi d’email via les identifiants SMTP de l’utilisateur courant
// Requiert: tables user_smtp_settings & user_sender_identities (déjà créées)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import nodemailer from "npm:nodemailer@6.9.13";

type Payload = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  pdfBase64?: string;
  filename?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  // Facultatif: override de l’expéditeur si tu veux outrepasser l’identité par défaut
  fromName?: string;
  fromEmail?: string;
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return json(405, { error: "Method Not Allowed" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    // On n’a PAS besoin du service key ici: on s’appuie sur l’utilisateur courant
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return json(401, { error: "Unauthenticated" });

    const body: Payload = await req.json().catch(() => ({} as Payload));
    if (!body.to || !body.subject) {
      return json(400, { error: "Missing 'to' or 'subject'." });
    }

    // 1) Charger la config SMTP de l’utilisateur
    const { data: smtpCfg, error: smtpErr } = await supabase
      .from("user_smtp_settings")
      .select("host,port,secure,username,password,from_name,from_email,reply_to,enabled")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (smtpErr) {
      return json(500, { error: "Failed to load SMTP settings", details: smtpErr.message });
    }
    if (!smtpCfg || !smtpCfg.enabled) {
      return json(400, { error: "SMTP not configured or disabled for this user." });
    }

    // 2) Déterminer l’identité expéditeur
    //    a) override fourni dans la requête
    //    b) valeurs de la config SMTP de l’utilisateur
    //    c) fallback: username SMTP tel quel
    let fromName = body.fromName || smtpCfg.from_name || "";
    let fromEmail = body.fromEmail || smtpCfg.from_email || smtpCfg.username || "";
    const replyTo = body.replyTo || smtpCfg.reply_to || fromEmail;

    if (!fromEmail) {
      return json(400, { error: "Missing sender email (from_email / username)." });
    }
    const fromHeader = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    // 3) Créer le transport nodemailer
    const transporter = nodemailer.createTransport({
      host: smtpCfg.host,
      port: Number(smtpCfg.port || 587),
      secure: Boolean(smtpCfg.secure) || Number(smtpCfg.port) === 465,
      auth: {
        user: smtpCfg.username,
        pass: smtpCfg.password,
      },
      // Optionnel : décommente si tu dois tolérer des certificats self-signed
      // tls: { rejectUnauthorized: false },
    });

    // 4) Construire le message
    const mailOptions: Record<string, unknown> = {
      from: fromHeader,
      to: body.to,
      subject: body.subject,
      replyTo,
    };

    if (body.cc) mailOptions.cc = body.cc;
    if (body.bcc) mailOptions.bcc = body.bcc;

    if (body.html) mailOptions.html = body.html;
    if (body.text) mailOptions.text = body.text;

    if (body.pdfBase64) {
      mailOptions.attachments = [
        {
          filename: body.filename || "invoice.pdf",
          content: body.pdfBase64,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ];
    }

    // 5) Envoi
    const info = await transporter.sendMail(mailOptions as any);

    return json(200, {
      ok: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
  } catch (e: any) {
    console.error("[send-invoice-email] fatal error:", e);
    return json(500, { error: "Unexpected error", details: String(e?.message || e) });
  }
});
