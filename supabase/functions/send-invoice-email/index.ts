// supabase/functions/send-invoice-email/index.ts
// Deno Edge Function — utilise Resend pour envoyer un email avec PDF en PJ

// Import npm depuis Deno (Edge functions supportent npm:)
import { Resend } from "npm:resend@3.2.0";

type Payload = {
  to: string;
  subject: string;
  html: string;        // corps HTML (simple)
  pdfBase64: string;   // contenu PDF en base64 (sans prefix data:)
  filename?: string;   // ex: "FACTURE-1234.pdf"
  from?: string;       // optionnel, ex: "Facturation <no-reply@tondomaine.com>"
};

Deno.serve(async (req) => {
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500 });
    }

    const body = (await req.json()) as Payload;

    if (!body.to || !body.subject || !body.html || !body.pdfBase64) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const resend = new Resend(RESEND_API_KEY);

    // Décoder la PJ base64 (Resend accepte Uint8Array/Buffer)
    const binary = Uint8Array.from(atob(body.pdfBase64), (c) => c.charCodeAt(0));

    const from = body.from || "FiverFlow <no-reply@fiverflow.app>";
    const filename = body.filename || "invoice.pdf";

    const { error } = await resend.emails.send({
      from,
      to: [body.to],
      subject: body.subject,
      html: body.html,
      attachments: [
        {
          filename,
          content: binary, // Uint8Array ok sur Resend
        },
      ],
    });

    if (error) {
      return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
