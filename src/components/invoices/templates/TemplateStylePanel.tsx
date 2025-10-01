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
        <input
          type="color"
          value={s.primaryColor}
          onChange={(e) => onChange({ ...value, style: { ...s, primaryColor: e.target.value } })}
          className="h-9 w-14 p-0 border border-gray-300 dark:border-slate-700 rounded"
        />
      </Field>

      <Field label="Couleur secondaire">
        <input
          type="color"
          value={s.secondaryColor}
          onChange={(e) => onChange({ ...value, style: { ...s, secondaryColor: e.target.value } })}
          className="h-9 w-14 p-0 border border-gray-300 dark:border-slate-700 rounded"
        />
      </Field>

      <Field label="Police">
        <select
          value={s.fontFamily}
          onChange={(e) => onChange({ ...value, style: { ...s, fontFamily: e.target.value } })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="helvetica">Helvetica</option>
          <option value="times">Times</option>
          <option value="courier">Courier</option>
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
