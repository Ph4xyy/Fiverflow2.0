// src/utils/invoice.ts

export type Money = number | null | undefined;

export type InvoiceLine = {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total?: number; // calculé
  position?: number;
};

export type InvoiceCalcInput = {
  items: InvoiceLine[];
  tax_rate?: number | null; // en %
  discount?: number | null; // montant (pas %)
};

export type InvoiceCalcResult = {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
};

export const clamp2 = (n: Money) =>
  Math.round(((n ?? 0) as number) * 100) / 100;

export function computeLine(line: InvoiceLine): InvoiceLine {
  const qty = Number(line.quantity || 0);
  const price = Number(line.unit_price || 0);
  const total = clamp2(qty * price);
  return { ...line, line_total: total };
}

export function computeInvoice(input: InvoiceCalcInput): InvoiceCalcResult {
  const items = input.items.map(computeLine);
  const subtotal = clamp2(items.reduce((s, l) => s + (l.line_total || 0), 0));
  const taxRate = Number(input.tax_rate || 0);
  const discount = Number(input.discount || 0);

  const tax_amount = clamp2((subtotal - discount) * (taxRate / 100));
  const discount_amount = clamp2(discount);
  const total = clamp2(subtotal - discount_amount + tax_amount);

  return { subtotal, tax_amount, discount_amount, total };
}

export function normalizeItems(items: InvoiceLine[]): InvoiceLine[] {
  return items
    .map((l, idx) =>
      computeLine({
        ...l,
        position: idx + 1,
        description: l.description?.trim() || '',
        quantity: Number(l.quantity || 0),
        unit_price: Number(l.unit_price || 0),
      }),
    )
    .filter((l) => l.description || l.line_total! > 0);
}
