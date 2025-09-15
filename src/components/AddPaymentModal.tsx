// src/components/AddPaymentModal.tsx
import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  onSuccess: () => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ isOpen, onClose, invoiceId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [paidAt, setPaidAt] = useState<string>('');
  const [method, setMethod] = useState<string>('card');
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0 || !paidAt) {
      toast.error('Montant et date requis');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      toast.success('Paiement (demo) ajouté');
      onSuccess(); onClose();
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Enregistrement du paiement…');
    try {
      const { error } = await supabase.from('invoice_payments').insert([{
        invoice_id: invoiceId,
        amount: Number(amount),
        paid_at: paidAt, // yyyy-mm-dd
        method,
        note: note || null,
      }]);
      if (error) throw error;

      toast.success('Paiement ajouté', { id: toastId });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[AddPaymentModal] error:', err);
      toast.error('Erreur lors de l’ajout', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ajouter un paiement</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Montant *</label>
            <input
              type="number" step="0.01" min={0}
              value={amount} onChange={(e)=>setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Date de paiement *</label>
            <input
              type="date"
              value={paidAt} onChange={(e)=>setPaidAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Méthode</label>
            <select
              value={method} onChange={(e)=>setMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="card">Carte</option>
              <option value="bank_transfer">Virement</option>
              <option value="cash">Espèces</option>
              <option value="paypal">PayPal</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Note</label>
            <textarea
              value={note} onChange={(e)=>setNote(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Référence, commentaire…"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Valider
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;
