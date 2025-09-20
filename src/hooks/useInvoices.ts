// src/hooks/useInvoices.ts
import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  order_id?: string | null;
  number: string;
  status: "draft" | "sent" | "paid" | "overdue" | "canceled";
  currency: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  discount: number;
  total: number;
  notes?: string | null;
  terms?: string | null;
  tags?: string[] | null;
  template_id?: string | null; // ✅ ajouté
  created_at: string;

  client?: {
    id: string;
    name: string;
    email_primary?: string | null;
    company_name?: string | null;
  } | null;

  template?: {
    id: string;
    name: string;
    is_default: boolean;
  } | null;
}

export function useInvoices() {
  const { user } = useAuth();
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setItems([]);
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(id, name, email_primary, company_name),
          template:invoice_templates(id, name, is_default)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data || []) as Invoice[]);
    } catch (err) {
      console.error("[useInvoices] fetch error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) fetchInvoices();
  }, [user, fetchInvoices]);

  return { items, loading, refresh: fetchInvoices };
}
