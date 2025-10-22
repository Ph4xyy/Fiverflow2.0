// src/hooks/useInvoiceTemplates.ts
import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { defaultSchema } from "@/utils/invoiceTemplate";
import type { InvoiceTemplate, TemplateSchema } from "@/types/invoiceTemplate";

export function useInvoiceTemplates(userId?: string | null) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InvoiceTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      console.error('Supabase not configured - cannot fetch invoice templates');
      setItems([]);
      setLoading(false);
      setError('Database not configured');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("invoice_templates")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data || []) as unknown as InvoiceTemplate[]);
    } catch (e: any) {
      console.error("[useInvoiceTemplates] fetchAll", e);
      setError(e.message || "Load error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [userId]);

  const create = useCallback(
    async (name: string) => {
      const schema = defaultSchema();

      if (!isSupabaseConfigured || !supabase || !userId) {
        console.error('Supabase not configured - cannot create invoice template');
        throw new Error('Database not configured');
      }

      const { data, error } = await supabase
        .from("invoice_templates")
        .insert([
          {
            user_id: userId,
            name,
            is_default: items.length === 0,
            schema,
            variables: schema.variables || [],
          },
        ])
        .select("id")
        .single();

      if (error) throw error;
      await fetchAll();
      return data as { id: string };
    },
    [userId, items.length]
  );

  const update = useCallback(
    async (
      id: string,
      patch: Partial<{ name: string; is_default: boolean; schema: TemplateSchema }>
    ) => {
      if (!isSupabaseConfigured || !supabase) {
        setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } as InvoiceTemplate : t)));
        return;
      }

      const { error } = await supabase.from("invoice_templates").update(patch).eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    []
  );

  const remove = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured || !supabase) {
        setItems((prev) => prev.filter((t) => t.id !== id));
        return;
      }
      await supabase.from("invoice_templates").delete().eq("id", id);
      await fetchAll();
    },
    []
  );

  const duplicate = useCallback(
    async (id: string) => {
      const tpl = items.find((t) => t.id === id);
      if (!tpl) return;
      const copiedName = `${tpl.name} (copy)`;

      if (!isSupabaseConfigured || !supabase || !userId) {
        console.error('Supabase not configured - cannot duplicate invoice template');
        throw new Error('Database not configured');
      }

      const { error } = await supabase.from("invoice_templates").insert([
        {
          user_id: userId,
          name: copiedName,
          is_default: false,
          schema: tpl.schema,
          variables: tpl.variables,
        },
      ]);
      if (error) throw error;
      await fetchAll();
    },
    [items, userId]
  );

  const setDefault = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured || !supabase || !userId) {
        setItems((prev) => prev.map((t) => ({ ...t, is_default: t.id === id })));
        return;
      }

      await supabase.from("invoice_templates").update({ is_default: false }).eq("user_id", userId);
      await supabase.from("invoice_templates").update({ is_default: true }).eq("id", id);
      await fetchAll();
    },
    [userId]
  );

  return { loading, items, error, fetchAll, create, update, remove, duplicate, setDefault };
}
