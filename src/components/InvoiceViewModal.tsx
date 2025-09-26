import React, { useMemo, useState } from "react";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateInvoicePdfBase64 } from "@/utils/invoicePdf";

interface EmailInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any; // doit contenir clients, number, total, currency, items...
}

const EmailInvoiceModal: React.FC<EmailInvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  const [to, setTo] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [bccMe, setBccMe] = useState<boolean>(false);
  const [sending, setSending] = useState(false);

  useMemo(() => {
    if (!isOpen || !invoice) return;

    const defaultEmail =
      invoice?.clients?.email_primary ||
      invoice?.clients?.email ||
      "";

    setTo(defaultEmail || "");
    setSubject(`Facture ${invoice?.number || ""}`);
    setMessage(
      `Bonjour ${invoice?.clients?.name || ""},\n\n` +
      `Veuillez trouver ci-joint votre facture ${invoice?.number || ""} ` +
      `d’un montant de ${Number(invoice?.total || 0).toFixed(2)} ${invoice?.currency || "USD"}.\n\n` +
      `Cordialement,\n` +
      `Votre prestataire`
    );
  }, [isOpen, invoice]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject) {
      toast.error("Destinataire et sujet requis");
      return;
    }

    try {
      setSending(true);
      const tId = toast.loading("Génération du PDF…");

      // 1) Générer le PDF base64
      const pdfBase64 = await generateInvoicePdfBase64(invoice);
      const filename = `${invoice?.number || "invoice"}.pdf`;

      toast.loading("Envoi de l'email…", { id: tId });

      if (!isSupabaseConfigured || !supabase) {
        // DEMO
        await new Promise((r) => setTimeout(r, 800));
        toast.success("Email envoyé (demo)", { id: tId });
        onClose();
        return;
      }

      // 2) Appel Edge Function (utilise le SMTP de l’utilisateur connecté)
      const bccArray = bccMe && supabase?.auth?.getUser ? await (async () => {
        const { data } = await supabase.auth.getUser();
        const email = data?.user?.email;
        return email ? [email] : undefined;
      })() : undefined;

      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          to,
          subject,
          html: message.replace(/\n/g, "<br/>"),
          text: message,
          pdfBase64,
          filename,
          bcc: bccArray,
          // replyTo / fromName / fromEmail -> si tu veux forcer depuis l’UI,
          // sinon l’Edge Function utilisera l’identité par défaut de l’utilisateur
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      // 3) Marquer la facture comme "sent" si elle est encore en "draft"
      try {
        if (invoice?.id && invoice?.status === "draft") {
          await supabase.from("invoices").update({ status: "sent" }).eq("id", invoice.id);
        }
      } catch {
        /* non-bloquant */
      }

      toast.success("Email envoyé", { id: tId });
      onClose();
    } catch (e: any) {
      console.error("[EmailInvoiceModal] send error:", e);
      toast.error("Échec de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const inputBase =
    "w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors " +
    "border-zinc-800 text-zinc-100 placeholder-zinc-500 bg-zinc-900";

  const labelBase = "block text-sm font-semibold mb-2 text-zinc-200";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg border border-zinc-800">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-100">Envoyer la facture par email</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-300">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-5 space-y-4">
          <div>
            <label className={labelBase}>Destinataire *</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              type="email"
              className={inputBase}
              placeholder="client@email.com"
              required
            />
          </div>
          <div>
            <label className={labelBase}>Sujet *</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputBase} required />
          </div>
          <div>
            <label className={labelBase}>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className={inputBase}
              placeholder="Votre message au client…"
            />
            <div className="mt-2 flex items-center gap-2">
              <input id="bccMe" type="checkbox" checked={bccMe} onChange={(e) => setBccMe(e.target.checked)} />
              <label htmlFor="bccMe" className="text-sm text-gray-600 dark:text-gray-300">
                Me mettre en CCI
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 inline-flex items-center"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Envoi…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailInvoiceModal;
