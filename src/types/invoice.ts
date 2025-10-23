// src/types/invoice.ts
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  position?: number;
}

export interface InvoicePayment {
  id?: string;
  amount: number;
  paid_at: string; // ISO date
  method?: string | null;
  note?: string | null;
  created_at?: string;
}

export interface InvoiceWithClient {
  id: string;
  user_id: string;
  client_id: string;
  number: string;
  status: InvoiceStatus;
  currency: string | null;
  issue_date: string; // ISO yyyy-mm-dd
  due_date: string;   // ISO yyyy-mm-dd
  subtotal: number | null;
  tax_rate: number | null;
  discount: number | null;
  total: number | null;
  notes?: string | null;
  terms?: string | null;
  tags?: string[] | null;
  created_at?: string;

  clients: {
    id: string;
    name: string;
    platform?: string | null;
  };
}
