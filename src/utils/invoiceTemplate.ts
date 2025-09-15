import type { TemplateSchema } from "@/types/invoiceTemplate";
import type { InvoiceItem } from "@/types/invoice";
import { jsPDF } from "jspdf";

type RenderData = {
  company?: { name?: string; logoUrl?: string | null; address?: string };
  client?: { name?: string; email?: string; address?: string };
  invoice: {
    number?: string;
    currency?: string | null;
    issue_date?: string | null;
    due_date?: string | null;
    items?: InvoiceItem[];
    subtotal?: number | null;
    discount?: number | null;
    tax_rate?: number | null;
    tax_amount?: number | null;
    total?: number | null;
    notes?: string | null;
  };
};

export function defaultSchema(): TemplateSchema {
  return {
    style: {
      primaryColor: "#2563eb",
      secondaryColor: "#111827",
      fontFamily: "helvetica",
      logoUrl: null,
      logoWidth: 120,
      pageSize: "A4",
      margin: 48,
      tableStripe: true,
    },
    sections: {
      header: { visible: true, label: "INVOICE" },
      sellerInfo: { visible: true },
      clientInfo: { visible: true, label: "Billed to:" },
      items: { visible: true, label: "Items" },
      totals: { visible: true },
      notes: { visible: true, label: "Notes" },
      footer: { visible: true, label: "Thank you for your business." },
    },
    labels: {
      invoiceTitle: "INVOICE",
      invoiceNumber: "Invoice #",
      issueDate: "Issue date",
      dueDate: "Due date",
      billedTo: "Billed to:",
      items: "Items",
      qty: "Qty",
      unitPrice: "Unit",
      lineTotal: "Total",
      subtotal: "Subtotal",
      discount: "Discount",
      tax: "Tax",
      total: "TOTAL",
      notes: "Notes",
    },
    variables: [
      "{{company.name}}",
      "{{company.logoUrl}}",
      "{{client.name}}",
      "{{invoice.number}}",
      "{{invoice.date}}",
      "{{invoice.due_date}}",
      "{{lineItems[i].description}}",
      "{{totals.subtotal}}",
      "{{totals.total}}",
    ],
  };
}

const fmt = (n?: number | null) =>
  n == null || Number.isNaN(Number(n)) ? "0.00" : Number(n).toFixed(2);

