// src/hooks/useInvoices.ts
import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export interface Invoice {
  id: string;
  user_id: string;
  number: string;
  client_id: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  currency: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  discount: number;
  total: number;
  notes?: string;
  terms?: string;
  tags?: string[];
  template_id?: string;
  created_at: string;
  updated_at: string;
  clients: {
    id: string;
    name: string;
    platform?: string;
  };
}

export interface CreateInvoiceData {
  client_id: string;
  currency?: string;
  issue_date: string;
  due_date: string;
  notes?: string;
  terms?: string;
  tags?: string[];
  template_id?: string;
}

export interface UpdateInvoiceData {
  client_id?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  currency?: string;
  issue_date?: string;
  due_date?: string;
  notes?: string;
  terms?: string;
  tags?: string[];
  template_id?: string;
}

export function useInvoices() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo data
      const demo: Invoice[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `demo-invoice-${i + 1}`,
        user_id: user.id,
        number: `INV-2025-${String(i + 1).padStart(4, "0")}`,
        client_id: "demo-client",
        status: (["draft", "sent", "paid", "overdue"][i % 4] as any),
        currency: "USD",
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        subtotal: 100 + i * 25,
        tax_rate: 20,
        discount: i % 3 === 0 ? 10 : 0,
        total: 100 + i * 25 + 18,
        notes: `Demo invoice ${i + 1}`,
        terms: "Payment due in 7 days",
        tags: ["demo", "test"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clients: {
          id: "demo-client",
          name: i % 2 ? "Acme Inc" : "John Doe",
          platform: i % 2 ? "Fiverr" : "Upwork"
        }
      }));
      setInvoices(demo);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("invoices")
        .select(`
          id,
          user_id,
          number,
          client_id,
          status,
          currency,
          issue_date,
          due_date,
          subtotal,
          tax_rate,
          discount,
          total,
          notes,
          terms,
          tags,
          template_id,
          created_at,
          updated_at,
          clients!inner(
            id,
            name,
            platform
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setInvoices(data || []);
    } catch (err: any) {
      console.error("[useInvoices] fetchInvoices error:", err);
      setError(err.message || "Failed to fetch invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const createInvoice = useCallback(async (data: CreateInvoiceData) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      const newInvoice: Invoice = {
        id: `demo-invoice-${Date.now()}`,
        user_id: user.id,
        number: `INV-2025-${String(invoices.length + 1).padStart(4, "0")}`,
        client_id: data.client_id,
        status: 'draft',
        currency: data.currency || 'USD',
        issue_date: data.issue_date,
        due_date: data.due_date,
        subtotal: 0,
        tax_rate: 0,
        discount: 0,
        total: 0,
        notes: data.notes,
        terms: data.terms,
        tags: data.tags,
        template_id: data.template_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clients: {
          id: data.client_id,
          name: "Demo Client",
          platform: "Demo"
        }
      };
      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    }

    try {
      setError(null);
      
      const { data: result, error: createError } = await supabase
        .from("invoices")
        .insert([{
          user_id: user.id,
          client_id: data.client_id,
          currency: data.currency || 'USD',
          issue_date: data.issue_date,
          due_date: data.due_date,
          notes: data.notes,
          terms: data.terms,
          tags: data.tags,
          template_id: data.template_id
        }])
        .select(`
          id,
          user_id,
          number,
          client_id,
          status,
          currency,
          issue_date,
          due_date,
          subtotal,
          tax_rate,
          discount,
          total,
          notes,
          terms,
          tags,
          template_id,
          created_at,
          updated_at,
          clients!inner(
            id,
            name,
            platform
          )
        `)
        .single();

      if (createError) throw createError;
      
      setInvoices(prev => [result, ...prev]);
      toast.success("Invoice created successfully");
      return result;
    } catch (err: any) {
      console.error("[useInvoices] createInvoice error:", err);
      const errorMessage = err.message || "Failed to create invoice";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user, invoices.length]);

  const updateInvoice = useCallback(async (id: string, data: UpdateInvoiceData) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? { ...invoice, ...data, updated_at: new Date().toISOString() } : invoice
      ));
      return;
    }

    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from("invoices")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      
      await fetchInvoices(); // Refresh the list
      toast.success("Invoice updated successfully");
    } catch (err: any) {
      console.error("[useInvoices] updateInvoice error:", err);
      const errorMessage = err.message || "Failed to update invoice";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user, fetchInvoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      toast.success("Invoice deleted successfully");
      return;
    }

    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
      
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      toast.success("Invoice deleted successfully");
    } catch (err: any) {
      console.error("[useInvoices] deleteInvoice error:", err);
      const errorMessage = err.message || "Failed to delete invoice";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user]);

  const getInvoice = useCallback(async (id: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      return invoices.find(invoice => invoice.id === id);
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("invoices")
        .select(`
          id,
          user_id,
          number,
          client_id,
          status,
          currency,
          issue_date,
          due_date,
          subtotal,
          tax_rate,
          discount,
          total,
          notes,
          terms,
          tags,
          template_id,
          created_at,
          updated_at,
          clients!inner(
            id,
            name,
            platform
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err: any) {
      console.error("[useInvoices] getInvoice error:", err);
      const errorMessage = err.message || "Failed to fetch invoice";
      setError(errorMessage);
      throw err;
    }
  }, [user, invoices]);

  const markAsPaid = useCallback(async (id: string, paymentAmount?: number) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? { ...invoice, status: 'paid', updated_at: new Date().toISOString() } : invoice
      ));
      toast.success("Invoice marked as paid");
      return;
    }

    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from("invoices")
        .update({ status: 'paid' })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      
      await fetchInvoices(); // Refresh the list
      toast.success("Invoice marked as paid");
    } catch (err: any) {
      console.error("[useInvoices] markAsPaid error:", err);
      const errorMessage = err.message || "Failed to mark invoice as paid";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user, fetchInvoices]);

  const sendInvoice = useCallback(async (id: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? { ...invoice, status: 'sent', updated_at: new Date().toISOString() } : invoice
      ));
      toast.success("Invoice sent successfully");
      return;
    }

    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from("invoices")
        .update({ status: 'sent' })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      
      await fetchInvoices(); // Refresh the list
      toast.success("Invoice sent successfully");
    } catch (err: any) {
      console.error("[useInvoices] sendInvoice error:", err);
      const errorMessage = err.message || "Failed to send invoice";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user, fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    markAsPaid,
    sendInvoice
  };
}