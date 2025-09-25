// src/pages/InvoicesPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// ⬇️ on ne wrap PLUS avec Layout pour éviter la sidebar dupliquée
import { cardClass } from "@/components/Layout";
import InvoiceForm from "@/components/InvoiceForm";
import InvoiceViewModal from "@/components/InvoiceViewModal";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanRestrictions } from "@/hooks/usePlanRestrictions";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import toast from "react-hot-toast";
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, Send, CheckCircle2, FileText,
} from "lucide-react";
import { formatDate, formatMoney } from "@/utils/format";

type InvoiceRow = {
  id: string;
  number: string | null;
  client_id: string;
  status: "draft" | "sent" | "paid" | "overdue" | "canceled";
  currency: string | null;
  issue_date: string | null;
  due_date: string | null;
  subtotal: number | null;
  discount: number | null;
  tax_rate: number | null;
  total: number | null;
  created_at?: string | null;
  clients: {
    id: string;
    name: string;
    platform?: string | null;
  };
};

const STATUSES = ["draft", "sent", "paid", "overdue", "canceled"] as const;

const InvoicesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restrictions, checkAccess } = usePlanRestrictions();

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);

  const hasAccess = !!(restrictions?.isAdmin || checkAccess("invoices"));
  const isTab = useCallback((p: string) => location.pathname === p, [location.pathname]);
  const go = useCallback((p: string) => navigate(p), [navigate]);

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }
    if (!hasAccess) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      const demo: InvoiceRow[] = Array.from({ length: 12 }).map((_, i) => ({
        id: String(i + 1),
        number: `INV-2025-${String(i + 1).padStart(4, "0")}`,
        client_id: "demo",
        status: (["draft", "sent", "paid", "overdue"][i % 4] as any),
        currency: "USD",
        issue_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        subtotal: 100 + i * 25,
        discount: i % 3 === 0 ? 10 : 0,
        tax_rate: 20,
        total: 100 + i * 25 + 18,
        clients: { id: "c", name: i % 2 ? "Acme Inc" : "John Doe", platform: i % 2 ? "Fiverr" : "Upwork" },
      }));
      setInvoices(demo);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from("invoices")
        .select("id,number,client_id,status,currency,issue_date,due_date,subtotal,discount,tax_rate,total,created_at, clients!inner(id,name,platform)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`number.ilike.${term},clients.name.ilike.${term}`);
      }
      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      setInvoices((data || []) as any);
    } catch (e) {
      console.error("[Invoices] list fetch error:", e);
      toast.error("Impossible de charger les factures");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [user, hasAccess, search, status]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    if (isTab("/invoices/create")) {
      setEditingInvoice(null);
      setFormOpen(true);
    }
  }, [isTab]);

  const openView = useCallback(
    async (id?: string) => {
      if (!id) return;
      setIsViewOpen(true);
      setViewLoading(true);
      setViewInvoice(null);

      if (!isSupabaseConfigured || !supabase) {
        const inv = invoices.find((x) => x.id === id);
        if (!inv) {
          setViewLoading(false);
          toast.error("Invoice not found (demo).");
          return;
        }
        const tax_amount =
          ((Number(inv?.subtotal ?? 0) - Number(inv?.discount ?? 0)) * (Number(inv?.tax_rate ?? 0) / 100));
        const fake = {
          ...inv,
          items: [
            { description: "Design landing", quantity: 1, unit_price: 350, line_total: 350 },
            { description: "Integration", quantity: 4, unit_price: 80, line_total: 320 },
          ],
          payments: [],
          tax_amount,
        };
        setViewInvoice(fake);
        setViewLoading(false);
        return;
      }

      try {
        const { data: inv, error: invErr } = await supabase
          .from("invoices")
          .select("*, clients!inner(id,name,platform,email_primary)")
          .eq("id", id)
          .maybeSingle();
        if (invErr) throw invErr;
        if (!inv) {
          setViewLoading(false);
          toast.error("Facture introuvable.");
          setIsViewOpen(false);
          return;
        }

        const { data: items, error: itErr } = await supabase
          .from("invoice_items")
          .select("id,description,quantity,unit_price,line_total,position")
          .eq("invoice_id", id)
          .order("position");
        if (itErr) throw itErr;

        const { data: pays, error: payErr } = await supabase
          .from("invoice_payments")
          .select("id,amount,paid_at,method,note,created_at")
          .eq("invoice_id", id)
          .order("paid_at", { ascending: false });
        if (payErr) throw payErr;

        const tax_amount =
          (Number(inv?.subtotal ?? 0) - Number(inv?.discount ?? 0)) *
          (Number(inv?.tax_rate ?? 0) / 100);

        setViewInvoice({
          ...inv,
          items: items || [],
          payments: pays || [],
          tax_amount,
        });
      } catch (e) {
        console.error("[Invoices] view fetch error:", e);
        toast.error("Impossible de charger la facture");
        setIsViewOpen(false);
      } finally {
        setViewLoading(false);
      }
    },
    [invoices]
  );

  const onEdit = useCallback((row: InvoiceRow) => {
    setEditingInvoice({
      id: row.id,
      number: row.number || "",
      client_id: row.client_id,
      currency: row.currency || "USD",
      issue_date: row.issue_date || "",
      due_date: row.due_date || "",
      status: row.status,
      subtotal: row.subtotal,
      tax_rate: row.tax_rate,
      discount: row.discount,
      total: row.total,
      notes: null,
      terms: null,
      tags: [],
    });
    setFormOpen(true);
  }, []);

  const markStatus = useCallback(async (row: InvoiceRow, next: "sent" | "paid") => {
    if (!isSupabaseConfigured || !supabase) {
      toast.success(`Statut changé (${next}) [demo]`);
      setInvoices(prev => prev.map(i => i.id === row.id ? { ...i, status: next } as InvoiceRow : i));
      return;
    }
    const toastId = toast.loading("Updating…");
    try {
      const { error } = await supabase.from("invoices").update({ status: next }).eq("id", row.id);
      if (error) throw error;
      toast.success(`Facture marquée "${next}"`, { id: toastId });
      await fetchInvoices();
    } catch (e) {
      console.error("[Invoices] markStatus error:", e);
      toast.error("Action impossible", { id: toastId });
    }
  }, [fetchInvoices]);

  const remove = useCallback(async (row: InvoiceRow) => {
    if (!confirm("Supprimer cette facture ?")) return;

    if (!isSupabaseConfigured || !supabase) {
      toast.success("Deleted (demo)");
      setInvoices((arr) => arr.filter((x) => x.id !== row.id));
      return;
    }
    const toastId = toast.loading("Suppression…");
    try {
      await supabase.from("invoice_items").delete().eq("invoice_id", row.id);
      await supabase.from("invoice_payments").delete().eq("invoice_id", row.id);
      const { error } = await supabase.from("invoices").delete().eq("id", row.id);
      if (error) throw error;
      toast.success("Invoice deleted", { id: toastId });
      setInvoices((prev) => prev.filter((x) => x.id !== row.id));
    } catch (e) {
      console.error("[Invoices] delete error:", e);
      toast.error("Suppression impossible", { id: toastId });
    }
  }, []);

  const filtered = useMemo(() => {
    let data = invoices;
    if (!isSupabaseConfigured || !supabase) {
      const s = search.trim().toLowerCase();
      if (s) {
        data = data.filter(
          (x) =>
            (x.number || "").toLowerCase().includes(s) ||
            (x.clients?.name || "").toLowerCase().includes(s)
        );
      }
      if (status) data = data.filter((x) => x.status === status);
    }
    if (isTab("/invoices/sent")) data = data.filter((x) => x.status === "sent");
    return data;
  }, [invoices, search, status, isTab]);

  const safeMoney = (val: number | null | undefined, ccy?: string | null) =>
    formatMoney(Number(val ?? 0), ccy || "USD");

  const Header = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Factures</h1>
        <p className="text-gray-600 dark:text-gray-400">Créer, envoyer et suivre vos factures.</p>
      </div>
      <button
        onClick={() => {
          setEditingInvoice(null);
          setFormOpen(true);
          go("/invoices/create");
        }}
        className={`inline-flex items-center px-4 py-2 rounded-lg ${
          hasAccess ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
        disabled={!hasAccess}
      >
        <Plus className="h-4 w-4 mr-2" />
        Créer / Envoyer
      </button>
    </div>
  );

  const Filters = (
    <div className={`${cardClass} p-3 sm:p-4`}>
      <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-200">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtres</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search (number, client)…"
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-300 dark:border-slate-700
                       bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100
                       placeholder-gray-400 dark:placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="text"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Statut (tous)</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStatus("");
          }}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );

  const List = (
    <div className={`${cardClass}`}>
      {loading ? (
        <div className="p-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">Aucune facture</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Créez votre première facture pour commencer.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-800/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  N°
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Émise le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Échéance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Total
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="font-medium">{row.number || "—"}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.status}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                    {row.clients?.name || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                    {formatDate(row.issue_date ?? undefined)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                    {formatDate(row.due_date ?? undefined)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {safeMoney(row.total, row.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openView(row.id)}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(row)}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => markStatus(row, "sent")}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        title="Mark as sent"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => markStatus(row, "paid")}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700"
                        title="Mark as paid"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(row)}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const DashboardBlock = (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className={`${cardClass} p-4`}>
        <div className="text-sm text-gray-500 dark:text-gray-400">Total émis</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          {safeMoney(
            invoices.reduce((s, x) => s + Number(x.total ?? 0), 0),
            invoices[0]?.currency || "USD"
          )}
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="text-sm text-gray-500 dark:text-gray-400">Envoyées</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          {invoices.filter((x) => x.status === "sent").length}
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="text-sm text-gray-500 dark:text-gray-400">Payées</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          {invoices.filter((x) => x.status === "paid").length}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {Header}
      </div>

      {!hasAccess ? (
        <div className={`${cardClass} p-6 text-center`}>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Accès restreint</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Cette section est réservée aux utilisateurs <strong>Excellence</strong> ou aux administrateurs.
          </p>
          <Link
            to="/upgrade"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Passer à Excellence
          </Link>
        </div>
      ) : (
        <>
          {isTab("/invoices") && DashboardBlock}
          {Filters}
          {List}
        </>
      )}

      <InvoiceViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        invoice={viewInvoice}
        loading={viewLoading}
        onEdit={(inv) => {
          setIsViewOpen(false);
          setEditingInvoice(inv);
          setFormOpen(true);
        }}
        onRefetch={() => viewInvoice?.id && openView(viewInvoice.id)}
      />

      <InvoiceForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          if (isTab("/invoices/create")) navigate("/invoices");
        }}
        onSuccess={() => {
          fetchInvoices();
        }}
        invoice={editingInvoice}
      />
    </div>
  );
};

export default InvoicesPage;
