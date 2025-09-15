// src/components/InvoiceViewModal.tsx
import React, { useState } from 'react';
import { X, Pencil, CheckCircle2, Send, CreditCard, Download, Mail } from 'lucide-react';
import { formatMoney, formatDate } from '@/utils/format';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import toast from 'react-hot-toast';
import AddPaymentModal from '@/components/AddPaymentModal';
import EmailInvoiceModal from '@/components/EmailInvoiceModal';
import { downloadInvoicePdf } from '@/utils/invoicePdf';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;           // doit idéalement contenir: items[], payments[]
  loading?: boolean;
  onEdit?: (invoice: any) => void;
  onRefetch?: () => void; // rappeler le fetch après action
}

const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  isOpen, onClose, invoice, loading = false, onEdit, onRefetch
}) => {
  const [payOpen, setPayOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [acting, setActing] = useState<'sent' | 'paid' | null>(null);

  if (!isOpen) return null;

  const markAs = async (status: 'sent' | 'paid') => {
    if (!invoice?.id) return;
    if (!isSupabaseConfigured || !supabase) {
      toast.success(`Statut changé (${status}) [demo]`);
      onRefetch?.();
      return;
    }
    setActing(status);
    const toastId = toast.loading('Mise à jour du statut…');
    try {
      const { error } = await supabase.from('invoices').update({ status }).eq('id', invoice.id);
      if (error) throw error;
      toast.success(`Facture marquée "${status}"`, { id: toastId });
      onRefetch?.();
    } catch (e) {
      console.error('[InvoiceView] markAs error:', e);
      toast.error('Impossible de mettre à jour', { id: toastId });
    } finally {
      setActing(null);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadInvoicePdf(invoice);
    } catch (e) {
      console.error('[InvoiceView] pdf error:', e);
      toast.error('Génération PDF impossible');
    }
  };

  const payments = invoice?.payments || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aperçu de la facture</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement…</span>
          </div>
        ) : !invoice ? (
          <div className="p-6 text-gray-600 dark:text-gray-300">Aucune donnée.</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Infos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Numéro</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{invoice.number || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Client</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{invoice.clients?.name || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Émise le</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{formatDate(invoice.issue_date)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Échéance</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{formatDate(invoice.due_date)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Statut</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{invoice.status || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {formatMoney(invoice.total, invoice.currency || 'USD')}
                </div>
              </div>
            </div>

            {/* Lignes */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 font-medium text-gray-900 dark:text-gray-100">
                Lignes
              </div>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {(invoice.items || []).length === 0 ? (
                  <div className="p-4 text-gray-600 dark:text-gray-300">Aucune ligne</div>
                ) : (
                  invoice.items.map((it: any, i: number) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-6 gap-2 p-4">
                      <div className="sm:col-span-3 text-gray-900 dark:text-gray-100">{it.description}</div>
                      <div className="text-gray-600 dark:text-gray-300">Qté: {it.quantity}</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        PU: {Number(it.unit_price).toFixed(2)}
                      </div>
                      <div className="text-gray-900 dark:text-gray-100 font-medium text-right">
                        {Number(it.line_total ?? it.quantity * it.unit_price).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Totaux */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">Sous‑total</div>
                <div className="text-sm text-gray-900 dark:text-gray-100 text-right">
                  {formatMoney(invoice.subtotal, invoice.currency || 'USD')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Remise</div>
                <div className="text-sm text-gray-900 dark:text-gray-100 text-right">
                  {formatMoney(invoice.discount, invoice.currency || 'USD')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">TVA ({invoice.tax_rate ?? 0}%)</div>
                <div className="text-sm text-gray-900 dark:text-gray-100 text-right">
                  {formatMoney(
                    invoice.tax_amount ??
                      ((invoice.subtotal - (invoice.discount || 0)) *
                        (Number(invoice.tax_rate || 0) / 100)),
                    invoice.currency || 'USD'
                  )}
                </div>
                <div className="text-base font-semibold text-gray-900 dark:text-gray-100">Total</div>
                <div className="text-base font-semibold text-gray-900 dark:text-gray-100 text-right">
                  {formatMoney(invoice.total, invoice.currency || 'USD')}
                </div>
              </div>
            </div>

            {/* Paiements */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div className="font-medium text-gray-900 dark:text-gray-100">Paiements</div>
                <button
                  onClick={() => setPayOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ajouter un paiement
                </button>
              </div>
              {(payments || []).length === 0 ? (
                <div className="p-4 text-gray-600 dark:text-gray-300">Aucun paiement enregistré</div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {payments.map((p: any) => (
                    <div key={p.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-4">
                      <div className="text-gray-900 dark:text-gray-100">
                        {formatMoney(p.amount, invoice.currency || 'USD')}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">{formatDate(p.paid_at)}</div>
                      <div className="text-gray-600 dark:text-gray-300">{p.method || '—'}</div>
                      <div className="text-gray-600 dark:text-gray-300">{p.note || '—'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </button>

              <button
                onClick={() => setEmailOpen(true)}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer par email
              </button>

              {onEdit && (
                <button
                  onClick={() => onEdit(invoice)}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </button>
              )}

              <button
                onClick={() => markAs('sent')}
                disabled={acting !== null}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Marquer envoyé
              </button>

              <button
                onClick={() => markAs('paid')}
                disabled={acting !== null}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marquer payé
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Paiement */}
      <AddPaymentModal
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        invoiceId={invoice?.id}
        onSuccess={onRefetch || (() => {})}
      />

      {/* Modal Email */}
      <EmailInvoiceModal
        isOpen={emailOpen}
        onClose={() => setEmailOpen(false)}
        invoice={invoice}
      />
    </div>
  );
};

export default InvoiceViewModal;
