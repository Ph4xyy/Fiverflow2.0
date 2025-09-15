// src/pages/InvoiceTemplateEditorPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInvoiceTemplates } from "@/hooks/useInvoiceTemplates";
import TemplateStylePanel from "@/components/invoices/templates/TemplateStylePanel";
import TemplateCanvas from "@/components/invoices/templates/TemplateCanvas";
import LogoUploader from "@/components/invoices/templates/LogoUploader";
import { renderInvoiceWithTemplateToPdf } from "@/utils/invoiceTemplate";
import toast from "react-hot-toast";

const sampleData = {
  company: { name: "FiverFlow", logoUrl: "", address: "" },
  client: { name: "John Doe", email: "john@doe.com", address: "Somewhere" },
  invoice: {
    number: "INV-2025-0001",
    currency: "USD",
    issue_date: new Date().toISOString(),
    due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    items: [
      { description: "Design", quantity: 1, unit_price: 350, line_total: 350 },
      { description: "Development", quantity: 10, unit_price: 60, line_total: 600 },
    ],
    subtotal: 950,
    discount: 0,
    tax_rate: 20,
    tax_amount: 190,
    total: 1140,
    notes: "Payment due in 7 days.",
  },
};

const InvoiceTemplateEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, update } = useInvoiceTemplates(user?.id);
  const tpl = useMemo(() => items.find((t) => t.id === id), [items, id]);
  const [name, setName] = useState<string>(tpl?.name || "");
  const [schema, setSchema] = useState(tpl?.schema);

  useEffect(() => {
    if (tpl) {
      setName(tpl.name);
      setSchema(tpl.schema);
    }
  }, [tpl]);

  if (!tpl || !schema) {
    return (
      <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="text-gray-700 dark:text-gray-200">Template introuvable.</div>
      </div>
    );
  }

  const save = async () => {
    await update(tpl.id, { name, schema });
    toast.success("Modèle enregistré");
  };

  const previewPdf = async () => {
    const doc = await renderInvoiceWithTemplateToPdf(schema, sampleData as any);
    doc.save(`${name || "template"}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Éditeur de template</h1>
          <p className="text-gray-600 dark:text-gray-400">Personnalisez votre modèle de facture.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/invoices/templates")} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700">
            Retour
          </button>
          <button onClick={save} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Enregistrer
          </button>
          <button onClick={previewPdf} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700">
            Export PDF test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nom du template</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <LogoUploader
              value={schema.style.logoUrl || null}
              onChange={(url) => setSchema({ ...schema, style: { ...schema.style, logoUrl: url || undefined } })}
            />
          </div>
          <TemplateStylePanel value={schema} onChange={setSchema} />
        </div>

        <TemplateCanvas value={schema} />
      </div>
    </div>
  );
};

export default InvoiceTemplateEditorPage;
