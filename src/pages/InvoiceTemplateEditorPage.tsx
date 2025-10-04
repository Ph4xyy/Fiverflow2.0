// src/pages/InvoiceTemplateEditorPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useInvoiceTemplates } from "../hooks/useInvoiceTemplates";
import type { InvoiceTemplate, TemplateSchema } from "../types/invoiceTemplate";
import TemplateStylePanel from "../components/invoices/templates/TemplateStylePanel";
import LogoUploader from "../components/invoices/templates/LogoUploader";
import { renderInvoiceWithTemplateToPdf } from "../utils/invoiceTemplate";
import { getFileUrl } from "../lib/storage";
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
  const tpl = useMemo(() => items.find((t: InvoiceTemplate) => t.id === id), [items, id]);
  const [name, setName] = useState<string>(tpl?.name || "");
  const [schema, setSchema] = useState<TemplateSchema | undefined>(tpl?.schema);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generateInlinePreview = useCallback(async () => {
    if (!schema) return;
    
    try {
      const doc = await renderInvoiceWithTemplateToPdf(schema, sampleData as any);
      const blob = doc.output("blob");
      
      // Clean up previous URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      const nextUrl = URL.createObjectURL(blob);
      setPdfUrl(nextUrl);
    } catch (e: any) {
      console.error("[TemplateEditor] inline preview", e);
    }
  }, [schema, pdfUrl]);

  useEffect(() => {
    if (tpl) {
      setName(tpl.name);
      setSchema(tpl.schema);
      // Normalize old default blue to neutral on open
      const current = tpl.schema?.style?.primaryColor;
      if (current && current.toLowerCase() === '#2563eb') {
        const next: TemplateSchema = {
          ...tpl.schema,
          style: { ...tpl.schema.style, primaryColor: '#6b7280' },
        };
        setSchema(next);
        // best effort persist (no await in effect)
        update(tpl.id, { schema: next }).catch(() => {});
      }
      // Auto-générer l'aperçu PDF au chargement
      setTimeout(generateInlinePreview, 1000);
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
          <button
            onClick={save}
            className="px-3 py-2 rounded-lg text-white"
            style={{ backgroundColor: schema.style.primaryColor || '#2563eb' }}
          >
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
              path={schema.style.logoPath || null}
              onChange={async (path: string | null) => {
                try {
                  const publicUrl = path ? await getFileUrl(path) : null;
                  const next: TemplateSchema = {
                    ...schema!,
                    style: {
                      ...schema!.style,
                      logoUrl: publicUrl || undefined,
                      logoPath: path || undefined,
                    },
                  };
                  setSchema(next);
                  await update(tpl.id, { schema: next });
                  // Auto-générer l'aperçu PDF après changement de logo
                  setTimeout(generateInlinePreview, 500);
                } catch (e: any) {
                  console.error("[TemplateEditor] save logo", e);
                }
              }}
            />
          </div>
          <TemplateStylePanel value={schema} onChange={async (newSchema: TemplateSchema) => {
            setSchema(newSchema);
            try {
              await update(tpl.id, { schema: newSchema });
              // Auto-générer l'aperçu PDF après changement de style
              setTimeout(generateInlinePreview, 500);
            } catch (e: any) {
              console.error("[TemplateEditor] save style", e);
            }
          }} />
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium" style={{ color: schema.style.secondaryColor || '#111827' }}>Aperçu PDF</div>
            <div className="flex gap-2">
              <button onClick={generateInlinePreview} className="px-3 py-2 rounded-lg text-white" style={{ backgroundColor: schema.style.primaryColor || '#111827' }}>
                Actualiser
              </button>
              <button onClick={previewPdf} className="px-3 py-2 rounded-lg" style={{ border: `1px solid ${schema.style.secondaryColor || '#111827'}`, color: schema.style.secondaryColor || '#111827' }}>
                Télécharger
              </button>
            </div>
          </div>
          {pdfUrl ? (
            <div className="w-full">
              <iframe title="template-pdf-preview" src={pdfUrl} className="w-full h-[720px] rounded-lg border border-gray-200 dark:border-slate-700" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[720px] text-sm text-gray-600 dark:text-gray-300">
              <div className="text-center">
                <div className="mb-2">Aperçu PDF</div>
                <button onClick={generateInlinePreview} className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: schema.style.primaryColor || '#111827' }}>
                  Générer l'aperçu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplateEditorPage;