export async function renderInvoiceWithTemplateToPdf(
  schema: TemplateSchema,
  data: RenderData
) {
  const margin = schema.style.margin ?? 48;
  const doc = new jsPDF({
    unit: "pt",
    format: (schema.style.pageSize || "A4").toLowerCase() as any,
  });
  let y = margin;

  doc.setFont(schema.style.fontFamily || "helvetica", "bold");
  doc.setTextColor(schema.style.secondaryColor || "#111827");
  doc.setDrawColor(200);

  // Header
  if (schema.sections.header?.visible !== false) {
    doc.setFontSize(20);
    doc.text(schema.labels?.invoiceTitle || "INVOICE", margin, y);
    y += 26;
  }

  // Seller / Client row
  if (schema.sections.sellerInfo?.visible !== false) {
    doc.setFontSize(11);
    doc.setFont(schema.style.fontFamily || "helvetica", "normal");
    if (schema.style.logoUrl) {
      // hint: jsPDF can't load remote images cross-origin reliably; leave to caller if needed
    }
    doc.text(String(data.company?.name || "Your Company"), margin, y);
  }
  if (schema.sections.clientInfo?.visible !== false) {
    const rightX = 300;
    doc.setFont(schema.style.fontFamily || "helvetica", "bold");
    doc.text(schema.labels?.billedTo || "Billed to:", rightX, y);
    doc.setFont(schema.style.fontFamily || "helvetica", "normal");
    y += 16;
    doc.text(String(data.client?.name || "Client"), 300, y);
  }
  y += 14;

  // Meta
  doc.setFont(schema.style.fontFamily || "helvetica", "normal");
  doc.text(
    `${schema.labels?.invoiceNumber || "Invoice #"}: ${data.invoice.number || "—"}`,
    margin,
    y
  );
  y += 14;
  doc.text(
    `${schema.labels?.issueDate || "Issue date"}: ${
      data.invoice.issue_date ? new Date(data.invoice.issue_date).toLocaleDateString() : "—"
    }`,
    margin,
    y
  );
  y += 14;
  doc.text(
    `${schema.labels?.dueDate || "Due date"}: ${
      data.invoice.due_date ? new Date(data.invoice.due_date).toLocaleDateString() : "—"
    }`,
    margin,
    y
  );

  // Items
  if (schema.sections.items?.visible !== false) {
    y += 28;
    doc.setFont(schema.style.fontFamily || "helvetica", "bold");
    doc.text(schema.labels?.items || "Items", margin, y);
    y += 14;
    const colDesc = margin;
    const colQty = 340;
    const colUP = 400;
    const colTotal = 480;
    doc.setFontSize(10);
    doc.text(schema.labels?.items || "Description", colDesc, y);
    doc.text(schema.labels?.qty || "Qty", colQty, y);
    doc.text(schema.labels?.unitPrice || "Unit", colUP, y);
    doc.text(schema.labels?.lineTotal || "Total", colTotal, y);
    y += 10;
    doc.line(margin, y, 548, y);
    y += 16;
    doc.setFont(schema.style.fontFamily || "helvetica", "normal");

    (data.invoice.items || []).forEach((it, i) => {
      if (y > 720) {
        doc.addPage();
        y = margin;
      }
      const descLines = doc.splitTextToSize(it.description || "—", colQty - colDesc - 12);
      const lineTotal = it.line_total ?? it.quantity * it.unit_price;
      if (schema.style.tableStripe && i % 2 === 1) {
        // simple stripe
        doc.setFillColor(245);
        doc.rect(margin - 4, y - 10, 548 - margin, 22, "F");
      }
      doc.text(descLines, colDesc, y);
      doc.text(String(it.quantity ?? 0), colQty, y);
      doc.text(fmt(it.unit_price), colUP, y);
      doc.text(fmt(lineTotal), colTotal, y);
      const lineHeight = Array.isArray(descLines) ? descLines.length * 12 : 12;
      y += Math.max(16, lineHeight + 4);
    });
  }

  // Totals
  if (schema.sections.totals?.visible !== false) {
    y += 10;
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    doc.line(margin, y, 548, y);
    y += 16;
    const rightLabelX = 400;
    const rightValueX = 548;
    const currency = data.invoice.currency || "USD";
    doc.text((schema.labels?.subtotal || "Subtotal") + ":", rightLabelX, y);
    doc.text(`${fmt(data.invoice.subtotal)} ${currency}`, rightValueX, y, { align: "right" });
    y += 16;
    doc.text((schema.labels?.discount || "Discount") + ":", rightLabelX, y);
    doc.text(`${fmt(data.invoice.discount)} ${currency}`, rightValueX, y, { align: "right" });
    y += 16;
    const taxPct = Number(data.invoice.tax_rate || 0);
    const taxAmount =
      data.invoice.tax_amount ??
      ((Number(data.invoice.subtotal || 0) - Number(data.invoice.discount || 0)) * taxPct) / 100;
    doc.text(`${schema.labels?.tax || "Tax"} (${fmt(taxPct)}%):`, rightLabelX, y);
    doc.text(`${fmt(taxAmount)} ${currency}`, rightValueX, y, { align: "right" });
    y += 16;
    doc.setFont(schema.style.fontFamily || "helvetica", "bold");
    doc.text((schema.labels?.total || "TOTAL") + ":", rightLabelX, y);
    doc.text(`${fmt(data.invoice.total)} ${currency}`, rightValueX, y, { align: "right" });
  }

  // Notes / footer
  if (schema.sections.notes?.visible !== false && data.invoice.notes) {
    y += 28;
    doc.setFont(schema.style.fontFamily || "helvetica", "bold");
    doc.text(schema.labels?.notes || "Notes", margin, y);
    y += 14;
    doc.setFont(schema.style.fontFamily || "helvetica", "normal");
    const lines = doc.splitTextToSize(String(data.invoice.notes || ""), 548 - margin);
    doc.text(lines, margin, y);
  }

  if (schema.sections.footer?.visible !== false) {
    y += 32;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.setFont(schema.style.fontFamily || "helvetica", "normal");
    doc.text(String(schema.labels?.footer || "Thank you for your business."), margin, y);
  }

  return doc;
}
