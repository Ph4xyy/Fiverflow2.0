import React from "react";
import { MoreHorizontal, Star, Copy, Trash2, Edit } from "lucide-react";
import type { InvoiceTemplate } from "@/types/invoiceTemplate";

type Props = {
  template: InvoiceTemplate;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
};

const TemplateCard: React.FC<Props> = ({ template, onEdit, onDuplicate, onDelete, onSetDefault }) => {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-sm text-slate-500">
        Aperçu
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium text-gray-900 dark:text-white">{template.name}</div>
          <button
            onClick={() => onSetDefault(template.id)}
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${
              template.is_default
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
            title={template.is_default ? "Modèle par défaut" : "Définir par défaut"}
          >
            <Star className="w-3.5 h-3.5 mr-1" />
            {template.is_default ? "Par défaut" : "Définir"}
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onEdit(template.id)}
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm"
          >
            <Edit className="w-4 h-4 mr-1" /> Éditer
          </button>
          <button
            onClick={() => onDuplicate(template.id)}
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm"
          >
            <Copy className="w-4 h-4 mr-1" /> Dupliquer
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
