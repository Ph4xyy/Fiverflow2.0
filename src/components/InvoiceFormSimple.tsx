// src/components/InvoiceFormSimple.tsx - Formulaire de facture simplifié sur une seule page
import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, ShoppingCart } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

interface ClientOpt {
  id: string;
  name: string;
  platform?: string | null;
}

interface InvoiceLine {
  description: string;
  quantity: number | string;
  unit_price: number | string;
}

interface InvoiceFormSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InvoiceFormSimple: React.FC<InvoiceFormSimpleProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientOpt[]>([]);
  const [orders, setOrders] = useState<{id: string, title: string, budget: number}[]>([]);
  const [showImportOrders, setShowImportOrders] = useState(false);
  const [items, setItems] = useState<InvoiceLine[]>([
    { description: "", quantity: "1", unit_price: "0" }
  ]);

  const [form, setForm] = useState({
    client_id: "",
    currency: "USD",
    issue_date: "",
    due_date: "",
    tax_rate: 0,
    discount: 0,
    notes: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      if (!isSupabaseConfigured || !supabase || !user) {
        setClients([
          { id: "1", name: "Client Demo", platform: "Fiverr" },
        ]);
      } else {
        const { data: cData } = await supabase
          .from("clients")
          .select("id,name,platform")
          .eq("user_id", user.id)
          .order("name");
        if (cData) setClients(cData as ClientOpt[]);

        // Charger les commandes
        const { data: ordersData } = await supabase
          .from("orders")
          .select("id, title, budget")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);
        if (ordersData) setOrders(ordersData as {id: string, title: string, budget: number}[]);
      }

      // Définir les dates par défaut
      const today = new Date();
      const iso = today.toISOString().slice(0, 10);
      const in7 = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);
      setForm(f => ({ ...f, issue_date: iso, due_date: in7 }));
    };

    load();
  }, [isOpen, user]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: "1", unit_price: "0" }]);
  };

  const importFromOrder = (order: {id: string, title: string, budget: number}) => {
    if (order.budget && order.budget > 0) {
      setItems([
        ...items,
        { 
          description: order.title, 
          quantity: "1", 
          unit_price: order.budget.toString()
        }
      ]);
      toast.success("Commande importée");
      setShowImportOrders(false);
    } else {
      toast.error("Cette commande n'a pas de montant défini");
    }
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceLine, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Calculer les totaux
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity.replace(',', '.')) || 0 : item.quantity;
      const price = typeof item.unit_price === 'string' ? parseFloat(item.unit_price.replace(',', '.')) || 0 : item.unit_price;
      return sum + (qty * price);
    }, 0);
    const discountAmount = subtotal * (form.discount / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * (form.tax_rate / 100);
    const total = subtotalAfterDiscount + taxAmount;

    return { subtotal, discountAmount, subtotalAfterDiscount, taxAmount, total };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.client_id) {
      toast.error("Sélectionnez un client");
      return;
    }

    if (items.every(item => {
      const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity.replace(',', '.')) || 0 : item.quantity;
      const price = typeof item.unit_price === 'string' ? parseFloat(item.unit_price.replace(',', '.')) || 0 : item.unit_price;
      return !item.description || qty === 0 || price === 0;
    })) {
      toast.error("Ajoutez au moins un article valide");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Création de la facture...");

    try {
      if (!isSupabaseConfigured || !supabase || !user) {
        toast.error("Configuration base de données manquante", { id: toastId });
        return;
      }

      // Générer le numéro de facture
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

      // Créer la facture
      const { data: newInvoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          number: invoiceNumber,
          client_id: form.client_id,
          issue_date: form.issue_date,
          due_date: form.due_date,
          currency: form.currency,
          status: "draft",
          subtotal: totals.subtotal,
          tax_rate: form.tax_rate,
          discount: totals.discountAmount,
          total: totals.total,
          notes: form.notes || null,
        })
        .select("id")
        .single();

      if (invoiceError) throw invoiceError;

      // Ajouter les articles
      if (items.length > 0) {
        const itemsPayload = items
          .filter(item => {
            const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity.replace(',', '.')) || 0 : item.quantity;
            const price = typeof item.unit_price === 'string' ? parseFloat(item.unit_price.replace(',', '.')) || 0 : item.unit_price;
            return item.description && qty > 0 && price > 0;
          })
          .map((item, index) => {
            const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity.replace(',', '.')) || 0 : item.quantity;
            const price = typeof item.unit_price === 'string' ? parseFloat(item.unit_price.replace(',', '.')) || 0 : item.unit_price;
            return {
              invoice_id: newInvoice.id,
              description: item.description,
              quantity: qty,
              unit_price: price,
              line_total: qty * price,
              position: index + 1,
            };
          });

        if (itemsPayload.length > 0) {
          const { error: itemsError } = await supabase
            .from("invoice_items")
            .insert(itemsPayload);

          if (itemsError) throw itemsError;
        }
      }

      toast.success("Facture créée avec succès", { id: toastId });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur création facture:", err);
      toast.error(err.message || "Erreur lors de la création", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#11151D] rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-[#1C2230] my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1C2230] sticky top-0 bg-[#11151D] z-10">
          <h2 className="text-xl font-semibold text-white">Nouvelle Facture</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations Client */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Client *
              </label>
              <select
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg border-[#1C2230] text-slate-100 bg-[#11151D]"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date d'émission *
              </label>
              <input
                type="date"
                value={form.issue_date}
                onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg border-[#1C2230] text-slate-100 bg-[#11151D]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date d'échéance *
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg border-[#1C2230] text-slate-100 bg-[#11151D]"
                required
              />
            </div>
          </div>

          {/* Articles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Articles</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportOrders(!showImportOrders)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <ShoppingCart size={18} />
                  Importer commandes
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  Ajouter
                </button>
              </div>
            </div>

            {/* Modal d'import des commandes */}
            {showImportOrders && (
              <div className="mb-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">Sélectionnez une commande à importer</h4>
                  <button
                    type="button"
                    onClick={() => setShowImportOrders(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {orders.length === 0 ? (
                    <p className="text-sm text-slate-400">Aucune commande disponible</p>
                  ) : (
                    orders.map(order => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => importFromOrder(order)}
                        className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">{order.title}</span>
                          <span className="text-sm font-medium text-green-400">
                            ${order.budget?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg border-[#1C2230] text-slate-100 bg-[#11151D] placeholder-slate-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Qté"
                      value={item.quantity || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Permettre les nombres avec . ou ,
                        if (val === '' || /^\d*[.,]?\d*$/.test(val)) {
                          updateItem(index, 'quantity', val);
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg border-[#1C2230] text-slate-100 bg-[#11151D] placeholder-slate-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Prix unit."
                      value={item.unit_price || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Permettre les nombres avec . ou ,
                        if (val === '' || /^\d*[.,]?\d*$/.test(val)) {
                          updateItem(index, 'unit_price', val);
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg border-[#1C2230] text-slate-100 bg-[#11151D] placeholder-slate-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="px-3 py-2 bg-slate-800 rounded-lg text-white text-right">
                      ${(() => {
                        const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity.replace(',', '.')) || 0 : item.quantity;
                        const price = typeof item.unit_price === 'string' ? parseFloat(item.unit_price.replace(',', '.')) || 0 : item.unit_price;
                        return (qty * price).toFixed(2);
                      })()}
                    </div>
                  </div>
                  <div className="col-span-1">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Taxes et Remises */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Taxe (%)
              </label>
              <input
                type="text"
                value={form.tax_rate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*[.,]?\d*$/.test(val)) {
                    const normalizedVal = val.replace(',', '.');
                    setForm({ ...form, tax_rate: normalizedVal === '' ? 0 : parseFloat(normalizedVal) || 0 });
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg border-[#1C2230] text-slate-100 bg-[#11151D]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Remise (%)
              </label>
              <input
                type="text"
                value={form.discount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*[.,]?\d*$/.test(val)) {
                    const normalizedVal = val.replace(',', '.');
                    setForm({ ...form, discount: normalizedVal === '' ? 0 : parseFloat(normalizedVal) || 0 });
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg border-[#1C2230] text-slate-100 bg-[#11151D]"
              />
            </div>
          </div>

          {/* Totaux */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Sous-total:</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Remise:</span>
                  <span>-${totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Taxe ({form.tax_rate}%):</span>
                  <span>${totals.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-slate-700">
                <span>Total:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg border-[#1C2230] text-slate-100 bg-[#11151D] placeholder-slate-500"
              placeholder="Ajoutez des notes ou instructions..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#1C2230]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Création..." : "Créer la facture"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceFormSimple;
