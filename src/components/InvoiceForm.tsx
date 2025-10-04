// src/components/InvoiceForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  CheckCircle,
  FileText,
  DollarSign,
  Calendar,
  ListChecks,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Tag,
  Layers,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useCurrency } from "../contexts/CurrencyContext";
import toast from "react-hot-toast";
import { computeInvoice, normalizeItems, InvoiceLine } from "../utils/invoice";

interface ClientOpt {
  id: string;
  name: string;
  platform?: string | null;
}

interface TemplateOpt {
  id: string;
  name: string;
  is_default: boolean;
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
    status: "draft" | "sent" | "paid" | "overdue" | "canceled";
    subtotal?: number | null;
    tax_rate?: number | null;
    discount?: number | null;
    total?: number | null;
    notes?: string;
    terms?: string;
    tags?: string[];
    template_id?: string | null;
  } | null;
}

const CURRENCIES = [
  "USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY", "INR", "BRL", 
  "MXN", "ZAR", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RUB", "TRY", 
  "KRW", "SGD", "HKD", "NZD", "AED", "SAR", "ILS", "THB", "MYR", "PHP", 
  "IDR", "VND"
];
const STATUSES = ["draft", "sent", "paid", "overdue", "canceled"] as const;

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoice,
}) => {
  const { user } = useAuth();
  const { currency: userCurrency } = useCurrency();

  // UI
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data
  const [clients, setClients] = useState<ClientOpt[]>([]);
  const [templates, setTemplates] = useState<TemplateOpt[]>([]);
  const [items, setItems] = useState<InvoiceLine[]>(
    invoice ? [] : [{ description: "", quantity: 1, unit_price: 0 }]
  );

  const [form, setForm] = useState({
    number: invoice?.number || "",
    client_id: invoice?.client_id || "",
    currency: invoice?.currency || userCurrency,
    issue_date: invoice?.issue_date || "",
    due_date: invoice?.due_date || "",
    status: (invoice?.status || "draft") as typeof STATUSES[number],
    tax_rate: invoice?.tax_rate ?? 0,
    discount: invoice?.discount ?? 0,
    notes: invoice?.notes || "",
    terms: invoice?.terms || "",
    tags: invoice?.tags || ([] as string[]),
    template_id: invoice?.template_id || null,
  });

  // Charger clients, templates & items
  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      if (!isSupabaseConfigured || !supabase || !user) {
        setClients([
          { id: "1", name: "Acme Corp", platform: "Fiverr" },
          { id: "2", name: "John Doe", platform: "Upwork" },
        ]);
        setTemplates([{ id: "1", name: "Default Template", is_default: true }]);
        
        // Set default template for new invoices
        if (!invoice) {
          setForm((f) => ({ ...f, template_id: "1" }));
        }
      } else {
        const { data: cData } = await supabase
          .from("clients")
          .select("id,name,platform")
          .eq("user_id", user.id)
          .order("name");
        if (cData) setClients(cData as ClientOpt[]);

        const { data: tData } = await supabase
          .from("invoice_templates")
          .select("id,name,is_default")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });
        if (tData) {
          setTemplates(tData as TemplateOpt[]);
          
          // Set default template for new invoices
          if (!invoice) {
            const defaultTemplate = tData.find(t => t.is_default);
            if (defaultTemplate) {
              setForm((f) => ({ ...f, template_id: defaultTemplate.id }));
            }
          }
        }
      }

      if (invoice && isSupabaseConfigured && supabase) {
        const { data: its } = await supabase
          .from("invoice_items")
          .select("id,description,quantity,unit_price,position")
          .eq("invoice_id", invoice.id)
          .order("position");
        if (its) {
          setItems(
            its.map((l: any) => ({
              id: l.id,
              description: l.description || "",
              quantity: l.quantity || 0,
              unit_price: l.unit_price || 0,
              position: l.position || 0,
            }))
          );
        }
      }

      if (!invoice && !form.issue_date) {
        const today = new Date();
        const iso = today.toISOString().slice(0, 10);
        const in7 = new Date(today.getTime() + 7 * 86400000)
          .toISOString()
          .slice(0, 10);
        
        setForm((f) => ({ 
          ...f, 
          issue_date: iso, 
          due_date: in7
        }));
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

  // Validation
  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};
    
    if (step === 1) {
      // For creation, number is generated by the server; require it only when editing
      if (invoice && !form.number?.trim()) {
        e.number = "Numéro requis";
      }
      if (!form.client_id) {
        e.client_id = "Client requis";
      }
      if (!form.issue_date) {
        e.issue_date = "Date d'émission requise";
      }
      if (!form.due_date) {
        e.due_date = "Échéance requise";
      }
      if (
        form.issue_date &&
        form.due_date &&
        new Date(form.issue_date) > new Date(form.due_date)
      ) {
        e.due_date = "Échéance doit être après la date d'émission";
      }
    }
    
    if (step === 2) {
      // Allow navigation to step 2 even if no valid items yet
      // Items validation will be done at step 3 or on submit
      // Only validate if user has actually started adding items
      const hasStartedAddingItems = items.some(item => 
        item.description?.trim() || item.quantity > 1 || item.unit_price > 0
      );
      
      if (hasStartedAddingItems) {
        const validLines = normalizeItems(items.filter(item => 
          item.description?.trim() && 
          item.quantity > 0 && 
          item.unit_price > 0
        ));
        if (validLines.length === 0) {
          e.items = "Ajoutez au moins une ligne valide avec description, quantité et prix";
        }
      }
    }
    
    if (step === 3) {
      if (Number(form.tax_rate) < 0) {
        e.tax_rate = "Taux invalide";
      }
      if (Number(form.discount) < 0) {
        e.discount = "Remise invalide";
      }
    }
    
    console.log(`Step ${step} validation:`, e);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    const ok = validateStep(currentStep);
    if (ok && currentStep < 4) setCurrentStep((s) => s + 1);
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  // Lignes helpers
  const addItem = () =>
    setItems((arr) => [...arr, { description: "", quantity: 1, unit_price: 0 }]);
  const ensureOneEmptyItem = () => {
    const validItems = items.filter(item => 
      item.description?.trim() && 
      item.quantity > 0 && 
      item.unit_price > 0
    );
    if (validItems.length === 0) {
      setItems([{ description: "", quantity: 1, unit_price: 0 }]);
    }
  };
  const removeItem = (idx: number) => {
    setItems((arr) => {
      const newArr = arr.filter((_, i) => i !== idx);
      // Ensure at least one item exists
      if (newArr.length === 0) {
        return [{ description: "", quantity: 1, unit_price: 0 }];
      }
      return newArr;
    });
  };
  const updateItem = (idx: number, patch: Partial<InvoiceLine>) =>
    setItems((arr) => {
      const copy = [...arr];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure we have at least one valid item
    ensureOneEmptyItem();

    // Validate each step and collect all errors
    let hasErrors = false;
    let firstErrorStep = 1;
    let allErrors: Record<string, string> = {};
    
    for (let step = 1; step <= 3; step++) {
      const isValid = validateStep(step);
      if (!isValid) {
        hasErrors = true;
        if (firstErrorStep === 1) {
          firstErrorStep = step;
        }
        console.log("Validation error on step:", step, "Current errors:", errors);
      }
    }
    
    if (hasErrors) {
      setCurrentStep(firstErrorStep);
      console.log("Final errors to show:", errors);
      toast.error("Veuillez corriger les erreurs");
      return;
    }

    console.log("[InvoiceForm] Before processing:", { items, form });
    
    // Check if user has actually added any items with content
    const hasValidItems = items.some(item => 
      item.description?.trim() && 
      item.quantity > 0 && 
      item.unit_price > 0
    );
    
    if (!hasValidItems) {
      toast.error("Ajoutez au moins un article valide avec description, quantité et prix");
      setCurrentStep(2); // Go back to items step
      return;
    }
    
    const norm = normalizeItems(items);
    console.log("[InvoiceForm] Normalized items:", norm);
    
    const totals = computeInvoice({
      items: norm,
      tax_rate: Number(form.tax_rate || 0),
      discount: Number(form.discount || 0),
    });
    
    console.log("[InvoiceForm] Calculated totals:", totals);

    if (!isSupabaseConfigured || !supabase || !user) {
      toast.success("Simulé (demo): facture enregistrée");
      onSuccess();
      onClose();
      return;
    }

    setLoading(true);
    const toastId = toast.loading(invoice ? "Mise à jour…" : "Création…");

    try {
      if (invoice) {
        const { error: invErr } = await supabase
          .from("invoices")
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
            template_id: form.template_id || null,
          })
          .eq("id", invoice.id);
        if (invErr) throw invErr;

        await supabase.from("invoice_items").delete().eq("invoice_id", invoice.id);
        if (norm.length) {
          const payload = norm.map((l: InvoiceLine, i: number) => ({
            invoice_id: invoice.id,
            description: l.description,
            quantity: l.quantity,
            unit_price: l.unit_price,
            line_total: l.line_total!,
            position: i + 1,
          }));
          await supabase.from("invoice_items").insert(payload);
        }

        toast.success("Facture mise à jour", { id: toastId });
      } else {
        // Try RPC first, fallback to direct insert
        let invoiceId: string;
        
        try {
          const { data: createdId, error: invErr } = await supabase.rpc(
            'create_invoice_with_number',
            {
              p_user_id: user.id,
              p_client_id: form.client_id,
              p_issue_date: form.issue_date as any,
              p_due_date: form.due_date as any,
              p_currency: form.currency,
              p_notes: form.notes?.trim() || null,
              p_terms: form.terms?.trim() || null,
              p_template_id: form.template_id || null,
            }
          );
          if (invErr) throw invErr;
          invoiceId = createdId as unknown as string;
        } catch (rpcError) {
          console.warn("[InvoiceForm] RPC failed, using direct insert:", rpcError);
          console.error("[InvoiceForm] RPC error details:", {
            message: rpcError instanceof Error ? rpcError.message : String(rpcError),
            stack: rpcError instanceof Error ? rpcError.stack : undefined,
          });
          
          // Generate invoice number manually
          const { data: existingInvoices } = await supabase
            .from("invoices")
            .select("number")
            .eq("user_id", user.id)
            .like("number", "INV-%")
            .order("created_at", { ascending: false })
            .limit(1);
          
          let nextNumber = 1;
          if (existingInvoices && existingInvoices.length > 0) {
            const lastNumber = existingInvoices[0].number;
            const match = lastNumber.match(/INV-(\d+)$/);
            if (match) {
              nextNumber = parseInt(match[1]) + 1;
            }
          }
          
          const invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;
          
          // Create invoice directly
          console.log("[InvoiceForm] Creating invoice with data:", {
            user_id: user.id,
            number: invoiceNumber,
            client_id: form.client_id,
            issue_date: form.issue_date,
            due_date: form.due_date,
            currency: form.currency,
            status: form.status,
            subtotal: totals.subtotal,
            tax_rate: Number(form.tax_rate || 0),
            tax_amount: totals.tax_amount,
            discount: Number(form.discount || 0),
            total: totals.total,
            notes: form.notes?.trim() || null,
            terms: form.terms?.trim() || null,
            tags: form.tags?.length ? form.tags : null,
            template_id: form.template_id || null,
          });
          
          const invoiceData = {
            user_id: user.id,
            number: invoiceNumber,
            client_id: form.client_id,
            issue_date: form.issue_date,
            due_date: form.due_date,
            currency: form.currency,
            status: form.status,
            subtotal: totals.subtotal,
            tax_rate: Number(form.tax_rate || 0),
            tax_amount: totals.tax_amount,
            discount: Number(form.discount || 0),
            total: totals.total,
            notes: form.notes?.trim() || null,
            terms: form.terms?.trim() || null,
            tags: form.tags?.length ? form.tags : null,
            template_id: form.template_id || null,
          };
          
          console.log("[InvoiceForm] Insert invoice data:", invoiceData);
          
          const { data: newInvoice, error: insertErr } = await supabase
            .from("invoices")
            .insert(invoiceData)
            .select("id")
            .single();
            
          if (insertErr) {
            console.error("[InvoiceForm] Insert invoice error:", insertErr);
            throw insertErr;
          }
          invoiceId = newInvoice.id;
        }

        if (norm.length) {
          const payload = norm.map((l: InvoiceLine, i: number) => ({
            invoice_id: invoiceId,
            description: l.description,
            quantity: l.quantity,
            unit_price: l.unit_price,
            line_total: l.line_total!,
            position: i + 1,
          }));
          console.log("[InvoiceForm] Inserting invoice items:", payload);
          const { error: itemsErr } = await supabase.from("invoice_items").insert(payload);
          if (itemsErr) {
            console.error("[InvoiceForm] Error inserting items:", itemsErr);
            throw itemsErr;
          }
        }

        toast.success("Facture créée", { id: toastId });
      }

      onSuccess();
      onClose();
      setCurrentStep(1);
      setErrors({});
    } catch (err) {
      console.error("[InvoiceForm] error:", err);
      console.error("[InvoiceForm] error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        form: form,
        items: items,
        norm: norm,
        totals: totals
      });
      const errorMessage = err instanceof Error ? err.message : 
                           typeof err === 'object' && err !== null ? JSON.stringify(err) : 
                           String(err);
      toast.error(`Erreur lors de l'enregistrement: ${errorMessage}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputBase =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent " +
    "border-gray-300 text-gray-900 placeholder-gray-400 " +
    "dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400";

  const selectBase =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent " +
    "border-gray-300 text-gray-900 " +
    "dark:bg-slate-800 dark:border-slate-700 dark:text-white";

  const labelBase = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";

  // Étape 1 : Informations de base
  const Step1 = (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <FileText className="mr-2" size={20} />
        Informations facture
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelBase}>
            Client <span className="text-red-500">*</span>
          </label>
          <select
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            className={`${selectBase} ${errors.client_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner un client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.platform ? `(${client.platform})` : ''}
              </option>
            ))}
          </select>
          {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id}</p>}
        </div>

        <div>
          <label className={labelBase}>Modèle de facture</label>
          <select
            value={form.template_id || ""}
            onChange={(e) =>
              setForm({
                ...form,
                template_id: e.target.value || null,
              })
            }
            className={selectBase}
          >
            <option value="">Par défaut</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.is_default ? " (défaut)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelBase}>
            Date d'émission <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.issue_date}
            onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
            className={`${inputBase} ${errors.issue_date ? 'border-red-500' : ''}`}
          />
          {errors.issue_date && <p className="text-red-500 text-xs mt-1">{errors.issue_date}</p>}
        </div>

        <div>
          <label className={labelBase}>
            Échéance <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            className={`${inputBase} ${errors.due_date ? 'border-red-500' : ''}`}
          />
          {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
        </div>

        <div>
          <label className={labelBase}>Devise</label>
          <select
            value={form.currency || userCurrency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className={selectBase}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelBase}>Statut</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as typeof STATUSES[number] })}
            className={selectBase}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
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
              {invoice ? "Modifier la facture" : "Créer / Envoyer une facture"}
            </h2>
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
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <ListChecks className="mr-2" size={20} />
                Articles de la facture
              </h3>
              {errors.items && <p className="text-red-500 text-xs mt-1">{errors.items}</p>}
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-end p-2 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div className="flex-1 w-full">
                    <label htmlFor={`description-${idx}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input
                      type="text"
                      id={`description-${idx}`}
                      value={item.description}
                      onChange={(e) => updateItem(idx, { description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      placeholder="Description de l'article"
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <label htmlFor={`quantity-${idx}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quantité</label>
                    <input
                      type="number"
                      id={`quantity-${idx}`}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      min="0"
                    />
                  </div>
                  <div className="w-full sm:w-28">
                    <label htmlFor={`unit_price-${idx}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Prix unitaire</label>
                    <input
                      type="number"
                      id={`unit_price-${idx}`}
                      value={item.unit_price}
                      onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="w-full sm:w-24 text-right">
                    <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Total</span>
                    <p className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                      {(item.quantity * item.unit_price).toFixed(2)} {form.currency}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Ajouter un article
              </button>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="mr-2" size={20} />
                Totaux et notes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Taux de taxe (%)
                  </label>
                  <input
                    type="number"
                    id="tax_rate"
                    value={form.tax_rate ?? 0}
                    onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })}
                    className={`${inputBase} ${errors.tax_rate ? 'border-red-500' : ''}`}
                    min="0"
                    step="0.01"
                  />
                  {errors.tax_rate && <p className="text-red-500 text-xs mt-1">{errors.tax_rate}</p>}
                </div>
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remise ({form.currency})
                  </label>
                  <input
                    type="number"
                    id="discount"
                    value={form.discount ?? 0}
                    onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                    className={`${inputBase} ${errors.discount ? 'border-red-500' : ''}`}
                    min="0"
                    step="0.01"
                  />
                  {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
                </div>
              </div>

              <div className="text-right text-gray-700 dark:text-gray-300 space-y-1">
                <p>Sous-total: {calc.subtotal.toFixed(2)} {form.currency}</p>
                <p>Taxe ({form.tax_rate}%): {calc.tax_amount.toFixed(2)} {form.currency}</p>
                <p>Remise: {form.discount.toFixed(2)} {form.currency}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">Total: {calc.total.toFixed(2)} {form.currency}</p>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className={inputBase}
                  placeholder="Notes internes ou informations supplémentaires"
                ></textarea>
              </div>

              <div>
                <label htmlFor="terms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Conditions générales
                </label>
                <textarea
                  id="terms"
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                  rows={3}
                  className={inputBase}
                  placeholder="Conditions de paiement, garanties, etc."
                ></textarea>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Tag className="mr-2" size={20} />
                Finalisation
              </h3>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={form.tags.join(", ")}
                  onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) })}
                  className={inputBase}
                  placeholder="Ex: urgent, projet-X, client-premium"
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Récapitulatif</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><strong>Client:</strong> {clients.find(c => c.id === form.client_id)?.name || 'Non sélectionné'}</p>
                  <p><strong>Date d'émission:</strong> {form.issue_date}</p>
                  <p><strong>Échéance:</strong> {form.due_date}</p>
                  <p><strong>Articles:</strong> {items.filter(item => item.description?.trim() && item.quantity > 0 && item.unit_price > 0).length}</p>
                  <p><strong>Total:</strong> {calc.total.toFixed(2)} {form.currency}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between mt-2 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 border rounded-lg"
            >
              Précédent
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
            >
              {invoice ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
