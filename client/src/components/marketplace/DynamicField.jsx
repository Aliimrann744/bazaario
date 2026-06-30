import { useEffect, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import api from '../../lib/api';

/**
 * Renders a single field from GET /categories/:id/form-schema.
 * Handles: text, textarea, integer, decimal, money, boolean, single_select,
 * multi_select, reference_select (with dependsOn), date.
 * `media` and `location` are handled by dedicated UI in the PostAd page.
 */
export default function DynamicField({ field, value, onChange, values = {}, error }) {
  const { key, type, label, required, unit } = field;

  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-rose-500"> *</span>}
        {unit && <span className="ml-1 font-normal text-muted">({unit})</span>}
      </label>
      <FieldControl field={field} value={value} onChange={onChange} values={values} />
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

function FieldControl({ field, value, onChange, values }) {
  const { type } = field;
  switch (type) {
    case 'textarea':
      return <textarea className="input min-h-[120px] resize-y" value={value || ''} maxLength={field.validation?.maxLength} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ''} />;
    case 'integer':
    case 'decimal':
    case 'money':
      return <input type="number" inputMode="numeric" className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
    case 'boolean':
      return (
        <button type="button" onClick={() => onChange(!value)} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-muted'}`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded ${value ? 'bg-brand-600 text-white' : 'border border-line'}`}>{value && <Check className="h-3.5 w-3.5" />}</span>
          {value ? 'Yes' : 'No'}
        </button>
      );
    case 'single_select':
      return <SelectChips options={field.options || []} value={value} onChange={onChange} />;
    case 'multi_select':
      return <MultiChips options={field.options || []} value={value || []} onChange={onChange} />;
    case 'reference_select':
      return <ReferenceSelect field={field} value={value} onChange={onChange} values={values} />;
    case 'date':
      return <input type="date" className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'text':
    default:
      return <input className="input" value={value || ''} maxLength={field.validation?.maxLength} onChange={(e) => onChange(e.target.value)} />;
  }
}

function SelectChips({ options, value, onChange }) {
  if (options.length > 7) {
    return (
      <div className="relative">
        <select className="input appearance-none pr-9" value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted" />
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(value === o.value ? '' : o.value)} className={`chip ${value === o.value ? 'chip-active' : ''}`}>{o.label}</button>
      ))}
    </div>
  );
}

function MultiChips({ options, value, onChange }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button key={o.value} type="button" onClick={() => toggle(o.value)} className={`chip ${on ? 'chip-active' : ''}`}>
            {on && <Check className="h-3.5 w-3.5" />}{o.label}
          </button>
        );
      })}
    </div>
  );
}

function ReferenceSelect({ field, value, onChange, values }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const parentVal = field.dependsOn ? values[field.dependsOn] : null;
  const disabled = field.dependsOn && !parentVal;

  useEffect(() => {
    if (disabled) { setOptions([]); return; }
    let alive = true;
    setLoading(true);
    api.get(`/reference-data/${field.referenceCatalog}`, { params: parentVal ? { parentId: parentVal } : {} })
      .then(({ data }) => { if (alive) setOptions(data.items); })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [field.referenceCatalog, parentVal, disabled]);

  return (
    <div className="relative">
      <select className="input appearance-none pr-9 disabled:bg-slate-50 disabled:text-slate-400" value={value || ''} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">{disabled ? `Select ${field.dependsOn?.replace('_id', '')} first` : loading ? 'Loading…' : 'Select…'}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted" />
    </div>
  );
}
