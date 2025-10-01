// src/components/invoices/templates/TemplateCanvas.tsx
import React from "react";
import type { TemplateSchema } from "@/types/invoiceTemplate";
import LogoDisplayPrivate from "@/components/LogoDisplayPrivate";

type Props = {
  value: TemplateSchema;
};

const TemplateCanvas: React.FC<Props> = ({ value }) => {
  // Plusieurs emplacements possibles selon ton schéma
  const logoPath = value?.style?.logoUrl ||
    (value as any)?.assets?.logo_path ||
    (value as any)?.logo_path ||
    (value as any)?.brand?.logo_path ||
    null;

  const primary = value?.style?.primaryColor || "#e5e7eb";     // fallback gris clair
  const secondary = value?.style?.secondaryColor || "#111827"; // fallback gris très foncé
  const fontFamily = value?.style?.fontFamily || "inherit";

  return (
    <div
      className="w-full bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6"
      style={{ fontFamily }}  // ✅ applique la police au rendu
    >
      <div className="text-xs text-gray-500 mb-2">Aperçu (maquette)</div>

      <div
        className="rounded-lg border border-dashed p-6"
        style={{ borderColor: primary }}
      >
        {/* En‑tête avec logo + titre */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* LOGO (privé) */}
            {logoPath ? (
              <LogoDisplayPrivate
                key={logoPath || "no-logo"}
                path={logoPath}
                className="h-12 w-auto object-contain"
                alt="Logo société"
              />
            ) : (
              <div className="h-12 w-12 rounded bg-gray-100 dark:bg-slate-800" />
            )}

            <div className="text-2xl font-semibold" style={{ color: secondary }}>
              {value.labels?.invoiceTitle || "INVOICE"}
            </div>
          </div>

          {/* Meta facturation (factice) */}
          <div className="text-right text-sm text-gray-600 dark:text-gray-300">
            <div>N° — INV‑XXXX</div>
            <div>Date — AAAA‑MM‑JJ</div>
          </div>
        </div>

        {/* Bloc société / client */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Votre entreprise</div>
            <div className="text-gray-600 dark:text-gray-300">Adresse · Ville · Pays</div>
            <div className="text-gray-600 dark:text-gray-300">Email · Téléphone</div>
          </div>
          <div className="sm:text-right">
            <div className="font-medium text-gray-900 dark:text-gray-100">Client</div>
            <div className="text-gray-600 dark:text-gray-300">Nom du client</div>
            <div className="text-gray-600 dark:text-gray-300">Email · Référence</div>
          </div>
        </div>

        {/* Lignes */}
        <div className="mt-6">
          <div className="text-sm font-medium mb-2" style={{ color: secondary }}>
            {value.labels?.items || "Items"}
          </div>

          <div className="rounded border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="col-span-7 p-2">Description</div>
              <div className="col-span-2 p-2 text-right">Qté</div>
              <div className="col-span-1 p-2 text-right">PU</div>
              <div className="col-span-2 p-2 text-right">Total</div>
            </div>

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="grid grid-cols-12 text-sm text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-slate-700"
              >
                <div className="col-span-7 p-2">Ligne de service #{i}</div>
                <div className="col-span-2 p-2 text-right">1</div>
                <div className="col-span-1 p-2 text-right">100.00</div>
                <div className="col-span-2 p-2 text-right">100.00</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totaux */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {value.labels?.notes || "Notes"} : Lorem ipsum dolor sit amet.
          </div>

          <div className="text-sm">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-300">Sous‑total</div>
              <div className="text-gray-900 dark:text-gray-100">300.00</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-300">Remise</div>
              <div className="text-gray-900 dark:text-gray-100">0.00</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-300">TVA</div>
              <div className="text-gray-900 dark:text-gray-100">0.00</div>
            </div>
            <div className="border-t border-gray-200 dark:border-slate-700 mt-2 pt-2 flex items-center justify-between font-semibold">
              <div className="text-gray-900 dark:text-gray-100">Total</div>
              <div className="text-gray-900 dark:text-gray-100">300.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCanvas;
