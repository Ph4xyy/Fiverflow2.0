// src/pages/InvoicesPageNew.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cardClass } from "@/components/Layout";
import ModernButton from "@/components/ModernButton";
import InvoiceFormSimple from "@/components/InvoiceFormSimple";
import InvoiceViewModal from "@/components/InvoiceViewModal";
import { useAuth } from "@/contexts/AuthContext";

import { usePlanRestrictions } from "@/hooks/usePlanRestrictions";
import { useInvoices } from "@/hooks/useInvoices";
import toast from "react-hot-toast";
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, Send, CheckCircle2, FileText,
} from "lucide-react";
import { formatDate, formatMoney } from "@/utils/format";

const STATUSES = ["draft", "sent", "paid", "overdue", "canceled"] as const;

const PageInvoices: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restrictions, checkAccess } = usePlanRestrictions();
  const { 
    invoices, 
    loading, 
    error, 
    createInvoice, 
    updateInvoice, 
    deleteInvoice, 
    markAsPaid, 
    sendInvoice,
    fetchInvoices
  } = useInvoices();

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

  // Filter invoices based on search and status
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.number.toLowerCase().includes(term) ||
        invoice.clients.name.toLowerCase().includes(term)
      );
    }

    if (status) {
      filtered = filtered.filter(invoice => invoice.status === status);
    }

    return filtered;
  }, [invoices, search, status]);

  useEffect(() => {
    if (isTab("/invoices/create")) {
      setEditingInvoice(null);
      setFormOpen(true);
    }
  }, [isTab]);

  const handleCreate = useCallback(async (data: any) => {
    try {
      await createInvoice(data);
      setFormOpen(false);
      setEditingInvoice(null);
    } catch (e) {
      console.error("[Invoices] create error:", e);
    }
  }, [createInvoice]);

  const handleUpdate = useCallback(async (id: string, data: any) => {
    try {
      await updateInvoice(id, data);
      setFormOpen(false);
      setEditingInvoice(null);
    } catch (e) {
      console.error("[Invoices] update error:", e);
    }
  }, [updateInvoice]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Supprimer cette facture ?")) return;
    try {
      await deleteInvoice(id);
    } catch (e) {
      console.error("[Invoices] delete error:", e);
    }
  }, [deleteInvoice]);

  const handleMarkPaid = useCallback(async (id: string) => {
    try {
      await markAsPaid(id);
    } catch (e) {
      console.error("[Invoices] mark paid error:", e);
    }
  }, [markAsPaid]);

  const handleSend = useCallback(async (id: string) => {
    try {
      await sendInvoice(id);
    } catch (e) {
      console.error("[Invoices] send error:", e);
    }
  }, [sendInvoice]);

  const handleView = useCallback(async (id: string) => {
    setIsViewOpen(true);
    setViewLoading(true);
    setViewInvoice(null);

    try {
      // For now, we'll use the invoice data from the list
      // In a real implementation, you might want to fetch full details
      const invoice = invoices.find(inv => inv.id === id);
      if (invoice) {
        setViewInvoice(invoice);
      }
    } catch (e) {
      console.error("[Invoices] view error:", e);
      toast.error('Unable to load invoice');
      setIsViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  }, [invoices]);

  const handleEdit = useCallback((invoice: any) => {
    setEditingInvoice(invoice);
    setFormOpen(true);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "sent": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "paid": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "overdue": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "canceled": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft": return 'Draft';
      case "sent": return 'Sent';
      case "paid": return 'Paid';
      case "overdue": return 'Overdue';
      case "canceled": return 'Canceled';
      default: return status;
    }
  };

  if (!hasAccess) {
    return (
      <div className="p-6">
        <div className="text-center">
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
             Access restricted
           </h2>
           <p className="text-gray-600 dark:text-gray-400">
             You don't have access to this feature.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">
             Invoices
           </h1>
           <p className="text-gray-400">
             Manage your invoices and track payments
           </p>
        </div>
        <ModernButton
          onClick={() => {
            setEditingInvoice(null);
            setFormOpen(true);
          }}
          size="sm"
        >
           <Plus className="w-4 h-4 mr-2" />
           Create Invoice
        </ModernButton>
      </div>

      {/* Invoice Templates Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoice Templates</h2>
            <p className="text-gray-600 dark:text-gray-400">Create and manage your invoice templates</p>
          </div>
          <ModernButton
            onClick={() => navigate('/invoices/templates')}
            size="sm"
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Manage Templates
          </ModernButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Standard Template</h3>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">Default</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Professional invoice template</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Service Template</h3>
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">Custom</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">For service-based businesses</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Product Template</h3>
              <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">Custom</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">For product-based businesses</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by number or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {getStatusText(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No invoices
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {search || status ? "No invoices match your criteria." : "Start by creating your first invoice."}
          </p>
          {!search && !status && (
            <button
              onClick={() => {
                setEditingInvoice(null);
                setFormOpen(true);
              }}
          className="inline-flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {invoice.clients.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {invoice.clients.platform}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(invoice.issue_date)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Échéance: {formatDate(invoice.due_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatMoney(invoice.total, invoice.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(invoice.id)}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-200"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {invoice.status === "draft" && (
                          <button
                            onClick={() => handleSend(invoice.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Envoyer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {invoice.status === "sent" && (
                          <button
                            onClick={() => handleMarkPaid(invoice.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Marquer comme payée"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
        </div>
      )}

      {/* Forms and Modals */}
      {formOpen && (
        <InvoiceFormSimple
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingInvoice(null);
          }}
          onSuccess={() => {
            setFormOpen(false);
            setEditingInvoice(null);
            fetchInvoices(); // Refresh the invoice list
          }}
        />
      )}

      {isViewOpen && (
        <InvoiceViewModal
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setViewInvoice(null);
          }}
          invoice={viewInvoice}
        />
      )}
    </div>
  );
};

export default PageInvoices;
