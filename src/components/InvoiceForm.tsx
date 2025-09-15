// src/components/InvoiceForm.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  X, CheckCircle, FileText, DollarSign, Calendar, ListChecks, Plus, Trash2, ArrowUp, ArrowDown, Tag
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { computeInvoice, normalizeItems, InvoiceLine } from '@/utils/invoice';

interface ClientOpt {
  id: string;
  name: string;
  platform?: string | null;
}

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice?: {
    id: string;
    number: string;
    client_id: string;
    currency?: string | null;
    issue_date: string;
    due_date: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
    subtotal?: number | null;
    tax_rate?: number | null;
    discount?: number | null;
    total?: number | null;
    notes?: string;
    terms?: string;
    tags?: string[];
  } | null;
}

const CURRENCIES = ['USD', 'EUR', 'CAD', 'GBP'];
const STATUSES = ['draft', 'sent', 'paid', 'overdue', 'canceled'] as const;

const InvoiceForm: React.FC<InvoiceFormProps> = ({ isOpen, onClose, onSuccess, invoice }) => {
  const { user } = useAuth();

  // UI
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data
  const [clients, setClients] = useState<ClientOpt[]>([]);
  const [items, setItems] = useState<InvoiceLine[]>(
    invoice
      ? []
      : [{ description: '', quantity: 1, unit_price: 0 }]
  );

  const [form, setForm] = useState({
    // Step 1 – Infos
    number: invoice?.number || '',
    client_id: invoice?.client_id || '',
    currency: invoice?.currency || 'USD',
    issue_date: invoice?.issue_date || '',
    due_date: invoice?.due_date || '',
    status: (invoice?.status || 'draft') as typeof STATUSES[number],

    // Step 3 – Totaux
    tax_rate: invoice?.tax_rate ?? 0,
    discount: invoice?.discount ?? 0,

    // Step 4 – Notes/tags
    notes: invoice?.notes || '',
    terms: invoice?.terms || '',
    tags: invoice?.tags || [] as string[],
  });

  // Charger clients & lignes (en édition)
  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      // Clients
      if (!isSupabaseConfigured || !supabase || !user) {
        setClients([
          { id: '1', name: 'Acme Corp', platform: 'Fiverr' },
          { id: '2', name: 'John Doe', platform: 'Upwork' },
        ]);
      } else {
        const { data, error } = await supabase
          .from('clients')
          .select('id,name,platform')
          .eq('user_id', user.id)
          .order('name');

        if (!error) setClients((data || []) as ClientOpt[]);
      }

      // Items pour une facture existante
      if (invoice && isSupabaseConfigured && supabase) {
        const { data: its, error: errItems } = await supabase
          .from('invoice_items')
          .select('id,description,quantity,unit_price,position')
          .eq('invoice_id', invoice.id)
          .order('position');
        if (!errItems) {
          setItems(
            (its || []).map((l: any) => ({
              id: l.id,
              description: l.description || '',
              quantity: l.quantity || 0,
              unit_price: l.unit_price || 0,
              position: l.position || 0,
            }))
          );
        } else {
          // fallback: si pas de table encore, au moins une ligne vide
          setItems([{ description: '', quantity: 1, unit_price: 0 }]);
        }
      }

      // Valeurs par défaut si création
      if (!invoice && !form.issue_date) {
        const today = new Date();
        const iso = today.toISOString().slice(0, 10);
        const in7 = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);
        setForm((f) => ({ ...f, issue_date: iso, due_date: in7 }));
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Calculs
  const calc = useMemo(() => {
    return computeInvoice({
      items,
      tax_rate: Number(form.tax_rate || 0),
      discount: Number(form.discount || 0),
    });
  }, [items, form.tax_rate, form.discount]);

  // Validation step-by-step
  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.number.trim()) e.number = 'Numéro requis';
      if (!form.client_id) e.client_id = 'Client requis';
      if (!form.issue_date) e.issue_date = 'Date d’émission requise';
      if (!form.due_date) e.due_date = 'Échéance requise';
      if (form.issue_date && form.due_date && new Date(form.issue_date) > new Date(form.due_date)) {
        e.due_date = 'Échéance doit être après la date d’émission';
      }
    }
    if (step === 2) {
      const validLines = normalizeItems(items);
      if (validLines.length === 0) e.items = 'Ajoutez au moins une ligne valide';
    }
    if (step === 3) {
      if (Number(form.tax_rate) < 0) e.tax_rate = 'Taux invalide';
      if (Number(form.discount) < 0) e.discount = 'Remise invalide';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    const ok = validateStep(currentStep);
    if (ok && currentStep < 4) setCurrentStep((s) => s + 1);
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  // Lignes: helpers
  const addItem = () => setItems((arr) => [...arr, { description: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (idx: number) =>
    setItems((arr) => arr.filter((_, i) => i !== idx));
  const moveUp = (idx: number) =>
    setItems((arr) => {
      if (idx <= 0) return arr;
      const copy = [...arr];
      [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
      return copy;
    });
  const moveDown = (idx: number) =>
    setItems((arr) => {
      if (idx >= arr.length - 1) return arr;
      const copy = [...arr];
      [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
      return copy;
    });

  const updateItem = (idx: number, patch: Partial<InvoiceLine>) =>
    setItems((arr) => {
      const copy = [...arr];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // full validation
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        toast.error('Veuillez corriger les erreurs');
        return;
      }
    }

    const norm = normalizeItems(items);
    const totals = computeInvoice({ items: norm, tax_rate: Number(form.tax_rate || 0), discount: Number(form.discount || 0) });

    if (!isSupabaseConfigured || !supabase || !user) {
      toast.success('Simulé (demo): facture enregistrée');
      onSuccess();
      onClose();
      return;
    }

    setLoading(true);
    const toastId = toast.loading(invoice ? 'Mise à jour…' : 'Création…');

    try {
      if (invoice) {
        // UPDATE invoice
        const { error: invErr } = await supabase
          .from('invoices')
          .update({
            number: form.number.trim(),
            client_id: form.client_id,
            currency: form.currency,
            issue_date: form.issue_date,
            due_date: form.due_date,
            status: form.status,
            subtotal: totals.subtotal,
            tax_rate: Number(form.tax_rate || 0),
            discount: Number(form.discount || 0),
            total: totals.total,
            notes: form.notes?.trim() || null,
            terms: form.terms?.trim() || null,
            tags: form.tags?.length ? form.tags : null,
          })
          .eq('id', invoice.id);
        if (invErr) throw invErr;

        // Replace items
        await supabase.from('invoice_items').delete().eq('invoice_id', invoice.id);
        if (norm.length) {
          const payload = norm.map((l, i) => ({
            invoice_id: invoice.id,
            description: l.description,
            quantity: l.quantity,
            unit_price: l.unit_price,
            line_total: l.line_total!,
            position: i + 1,
          }));
          const { error: itErr } = await supabase.from('invoice_items').insert(payload);
          if (itErr) throw itErr;
        }

        toast.success('Facture mise à jour', { id: toastId });
      } else {
        // INSERT invoice
        const { data: created, error: invErr } = await supabase
          .from('invoices')
          .insert([{
            user_id: user.id,
            number: form.number.trim(),
            client_id: form.client_id,
            currency: form.currency,
            issue_date: form.issue_date,
            due_date: form.due_date,
            status: form.status,
            subtotal: totals.subtotal,
            tax_rate: Number(form.tax_rate || 0),
            discount: Number(form.discount || 0),
            total: totals.total,
            notes: form.notes?.trim() || null,
            terms: form.terms?.trim() || null,
            tags: form.tags?.length ? form.tags : null,
          }])
          .select('id')
          .single();

        if (invErr) throw invErr;
        const invoiceId = created!.id;

        if (norm.length) {
          const payload = norm.map((l, i) => ({
            invoice_id: invoiceId,
            description: l.description,
            quantity: l.quantity,
            unit_price: l.unit_price,
            line_total: l.line_total!,
            position: i + 1,
          }));
          const { error: itErr } = await supabase.from('invoice_items').insert(payload);
          if (itErr) throw itErr;
        }

        toast.success('Facture créée', { id: toastId });
      }

      onSuccess();
      onClose();
      setCurrentStep(1);
      setErrors({});
    } catch (err) {
      console.error('[InvoiceForm] error:', err);
      toast.error('Erreur lors de l’enregistrement', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputBase =
    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
    'border-gray-300 text-gray-900 placeholder-gray-400 ' +
    'dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400';

  const selectBase =
    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
    'border-gray-300 text-gray-900 ' +
    'dark:bg-slate-800 dark:border-slate-700 dark:text-white';

  const labelBase = 'block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300';
  const errorText = 'mt-1 text-sm text-red-600 flex items-center';

  // Steps
  const Step1 = (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <FileText className="mr-2" size={20} />
        Informations facture
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelBase}>Numéro *</label>
          <input
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            className={`${inputBase} ${errors.number ? 'border-red-300 dark:border-red-500' : ''}`}
            placeholder="INV-2025-0001"
          />
          {errors.number && <p className={errorText}>⚠️ {errors.number}</p>}
        </div>

        <div>
          <label className={labelBase}>Client *</label>
          <select
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            className={`${selectBase} ${errors.client_id ? 'border-red-300 dark:border-red-500' : ''}`}
          >
            <option value="">Sélectionner un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.platform ? `(${c.platform})` : ''}
              </option>
            ))}
          </select>
          {errors.client_id && <p className={errorText}>⚠️ {errors.client_id}</p>}
        </div>

        <div>
          <label className={labelBase}>Devise</label>
          <select
            value={form.currency || 'USD'}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className={selectBase}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelBase}>Statut</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            className={selectBase}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className={labelBase}>Date d’émission *</label>
          <input
            type="date"
            value={form.issue_date}
            onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
            className={`${inputBase} ${errors.issue_date ? 'border-red-300 dark:border-red-500' : ''}`}
          />
          {errors.issue_date && <p className={errorText}>⚠️ {errors.issue_date}</p>}
        </div>

        <div>
          <label className={labelBase}>Échéance *</label>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            className={`${inputBase} ${errors.due_date ? 'border-red-300 dark:border-red-500' : ''}`}
          />
          {errors.due_date && <p className={errorText}>⚠️ {errors.due_date}</p>}
        </div>
      </div>
    </div>
  );

  const Step2 = (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <ListChecks className="mr-2" size={20} />
        Lignes
      </h3>

      <div className="space-y-3">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px_100px_90px] gap-3 items-start bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3"
          >
            <div>
              <label className={labelBase}>Description</label>
              <input
                value={it.description}
                onChange={(e) => updateItem(idx, { description: e.target.value })}
                placeholder="Ex: Design landing page"
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelBase}>Qté</label>
              <input
                type="number"
                min={0}
                value={it.quantity}
                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelBase}>Prix unitaire</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={it.unit_price}
                onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelBase}>Total</label>
              <input
                disabled
                value={
                  (Number(it.quantity || 0) * Number(it.unit_price || 0)).toFixed(2)
                }
                className={`${inputBase} opacity-70`}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => moveUp(idx)}
                className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                title="Monter"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveDown(idx)}
                className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                title="Descendre"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="p-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Ajouter une ligne
        </button>

        {errors.items && <p className={errorText}>⚠️ {errors.items}</p>}
      </div>
    </div>
  );

  const Step3 = (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <DollarSign className="mr-2" size={20} />
        Totaux & taxes
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelBase}>Sous-total</label>
          <input disabled value={calc.subtotal.toFixed(2)} className={`${inputBase} opacity-70`} />
        </div>
        <div>
          <label className={labelBase}>Remise (montant)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
            className={`${inputBase} ${errors.discount ? 'border-red-300 dark:border-red-500' : ''}`}
          />
          {errors.discount && <p className={errorText}>⚠️ {errors.discount}</p>}
        </div>
        <div>
          <label className={labelBase}>TVA %</label>
          <input
            type="number"
            step="0.01"
            min={0}
            value={form.tax_rate}
            onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })}
            className={`${inputBase} ${errors.tax_rate ? 'border-red-300 dark:border-red-500' : ''}`}
          />
          {errors.tax_rate && <p className={errorText}>⚠️ {errors.tax_rate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelBase}>Montant TVA</label>
          <input disabled value={calc.tax_amount.toFixed(2)} className={`${inputBase} opacity-70`} />
        </div>
        <div>
          <label className={labelBase}>Remise appliquée</label>
          <input disabled value={calc.discount_amount.toFixed(2)} className={`${inputBase} opacity-70`} />
        </div>
        <div>
          <label className={labelBase}>Total</label>
          <input disabled value={calc.total.toFixed(2)} className={`${inputBase} opacity-70`} />
        </div>
      </div>
    </div>
  );

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const v = e.currentTarget.value.trim();
      if (!form.tags.includes(v)) setForm((f) => ({ ...f, tags: [...f.tags, v] }));
      e.currentTarget.value = '';
    }
  };
  const removeTag = (t: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const Step4 = (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <Tag className="mr-2" size={20} />
        Notes, conditions & tags
      </h3>

      <div>
        <label className={labelBase}>Notes</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className={inputBase}
          placeholder="Notes internes ou message au client…"
        />
      </div>

      <div>
        <label className={labelBase}>Conditions</label>
        <textarea
          rows={3}
          value={form.terms}
          onChange={(e) => setForm({ ...form, terms: e.target.value })}
          className={inputBase}
          placeholder="Conditions de paiement, mentions légales…"
        />
      </div>

      <div>
        <label className={labelBase}>Tags</label>
        <input
          type="text"
          onKeyDown={handleTagKey}
          className={inputBase}
          placeholder="Tapez un tag et Entrée"
        />
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.tags.map((t, i) => (
              <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {t}
                <button type="button" onClick={() => removeTag(t)} className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {invoice ? 'Modifier la facture' : 'Créer / Envoyer une facture'}
            </h2>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-300'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {currentStep === 1 && Step1}
          {currentStep === 2 && Step2}
          {currentStep === 3 && Step3}
          {currentStep === 4 && Step4}

          {/* Footer */}
          <div className="flex justify-between mt-2 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {invoice ? 'Enregistrement…' : 'Création…'}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      {invoice ? 'Mettre à jour' : 'Créer la facture'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
