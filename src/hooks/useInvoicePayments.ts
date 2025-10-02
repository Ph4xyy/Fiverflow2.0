// src/hooks/useInvoicePayments.ts
import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  amount: number;
  paid_at: string;
  method?: string;
  note?: string;
  created_at: string;
}

export interface CreateInvoicePaymentData {
  invoice_id: string;
  amount: number;
  paid_at: string;
  method?: string;
  note?: string;
}

export interface UpdateInvoicePaymentData {
  amount?: number;
  paid_at?: string;
  method?: string;
  note?: string;
}

export function useInvoicePayments(invoiceId?: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (id?: string) => {
    const targetInvoiceId = id || invoiceId;
    if (!targetInvoiceId || !user) {
      setPayments([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo data
        const demo: InvoicePayment[] = [
        {
          id: `demo-payment-1-${targetInvoiceId}`,
          invoice_id: targetInvoiceId,
          amount: 500,
          paid_at: new Date().toISOString().split('T')[0],
          method: "Bank Transfer",
          note: "Partial payment",
          created_at: new Date().toISOString()
        }
      ];
      setPayments(demo);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("invoice_payments")
        .select("*")
        .eq("invoice_id", targetInvoiceId)
        .order("paid_at", { ascending: false });

      if (fetchError) throw fetchError;
      setPayments(data || []);
    } catch (err: any) {
      console.error("[useInvoicePayments] fetchPayments error:", err);
      setError(err.message || "Failed to fetch invoice payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [user, invoiceId]);

  useEffect(() => {
    if (invoiceId) {
      fetchPayments();
    }
  }, [invoiceId]); // 🔥 FIXED: Remove fetchPayments from dependencies to prevent infinite loops

  const createPayment = useCallback(async (data: CreateInvoicePaymentData) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      const newPayment: InvoicePayment = {
        id: `demo-payment-${Date.now()}`,
        invoice_id: data.invoice_id,
        amount: data.amount,
        paid_at: data.paid_at,
        method: data.method,
        note: data.note,
        created_at: new Date().toISOString()
      };
      setPayments(prev => [newPayment, ...prev]);
      toast.success("Payment recorded successfully");
      return newPayment;
    }

    try {
      setError(null);
      
      const { data: result, error: createError } = await supabase
        .from("invoice_payments")
        .insert([{
          invoice_id: data.invoice_id,
          amount: data.amount,
          paid_at: data.paid_at,
          method: data.method,
          note: data.note
        }])
        .select()
        .single();

      if (createError) throw createError;
      
      setPayments(prev => [result, ...prev]);
      toast.success("Payment recorded successfully");
      return result;
    } catch (err: any) {
      console.error("[useInvoicePayments] createPayment error:", err);
      const errorMessage = err.message || "Failed to create payment";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user]);

  const updatePayment = useCallback(async (id: string, data: UpdateInvoicePaymentData) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      setPayments(prev => prev.map(payment => 
        payment.id === id ? { ...payment, ...data } : payment
      ));
      toast.success("Payment updated successfully");
      return;
    }

    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from("invoice_payments")
        .update(data)
        .eq("id", id);

      if (updateError) throw updateError;
      
      await fetchPayments();
      toast.success("Payment updated successfully");
    } catch (err: any) {
      console.error("[useInvoicePayments] updatePayment error:", err);
      const errorMessage = err.message || "Failed to update payment";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user]); // 🔥 FIXED: Remove fetchPayments from dependencies to prevent infinite loops

  const deletePayment = useCallback(async (id: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      setPayments(prev => prev.filter(payment => payment.id !== id));
      toast.success("Payment deleted successfully");
      return;
    }

    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from("invoice_payments")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      
      setPayments(prev => prev.filter(payment => payment.id !== id));
      toast.success("Payment deleted successfully");
    } catch (err: any) {
      console.error("[useInvoicePayments] deletePayment error:", err);
      const errorMessage = err.message || "Failed to delete payment";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [user]);

  const getPayment = useCallback(async (id: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      return payments.find(payment => payment.id === id);
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("invoice_payments")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err: any) {
      console.error("[useInvoicePayments] getPayment error:", err);
      const errorMessage = err.message || "Failed to fetch payment";
      setError(errorMessage);
      throw err;
    }
  }, [user, payments]);

  const calculateTotalPaid = useCallback(() => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  }, [payments]);

  const calculateRemainingBalance = useCallback((invoiceTotal: number) => {
    const totalPaid = calculateTotalPaid();
    return Math.max(0, invoiceTotal - totalPaid);
  }, [calculateTotalPaid]);

  const isFullyPaid = useCallback((invoiceTotal: number) => {
    const totalPaid = calculateTotalPaid();
    return totalPaid >= invoiceTotal;
  }, [calculateTotalPaid]);

  const getPaymentStatus = useCallback((invoiceTotal: number) => {
    const totalPaid = calculateTotalPaid();
    const remaining = invoiceTotal - totalPaid;
    
    if (totalPaid === 0) {
      return { status: 'unpaid', totalPaid, remaining };
    } else if (remaining <= 0) {
      return { status: 'paid', totalPaid, remaining: 0 };
    } else {
      return { status: 'partial', totalPaid, remaining };
    }
  }, [calculateTotalPaid]);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    getPayment,
    calculateTotalPaid,
    calculateRemainingBalance,
    isFullyPaid,
    getPaymentStatus
  };
}
