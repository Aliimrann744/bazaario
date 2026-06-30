import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Check, ChevronRight, ChevronLeft, ImagePlus, X, MapPin, Loader2, Sparkles, PartyPopper,
} from 'lucide-react';
import api, { apiError, apiFields } from '../lib/api';
import { categoryIcon } from '../lib/icons';
import { priceLabel } from '../lib/format';
import DynamicField from '../components/marketplace/DynamicField';

const STEPS = ['Category', 'Details', 'Price & Location', 'Review'];

export default function PostAd() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [top, setTop] = useState(null);
  const [leaf, setLeaf] = useState(null);
  const [schema, setSchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [values, setValues] = useState({ title: '', description: '', price: '', price_type: 'fixed', location_id: null, locationLabel: '', attributes: {}, media: [] });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data.items)); }, []);

  const pickLeaf = async (cat) => {
    setLeaf(cat); setLoadingSchema(true); setErrors({});
    try {
      const { data } = await api.get(`/categories/${cat.id}/form-schema`);
      setSchema(data);
      setValues((v) => ({ ...v, price_type: (data.priceTypesAllowed?.[0]) || 'fixed' }));
      setStep(1);
    } catch (e) { toast.error(apiError(e)); } finally { setLoadingSchema(false); }
  };

  const hasPrice = useMemo(() => schema?.commonFields?.some((f) => f.key === 'price'), [schema]);
  const priceTypeField = useMemo(() => schema?.commonFields?.find((f) => f.key === 'price_type'), [schema]);
  const specificFields = schema?.fields || [];

  const setAttr = (key, val) => setValues((v) => {
    const attributes = { ...v.attributes, [key]: val };
    // Reset any field that depends on this one (e.g. clear Model when Make changes).
    specificFields.forEach((f) => { if (f.dependsOn === key) delete attributes[f.key]; });
    return { ...v, attributes };
  });

  const addMedia = (url) => { if (url) setValues((v) => ({ ...v, media: [...v.media, url] })); };
  const addSample = () => addMedia(`https://picsum.photos/seed/${leaf.id}-${Date.now()}/900/700`);
  const removeMedia = (i) => setValues((v) => ({ ...v, media: v.media.filter((_, x) => x !== i) }));

  // --- Validation per step (light client-side; server is authoritative) ---
  const validateDetails = () => {
    const e = {};
    if (!values.title || values.title.length < 10) e.title = 'Title must be at least 10 characters';
    if (!values.description || values.description.length < 20) e.description = 'Description must be at least 20 characters';
    if (schema.listingKind !== 'job' && values.media.length < 1) e.media = 'Add at least one photo';
    specificFields.forEach((f) => {
      if (f.required) {
        const val = values.attributes[f.key];
        if (val == null || val === '' || (Array.isArray(val) && !val.length)) e[f.key] = `${f.label} is required`;
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const validatePricing = () => {
    const e = {};
    if (hasPrice && values.price_type !== 'contact_for_price' && values.price_type !== 'free' && (!values.price || Number(values.price) <= 0)) e.price = 'Enter a valid price';
    if (!values.location_id) e.location_id = 'Select a location';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && !validateDetails()) return;
    if (step === 2 && !validatePricing()) return;
    setStep((s) => Math.min(s + 1, 3));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true); setErrors({});
    // Convert money inputs (rupees) -> minor units. Specific money fields too.
    const attributes = { ...values.attributes };
    specificFields.forEach((f) => { if (f.type === 'money' && attributes[f.key] != null && attributes[f.key] !== '') attributes[f.key] = Math.round(Number(attributes[f.key]) * 100); });
    const payload = {
      categoryId: leaf.id,
      title: values.title,
      description: values.description,
      priceType: hasPrice ? values.price_type : (schema.listingKind === 'job' ? 'free' : values.price_type),
      priceMinor: hasPrice && values.price ? Math.round(Number(values.price) * 100) : 0,
      locationId: values.location_id,
      attributes,
      media: values.media.map((url, i) => ({ url, sortOrder: i })),
    };
    try {
      const { data } = await api.post('/listings', payload);
      toast.success(data.moderation?.state === 'ACTIVE' ? 'Your ad is live!' : 'Submitted for review');
      nav(`/listing/${data.listing.publicId}`);
    } catch (e) {
      const f = apiFields(e);
      if (f) { setErrors(f); toast.error('Please fix the highlighted fields'); if (f.title || f.description || f.media) setStep(1); else if (f.price || f.locationId) setStep(2); }
      else toast.error(apiError(e));
    } finally { setSubmitting(false); }
  };

  return (
    <div className="container-page max-w-3xl py-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Post your ad</h1>
      <p className="mt-1 text-muted">It only takes a couple of minutes.</p>

      {/* Stepper */}
      <div className="mt-6 flex items-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${i < step ? 'bg-brand-gradient text-white' : i === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-100 text-muted'}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`hidden text-sm font-semibold sm:inline ${i <= step ? 'text-ink' : 'text-muted'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 rounded ${i < step ? 'bg-brand-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            {/* STEP 0: Category */}
            {step === 0 && (
              <div className="card p-5 sm:p-6">
                {!top ? (
                  <>
                    <h2 className="mb-4 font-display text-lg font-bold">Choose a category</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {categories.map((c) => {
                        const Icon = categoryIcon(c.icon);
                        return (
                          <button key={c.id} onClick={() => setTop(c)} className="flex items-center gap-3 rounded-xl border border-line p-3.5 text-left transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-glow">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></span>
                            <span className="text-sm font-semibold text-ink">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <button onClick={() => setTop(null)} className="mb-4 flex items-center gap-1 text-sm font-medium text-brand-600"><ChevronLeft className="h-4 w-4" /> All categories</button>
                    <h2 className="mb-4 font-display text-lg font-bold">{top.label}</h2>
                    <div className="space-y-2">
                      {(top.children || []).map((c) => (
                        <button key={c.id} onClick={() => pickLeaf(c)} disabled={loadingSchema} className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left text-sm font-medium transition hover:border-brand-300 hover:bg-brand-50">
                          {c.label}
                          {loadingSchema && leaf?.id === c.id ? <Loader2 className="h-4 w-4 animate-spin text-brand-600" /> : <ChevronRight className="h-4 w-4 text-muted" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 1: Details */}
            {step === 1 && schema && (
              <div className="space-y-5">
                <div className="card p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold">Photos</h2>
                    <span className="text-xs text-muted">{values.media.length}/12</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {values.media.map((url, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-line">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button onClick={() => removeMedia(i)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
                        {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Cover</span>}
                      </div>
                    ))}
                    {values.media.length < 12 && (
                      <button onClick={addSample} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-muted transition hover:border-brand-300 hover:text-brand-600">
                        <ImagePlus className="h-6 w-6" /><span className="text-xs font-medium">Add photo</span>
                      </button>
                    )}
                  </div>
                  <ImageUrlAdder onAdd={addMedia} />
                  {errors.media && <p className="mt-2 text-xs font-medium text-rose-500">{errors.media}</p>}
                </div>

                <div className="card space-y-4 p-5 sm:p-6">
                  <h2 className="font-display text-lg font-bold">Ad details</h2>
                  <div>
                    <label className="label">Title <span className="text-rose-500">*</span></label>
                    <input className="input" value={values.title} maxLength={100} onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))} placeholder="e.g. Toyota Corolla 2021 Automatic" />
                    {errors.title && <p className="mt-1 text-xs font-medium text-rose-500">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="label">Description <span className="text-rose-500">*</span></label>
                    <textarea className="input min-h-[120px]" value={values.description} maxLength={5000} onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} placeholder="Describe condition, features, reason for selling…" />
                    {errors.description && <p className="mt-1 text-xs font-medium text-rose-500">{errors.description}</p>}
                  </div>
                </div>

                {specificFields.length > 0 && (
                  <div className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                    <h2 className="font-display text-lg font-bold sm:col-span-2">{schema.label} details</h2>
                    {specificFields.map((f) => (
                      <div key={f.key} className={f.type === 'multi_select' || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <DynamicField field={f} value={values.attributes[f.key]} values={values.attributes} error={errors[f.key]} onChange={(val) => setAttr(f.key, val)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Price & Location */}
            {step === 2 && schema && (
              <div className="card space-y-5 p-5 sm:p-6">
                {hasPrice && (
                  <>
                    {priceTypeField?.options?.length > 0 && (
                      <div>
                        <label className="label">Price type</label>
                        <div className="flex flex-wrap gap-2">
                          {priceTypeField.options.map((o) => (
                            <button key={o.value} onClick={() => setValues((v) => ({ ...v, price_type: o.value }))} className={`chip ${values.price_type === o.value ? 'chip-active' : ''}`}>{o.label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {values.price_type !== 'contact_for_price' && values.price_type !== 'free' && (
                      <div>
                        <label className="label">Price (Rs) <span className="text-rose-500">*</span></label>
                        <input type="number" className="input" value={values.price} onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))} placeholder="e.g. 7150000" />
                        {errors.price && <p className="mt-1 text-xs font-medium text-rose-500">{errors.price}</p>}
                      </div>
                    )}
                  </>
                )}
                <LocationPicker value={values.location_id} label={values.locationLabel} onPick={(l) => setValues((v) => ({ ...v, location_id: l?.id || null, locationLabel: l ? `${l.name}${l.path ? ', ' + l.path : ''}` : '' }))} error={errors.location_id} />
              </div>
            )}

            {/* STEP 3: Review */}
            {step === 3 && schema && (
              <div className="card overflow-hidden">
                <div className="bg-hero-mesh p-5 sm:p-6">
                  <span className="badge-verified"><Sparkles className="h-3.5 w-3.5" /> Preview</span>
                  <h2 className="mt-2 font-display text-xl font-bold text-ink">{values.title || 'Untitled ad'}</h2>
                  <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{priceLabel({ priceType: hasPrice ? values.price_type : 'free', priceMinor: Math.round(Number(values.price || 0) * 100) })}</p>
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                  {values.media.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">{values.media.map((u, i) => <img key={i} src={u} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />)}</div>
                  )}
                  <Row label="Category" value={schema.label} />
                  <Row label="Location" value={values.locationLabel || '—'} />
                  <Row label="Description" value={values.description} />
                  {specificFields.filter((f) => values.attributes[f.key] != null && values.attributes[f.key] !== '' && !(Array.isArray(values.attributes[f.key]) && !values.attributes[f.key].length)).map((f) => (
                    <Row key={f.key} label={f.label} value={Array.isArray(values.attributes[f.key]) ? values.attributes[f.key].join(', ') : String(values.attributes[f.key])} />
                  ))}
                  <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
                    <PartyPopper className="mb-1 inline h-4 w-4" /> Your ad will be checked against our policy. Most ads go live instantly.
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav buttons */}
      {step > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <button onClick={back} className="btn-ghost"><ChevronLeft className="h-4 w-4" /> Back</button>
          {step < 3 ? (
            <button onClick={next} className="btn-primary px-8">Continue <ChevronRight className="h-4 w-4" /></button>
          ) : (
            <button onClick={submit} disabled={submitting} className="btn-accent px-8">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting…</> : <>Publish ad <Check className="h-4 w-4" /></>}</button>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-4 border-b border-line pb-2.5 text-sm last:border-0">
      <span className="w-28 shrink-0 text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function ImageUrlAdder({ onAdd }) {
  const [url, setUrl] = useState('');
  return (
    <div className="mt-3 flex gap-2">
      <input className="input py-2 text-sm" placeholder="…or paste an image URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button onClick={() => { onAdd(url.trim()); setUrl(''); }} disabled={!url.trim()} className="btn-outline py-2">Add</button>
    </div>
  );
}

function LocationPicker({ value, label, onPick, error }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(async () => { const { data } = await api.get('/locations/suggest', { params: { q } }); setResults(data.items); }, 200);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div>
      <label className="label">Location <span className="text-rose-500">*</span></label>
      {value ? (
        <div className="flex items-center justify-between rounded-xl border border-brand-300 bg-brand-50 px-4 py-2.5">
          <span className="flex items-center gap-2 text-sm font-medium text-brand-800"><MapPin className="h-4 w-4" /> {label}</span>
          <button onClick={() => onPick(null)} className="text-muted hover:text-rose-500"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <div className="relative">
          <input className="input" placeholder="Search city or area…" value={q} onFocus={() => setOpen(true)} onChange={(e) => { setQ(e.target.value); setOpen(true); }} />
          {open && results.length > 0 && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-line bg-white shadow-hover">
              {results.map((l) => (
                <button key={l.id} onClick={() => { onPick(l); setOpen(false); }} className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-brand-50">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span><span className="font-medium">{l.name}</span><span className="block text-xs text-muted">{l.path}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}
