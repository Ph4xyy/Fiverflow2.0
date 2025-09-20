import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@3.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ⚡ Clés (ajoute SUPABASE_URL + SUPABASE_ANON_KEY dans les variables d’environnement Supabase)
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { headers: { Authorization: `Bearer ${supabaseKey}` } },
});

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");

serve(async (req: Request) => {
  try {
    // Vérif session utilisateur
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Récupération des infos envoyées
    const { to, subject, html, pdfBase64, filename } = await req.json();

    if (!to || !subject || !pdfBase64) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // On force l’expéditeur à être l’utilisateur connecté
    const senderEmail = user.email;

    const res = await resend.emails.send({
      from: "factures@fiverflow.com", // domaine validé
      reply_to: senderEmail,          // ✅ sécurisé : email de l’utilisateur
      to,
      subject,
      html,
      attachments: [
        {
          filename: filename || "invoice.pdf",
          content: pdfBase64,
          encoding: "base64",
        },
      ],
    });

    if (res.error) {
      return new Response(JSON.stringify({ error: res.error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error("[send-invoice-email] error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500 });
  }
});
