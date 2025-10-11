import React from "react";
import type { TemplateSchema } from "@/types/invoiceTemplate";

type Props = {
  value: TemplateSchema;
  onChange: (next: TemplateSchema) => void;
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block text-sm mb-3">
    <span className="block text-gray-600 dark:text-gray-300 mb-1">{label}</span>
    {children}
  </label>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="flex items-center justify-between text-sm py-2">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4"
    />
  </label>
);

const TemplateStylePanel: React.FC<Props> = ({ value, onChange }) => {
  const s = value.style;

  return (
    <div className="p-4 space-y-4">
      <div className="text-sm font-medium text-gray-900 dark:text-white">Style</div>
      <Field label="Couleur primaire">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={s.primaryColor}
            onChange={(e) => onChange({ ...value, style: { ...s, primaryColor: e.target.value } })}
            className="h-9 w-14 p-0 border border-gray-300 dark:border-slate-700 rounded"
          />
          <input
            type="text"
            value={s.primaryColor}
            onChange={(e) => onChange({ ...value, style: { ...s, primaryColor: e.target.value } })}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            placeholder="#000000"
          />
        </div>
      </Field>

      <Field label="Couleur secondaire">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={s.secondaryColor}
            onChange={(e) => onChange({ ...value, style: { ...s, secondaryColor: e.target.value } })}
            className="h-9 w-14 p-0 border border-gray-300 dark:border-slate-700 rounded"
          />
          <input
            type="text"
            value={s.secondaryColor}
            onChange={(e) => onChange({ ...value, style: { ...s, secondaryColor: e.target.value } })}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            placeholder="#000000"
          />
        </div>
      </Field>

      <div className="rounded-md p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="text-xs mb-2 text-gray-600 dark:text-gray-300">Thèmes rapides</div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Bleut(', primary: '#2563eb', secondary: '#111827' },
            { name: 'Émeraude', primary: '#10b981', secondary: '#064e3b' },
            { name: 'Violet', primary: '#7c3aed', secondary: '#2e1065' },
            { name: 'Orange', primary: '#f97316', secondary: '#7c2d12' },
            { name: 'Gris', primary: '#6b7280', secondary: '#111827' },
          ].map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => onChange({ ...value, style: { ...s, primaryColor: t.primary, secondaryColor: t.secondary } })}
              className="px-2 py-1 rounded border border-gray-200 dark:border-slate-700 text-xs"
              title={`Appliquer le thème ${t.name}`}
              style={{
                background: t.primary,
                color: '#fff',
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <Field label="Police">
        <select
          value={s.fontFamily}
          onChange={(e) => onChange({ ...value, style: { ...s, fontFamily: e.target.value } })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="helvetica">Helvetica (Moderne)</option>
          <option value="times">Times New Roman (Classique)</option>
          <option value="courier">Courier (Monospace)</option>
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Taille titre (pt)">
          <input
            type="number"
            value={s.titleSize ?? 20}
            onChange={(e) => onChange({ ...value, style: { ...s, titleSize: Number(e.target.value || 20) } })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </Field>
        <Field label="Taille corps (pt)">
          <input
            type="number"
            value={s.bodySize ?? 11}
            onChange={(e) => onChange({ ...value, style: { ...s, bodySize: Number(e.target.value || 11) } })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </Field>
        <Field label="Taille entête tableau (pt)">
          <input
            type="number"
            value={s.tableHeaderSize ?? 10}
            onChange={(e) => onChange({ ...value, style: { ...s, tableHeaderSize: Number(e.target.value || 10) } })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </Field>
      </div>

      <Field label="Marge (px)">
        <input
          type="number"
          value={s.margin ?? 48}
          onChange={(e) => onChange({ ...value, style: { ...s, margin: Number(e.target.value || 48) } })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
      </Field>

      <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">Couleurs du tableau</div>
        
        <Field label="Couleur des rayures">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={s.tableStripeColor || "#f8f9fa"}
              onChange={(e) => onChange({ ...value, style: { ...s, tableStripeColor: e.target.value } })}
              className="h-9 w-14 p-0 border border-gray-300 dark:border-slate-700 rounded"
            />
            <input
              type="text"
              value={s.tableStripeColor || "#f8f9fa"}
              onChange={(e) => onChange({ ...value, style: { ...s, tableStripeColor: e.target.value } })}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              placeholder="#f8f9fa"
            />
          </div>
        </Field>

        <Field label="Intensité des rayures">
          <input
            type="range"
            min="0"
            max="15"
            value={s.tableStripeOpacity || 5}
            onChange={(e) => onChange({ ...value, style: { ...s, tableStripeOpacity: Number(e.target.value) } })}
            className="w-full"
          />
          <div className="text-xs text-gray-500">{s.tableStripeOpacity || 5}% (max 15%)</div>
        </Field>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.tableStripe ?? false}
            onChange={(e) => onChange({ ...value, style: { ...s, tableStripe: e.target.checked } })}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Activer les rayures</span>
        </label>
      </div>

      <Field label="Largeur logo (px)">
        <input
          type="number"
          value={s.logoWidth ?? 120}
          onChange={(e) => onChange({ ...value, style: { ...s, logoWidth: Number(e.target.value || 120) } })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
      </Field>

      <Toggle
        label="Bandes alternées tableau"
        checked={!!s.tableStripe}
        onChange={(v) => onChange({ ...value, style: { ...s, tableStripe: v } })}
      />

      <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sections</div>
        {Object.entries(value.sections).map(([k, conf]) => (
          <Toggle
            key={k}
            label={`Afficher "${k}"`}
            checked={conf?.visible !== false}
            onChange={(vis) =>
              onChange({
                ...value,
                sections: { ...value.sections, [k]: { ...(conf || {}), visible: vis } },
              })
            }
          />
        ))}
      </div>
    </div>
  );
};

export default TemplateStylePanel;
