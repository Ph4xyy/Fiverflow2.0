// src/hooks/useInvoiceItems.ts
import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  position: number;
  created_at: string;
}

export interface CreateInvoiceItemData {
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  position?: number;
}

export interface UpdateInvoiceItemData {
  description?: string;
  quantity?: number;
  unit_price?: number;
  position?: number;
}

export function useInvoiceItems(invoiceId?: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (id?: string) => {
    const targetInvoiceId = id || invoiceId;
    if (!targetInvoiceId || !user) {
      setItems([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo data
      const demo: InvoiceItem[] = [
        {
          id: `demo-item-1-${targetInvoiceId}`,
          invoice_id: targetInvoiceId,
          description: "Web Development",
          quantity: 10,
          unit_price: 75,
          line_total: 750,
          position: 1,
          created_at: new Date().toISOString()
        },
        {
          id: `demo-item-2-${targetInvoiceId}`,
          invoice_id: targetInvoiceId,
          description: "UI/UX Design",
          quantity: 5,
          unit_price: 100,
          line_total: 500,
          position: 2,
          created_at: new Date().toISOString()
        }
      ];
      setItems(demo);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", targetInvoiceId)
        .order("position", { ascending: true });

      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err: any) {
      console.error("[useInvoiceItems] fetchItems error:", err);
      setError(err.message || "Failed to fetch invoice items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, invoiceId]);

  useEffect(() => {
    if (invoiceId) {
      fetchItems();
    }
  }, [fetchItems, invoiceId]);

  const createItem = useCallback(async (data: CreateInvoiceItemData) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const lineTotal = data.quantity * data.unit_price;

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      const newItem: InvoiceItem = {
        id: `demo-item-${Date.now()}`,
        invoice_id: data.invoice_id,
        description: data.description,
        quantity: data.quantity,
        unit_price: data.unit_price,
        line_total: lineTotal,
        position: data.position || items.length + 1,
        created_at: new Date().toISOString()
      };
      setItems(prev => [...prev, newItem].sort((a, b) => a.position - b.position));
      toast.success("Item added successfully");
      return newItem;
    }

    try {
      setError(null);
      
      const { data: result, error: createError } = await supabase
        .from("invoice_items")
        .insert([{
          invoice_id: data.invoice_id,
          description: data.description,
          quantity: data.quantity,
          unit_price: data.unit_price,
          line_total: lineTotal,
          position: data.position || items.length + 1
        }])
        .select()
        .single();

      if (createError) throw createError;
      
      setItems(prev => [...prev, result].sort((a, b) => a.position - b.position));
      toast.success("Item added successfully");
      return result;
    } catch (err: any) {
      console.error("[useInvoiceItems] createItem error:", err);
      const errorMessage = err.message || "Failed to create item";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user, items.length]);

  const updateItem = useCallback(async (id: string, data: UpdateInvoiceItemData) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Calculate line total if quantity or unit_price changed
    const existingItem = items.find(item => item.id === id);
    if (!existingItem) {
      throw new Error("Item not found");
    }

    const newQuantity = data.quantity ?? existingItem.quantity;
    const newUnitPrice = data.unit_price ?? existingItem.unit_price;
    const newLineTotal = newQuantity * newUnitPrice;

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      setItems(prev => prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              ...data, 
              line_total: newLineTotal,
              quantity: newQuantity,
              unit_price: newUnitPrice
            } 
          : item
      ));
      toast.success("Item updated successfully");
      return;
    }

    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from("invoice_items")
        .update({
          ...data,
          line_total: newLineTotal,
          quantity: newQuantity,
          unit_price: newUnitPrice
        })
        .eq("id", id);

      if (updateError) throw updateError;
      
      await fetchItems();
      toast.success("Item updated successfully");
    } catch (err: any) {
      console.error("[useInvoiceItems] updateItem error:", err);
      const errorMessage = err.message || "Failed to update item";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user, items, fetchItems]);

  const deleteItem = useCallback(async (id: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success("Item deleted successfully");
      return;
    }

    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success("Item deleted successfully");
    } catch (err: any) {
      console.error("[useInvoiceItems] deleteItem error:", err);
      const errorMessage = err.message || "Failed to delete item";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user]);

  const reorderItems = useCallback(async (itemIds: string[]) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      const reorderedItems = itemIds.map((id, index) => {
        const item = items.find(item => item.id === id);
        return item ? { ...item, position: index + 1 } : null;
      }).filter(Boolean) as InvoiceItem[];
      
      setItems(reorderedItems);
      toast.success("Items reordered successfully");
      return;
    }

    try {
      setError(null);
      
      // Update positions in batch
      const updates = itemIds.map((id, index) => ({
        id,
        position: index + 1
      }));

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from("invoice_items")
          .update({ position: update.position })
          .eq("id", update.id);

        if (updateError) throw updateError;
      }
      
      await fetchItems();
      toast.success("Items reordered successfully");
    } catch (err: any) {
      console.error("[useInvoiceItems] reorderItems error:", err);
      const errorMessage = err.message || "Failed to reorder items";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user, items, fetchItems]);

  const getItem = useCallback(async (id: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      return items.find(item => item.id === id);
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err: any) {
      console.error("[useInvoiceItems] getItem error:", err);
      const errorMessage = err.message || "Failed to fetch item";
      setError(errorMessage);
      throw err;
    }
  }, [user, items]);

  const calculateSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + item.line_total, 0);
  }, [items]);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
    getItem,
    calculateSubtotal
  };
}

