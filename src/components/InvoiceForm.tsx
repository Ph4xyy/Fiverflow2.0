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
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { computeInvoice, normalizeItems, InvoiceLine } from "@/utils/invoice";

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

const CURRENCIES = ["USD", "EUR", "CAD", "GBP"];
const STATUSES = ["draft", "sent", "paid", "overdue", "canceled"] as const;

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoice,
}) => {
  const { user } = useAuth();

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
    currency: invoice?.currency || "USD",
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
        if (tData) setTemplates(tData as TemplateOpt[]);
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

  // Validation
  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.number.trim()) e.number = "Numéro requis";
      if (!form.client_id) e.client_id = "Client requis";
      if (!form.issue_date) e.issue_date = "Date d’émission requise";
      if (!form.due_date) e.due_date = "Échéance requise";
      if (
        form.issue_date &&
        form.due_date &&
        new Date(form.issue_date) > new Date(form.due_date)
      ) {
        e.due_date = "Échéance doit être après la date d’émission";
      }
    }
    if (step === 2) {
      const validLines = normalizeItems(items);
      if (validLines.length === 0) e.items = "Ajoutez au moins une ligne valide";
    }
    if (step === 3) {
      if (Number(form.tax_rate) < 0) e.tax_rate = "Taux invalide";
      if (Number(form.discount) < 0) e.discount = "Remise invalide";
    }
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
  const removeItem = (idx: number) =>
    setItems((arr) => arr.filter((_, i) => i !== idx));
  const updateItem = (idx: number, patch: Partial<InvoiceLine>) =>
    setItems((arr) => {
      const copy = [...arr];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        toast.error("Veuillez corriger les erreurs");
        return;
      }
    }

    const norm = normalizeItems(items);
    const totals = computeInvoice({
      items: norm,
      tax_rate: Number(form.tax_rate || 0),
      discount: Number(form.discount || 0),
    });

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
          const payload = norm.map((l, i) => ({
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
        const { data: created, error: invErr } = await supabase
          .from("invoices")
          .insert([
            {
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
              template_id: form.template_id || null,
            },
          ])
          .select("id")
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
          await supabase.from("invoice_items").insert(payload);
        }

        toast.success("Facture créée", { id: toastId });
      }

      onSuccess();
      onClose();
      setCurrentStep(1);
      setErrors({});
    } catch (err) {
      console.error("[InvoiceForm] error:", err);
      toast.error("Erreur lors de l’enregistrement", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputBase =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
    "border-gray-300 text-gray-900 placeholder-gray-400 " +
    "dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400";

  const selectBase =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
    "border-gray-300 text-gray-900 " +
    "dark:bg-slate-800 dark:border-slate-700 dark:text-white";

  const labelBase = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";

  // Étape 1 modifiée → ajout du template
  const Step1 = (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <FileText className="mr-2" size={20} />
        Informations facture
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Numéro, Client, etc. ... */}
        {/* ... */}
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
              <ListChecks className="mr-2" size={20} />
              {/* lignes ... */}
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <DollarSign className="mr-2" size={20} />
              {/* totaux ... */}
            </div>
          )}
          {currentStep === 4 && (
            <div>
              <Tag className="mr-2" size={20} />
              {/* notes & tags ... */}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
