// src/components/EmailInvoiceModal.tsx
import React, { useMemo, useState } from "react";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateInvoicePdfBase64 } from "@/utils/invoicePdf";
import { renderInvoiceWithTemplateToPdf } from "@/utils/invoiceTemplate";

interface EmailInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any; // contient clients, number, items, template?
}

const EmailInvoiceModal: React.FC<EmailInvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  const [to, setTo] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [sending, setSending] = useState(false);

  useMemo(() => {
    if (!isOpen || !invoice) return;

    // Pré-remplissages
    const defaultEmail =
      invoice?.clients?.email_primary ||
      invoice?.clients?.email ||
      ""; // selon ton schéma clients

    setTo(defaultEmail || "");
    setSubject(`Invoice ${invoice?.number || ""}`);
    setMessage(
      `Hello ${invoice?.clients?.name || ""},\n\nPlease find attached your invoice ${
        invoice?.number || ""
      }.\n\nBest regards,\nFiverFlow`
    );
  }, [isOpen, invoice]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject) {
      toast.error("Recipient and subject required");
      return;
    }

    try {
      setSending(true);
      const toastId = toast.loading("Generating PDF…");

      let pdfBase64: string;
      const filename = `${invoice?.number || "invoice"}.pdf`;

      // Generate PDF according to template
      if (invoice?.template?.schema) {
        const doc = await renderInvoiceWithTemplateToPdf(invoice.template.schema, invoice);
        const dataUri = doc.output("datauristring");
        pdfBase64 = dataUri.split(",")[1];
      } else {
        pdfBase64 = await generateInvoicePdfBase64(invoice);
      }

      toast.loading("Sending email…", { id: toastId });

      if (!isSupabaseConfigured || !supabase) {
        console.error('Supabase not configured - cannot send email');
        toast.error('Database not configured', { id: toastId });
        return;
      }

      // Appeler la Edge Function
      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          to,
          subject,
          html: message.replace(/\n/g, "<br/>"),
          pdfBase64,
          filename,
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast.success("Email sent", { id: toastId });
      onClose();
    } catch (e: any) {
      console.error("[EmailInvoiceModal] send error:", e);
      const errorMsg = e.message || "Failed to send email";
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const inputBase =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
    "border-gray-300 text-gray-900 placeholder-gray-400 " +
    "dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400";

  const labelBase = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send Invoice by Email</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-5 space-y-4">
          <div>
            <label className={labelBase}>Recipient *</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              type="email"
              className={inputBase}
              placeholder="client@email.com"
            />
          </div>
          <div>
            <label className={labelBase}>Subject *</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputBase} />
          </div>
          <div>
            <label className={labelBase}>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className={inputBase}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 inline-flex items-center"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
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
