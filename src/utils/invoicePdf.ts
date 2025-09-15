// src/utils/invoicePdf.ts
import { jsPDF } from "jspdf";

type InvItem = {
  description: string;
  quantity: number;
  unit_price: number;
  line_total?: number;
};

type InvoiceLike = {
  number?: string | null;
  currency?: string | null;
  issue_date?: string | null;
  due_date?: string | null;
  clients?: { name?: string | null } | null;
  items?: InvItem[];
  subtotal?: number | null;
  discount?: number | null;
  tax_rate?: number | null;
  tax_amount?: number | null;
  total?: number | null;
};

/** Util: format simple */
const fmt = (n: any) => (n == null ? "0.00" : Number(n).toFixed(2));
const safe = (s: any) => (s == null ? "—" : String(s));

/** Génère le jsPDF (mais ne télécharge pas) */
export async function generateInvoicePdf(invoice: InvoiceLike) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48; // 2/3 inch
  let y = margin;

  const currency = invoice?.currency || "USD";

  // En‑tête
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INVOICE", margin, y);
  y += 26;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${safe(invoice?.number)}`, margin, y);
  y += 16;
  doc.text(`Issue date: ${invoice?.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : "—"}`, margin, y);
  y += 16;
  doc.text(`Due date: ${invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}`, margin, y);

  // Client
  y += 28;
  doc.setFont("helvetica", "bold");
  doc.text("Billed to:", margin, y);
  doc.setFont("helvetica", "normal");
  y += 16;
  doc.text(safe(invoice?.clients?.name), margin, y);

  // Lignes
  y += 32;
  doc.setFont("helvetica", "bold");
  doc.text("Items", margin, y);
  y += 14;

  // En‑têtes colonnes
  doc.setFontSize(10);
  const colDesc = margin;
  const colQty = 340;
  const colUP = 400;
  const colTotal = 480;

  doc.text("Description", colDesc, y);
  doc.text("Qty", colQty, y);
  doc.text("Unit", colUP, y);
  doc.text("Total", colTotal, y);
  y += 10;
  doc.setDrawColor(200);
  doc.line(margin, y, 548, y);

  doc.setFont("helvetica", "normal");
  y += 16;

  const items = invoice?.items || [];
  items.forEach((it) => {
    // gestion bas de page simple
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    const lineTotal = it.line_total != null ? it.line_total : Number(it.quantity) * Number(it.unit_price);
    // description (wrap basique)
    const descLines = doc.splitTextToSize(it.description || "—", colQty - colDesc - 12);
    doc.text(descLines, colDesc, y);
    doc.text(String(it.quantity ?? 0), colQty, y);
    doc.text(fmt(it.unit_price), colUP, y);
    doc.text(fmt(lineTotal), colTotal, y, { align: "left" });

    // avancer selon hauteur du texte
    const lineHeight = Array.isArray(descLines) ? descLines.length * 12 : 12;
    y += Math.max(16, lineHeight + 4);
  });

  // Totaux
  y += 10;
  if (y > 720) {
    doc.addPage();
    y = margin;
  }
  doc.setDrawColor(200);
  doc.line(margin, y, 548, y);
  y += 16;

  const rightLabelX = 400;
  const rightValueX = 548;

  doc.text("Subtotal:", rightLabelX, y, { align: "left" });
  doc.text(`${fmt(invoice?.subtotal)} ${currency}`, rightValueX, y, { align: "right" });
  y += 16;

  doc.text("Discount:", rightLabelX, y, { align: "left" });
  doc.text(`${fmt(invoice?.discount)} ${currency}`, rightValueX, y, { align: "right" });
  y += 16;

  const taxPct = Number(invoice?.tax_rate || 0);
  const taxAmount =
    invoice?.tax_amount ??
    ((Number(invoice?.subtotal || 0) - Number(invoice?.discount || 0)) * taxPct) / 100;

  doc.text(`Tax (${fmt(taxPct)}%):`, rightLabelX, y, { align: "left" });
  doc.text(`${fmt(taxAmount)} ${currency}`, rightValueX, y, { align: "right" });
  y += 16;

  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", rightLabelX, y, { align: "left" });
  doc.text(`${fmt(invoice?.total)} ${currency}`, rightValueX, y, { align: "right" });

  // Pied (facultatif)
  y += 36;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "Thank you for your business.",
    margin,
    y
  );

  return doc;
}

/** Télécharge le PDF (utilisé par InvoiceViewModal) */
export async function downloadInvoicePdf(invoice: InvoiceLike) {
  const doc = await generateInvoicePdf(invoice);
  const filename = `${invoice?.number || "invoice"}.pdf`;
  doc.save(filename);
}

/** Retourne le PDF en base64 (pour email) */
export async function generateInvoicePdfBase64(invoice: InvoiceLike) {
  const doc = await generateInvoicePdf(invoice);
  // "data:application/pdf;...;base64,<payload>"
  const dataUri = doc.output("datauristring");
  return dataUri.split(",")[1];
}
