// src/pages/InvoiceTemplatesPage.tsx
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInvoiceTemplates } from "@/hooks/useInvoiceTemplates";
import type { InvoiceTemplate } from "@/types/invoiceTemplate";
import TemplateCard from "@/components/invoices/templates/TemplateCard";
import { useNavigate } from "react-router-dom";

const InvoiceTemplatesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const { items, loading, create, duplicate, remove, setDefault } = useInvoiceTemplates(user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Templates de facture</h1>
          <p className="text-gray-600 dark:text-gray-400">Créez, éditez et sélectionnez votre modèle par défaut.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du template"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          <button
            onClick={async () => {
              const n = (name || "").trim() || "Nouveau template";
              const created = await create(n);
              setName("");
              navigate(`/invoices/templates/${created.id}`);
            }}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#111827' }}
          >
            Créer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-slate-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center">
          Aucun template pour l’instant. Créez votre premier modèle !
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t: InvoiceTemplate) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={(id: string) => navigate(`/invoices/templates/${id}`)}
              onDuplicate={duplicate}
              onDelete={(id: string) => remove(id)}
              onSetDefault={setDefault}
              onPreview={(id: string) => navigate(`/invoices/templates/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceTemplatesPage;
