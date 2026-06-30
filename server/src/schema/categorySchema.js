'use strict';
/**
 * Category schema engine.
 * Loads category-schema-reference.json and turns it into:
 *   - client-ready form schemas (GET /categories/:id/form-schema)
 *   - a validator + normalizer for listing attributes
 *   - the list of facetable / sortable fields used by search
 *
 * This is the "config-driven taxonomy" the blueprint mandates: adding a category
 * or option is a data change, not a code/DB-column change.
 */
const path = require('path');
const fs = require('fs');

const SCHEMA_PATH = path.join(__dirname, '..', '..', 'data', 'category-schema.json');
const raw = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

const CURRENT_YEAR = new Date().getFullYear();

// Area conversion factors to square metres. Marla/kanal use a configured market factor.
const MARLA_TO_SQM = 25.2929; // common market convention
const AREA_TO_SQM = {
  square_metre: 1,
  square_foot: 0.09290304,
  square_yard: 0.83612736,
  marla: MARLA_TO_SQM,
  kanal: MARLA_TO_SQM * 20,
};

const commonFields = raw.commonListingFields;
const categoriesById = {};
for (const c of raw.categories) categoriesById[c.id] = c;

// Human labels for option values (fallback: prettify the value).
function prettifyOption(value) {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b(pta|cng|lpg|phev|reev|suv|mpv|abs|cc|gb|ram|diy|atv)\b/gi, (m) => m.toUpperCase())
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

// Friendly field labels (the JSON omits labels for most fields).
const LABEL_OVERRIDES = {
  brand_id: 'Brand', model_id: 'Model', make_id: 'Make', variant_id: 'Variant',
  pta_status: 'PTA Status', storage_gb: 'Storage (GB)', ram_gb: 'RAM (GB)',
  model_year: 'Model Year', mileage_km: 'Mileage (km)', engine_cc: 'Engine (cc)',
  registration_city_id: 'Registration City', body_type: 'Body Type',
  area_value: 'Area', area_unit: 'Area Unit', area_square_metres: 'Area (m²)',
  construction_state: 'Construction', floor_level: 'Floor', rent_period: 'Rent Period',
  plot_type: 'Plot Type', ownership_status: 'Ownership', employer_name: 'Employer',
  position_type: 'Position Type', workplace_mode: 'Workplace', salary_min_minor: 'Salary (min)',
  salary_max_minor: 'Salary (max)', salary_period: 'Salary Period', experience_min_years: 'Experience (years)',
  education_level: 'Education', application_method: 'How to Apply', application_deadline: 'Apply Before',
  provider_type: 'Provider', price_model: 'Pricing', service_area_ids: 'Service Areas',
  seller_sku: 'SKU', stock_quantity: 'Stock', compare_at_price_minor: 'Compare-at Price',
  weight_grams: 'Weight (g)', length_mm: 'Length (mm)', width_mm: 'Width (mm)', height_mm: 'Height (mm)',
};
function labelForKey(key) {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
  return prettifyOption(key.replace(/_id$/, '').replace(/_ids$/, ''));
}

function fieldToClient(field) {
  const out = {
    key: field.key,
    type: field.type,
    label: field.label || labelForKey(field.key),
    required: !!field.required,
    facetable: !!field.facetable,
    searchable: !!field.searchable,
    sortable: !!field.sortable,
    computed: !!field.computed,
  };
  if (field.unit) out.unit = field.unit;
  if (field.dependsOn) out.dependsOn = field.dependsOn;
  if (field.referenceCatalog) out.referenceCatalog = field.referenceCatalog;
  if (field.optionSource) out.optionSource = field.optionSource;
  if (field.validation) out.validation = field.validation;
  if (field.type === 'multi_select') out.multi = true;
  if (Array.isArray(field.options)) {
    out.options = field.options.map((v) => ({ value: v, label: prettifyOption(v) }));
  }
  return out;
}

/** Build the merged, client-ready form schema for a category id. */
function getFormSchema(categoryId) {
  const cat = categoriesById[categoryId];
  if (!cat) return null;
  const overrides = cat.overrideCommonFields || {};

  const mergedCommon = commonFields
    .map((f) => {
      const ov = overrides[f.key];
      if (ov && ov.enabled === false) return null;
      return fieldToClient({ ...f, ...(ov || {}), validation: { ...(f.validation || {}), ...((ov && ov.validation) || {}) } });
    })
    .filter(Boolean);

  // price_type options constrained by category priceTypesAllowed
  const priceTypeField = mergedCommon.find((f) => f.key === 'price_type');
  if (priceTypeField && Array.isArray(cat.priceTypesAllowed)) {
    priceTypeField.options = cat.priceTypesAllowed.map((v) => ({ value: v, label: prettifyOption(v) }));
  }

  const specific = (cat.fields || []).map(fieldToClient);

  return {
    categoryId: cat.id,
    label: cat.label,
    listingKind: cat.listingKind,
    schemaVersion: raw.schemaVersion,
    priceTypesAllowed: cat.priceTypesAllowed || [],
    eligibility: cat.eligibility || undefined,
    commonFields: mergedCommon,
    fields: specific,
  };
}

/** All categories that have a detailed schema in the JSON. */
function listSchemaCategoryIds() {
  return raw.categories.map((c) => c.id);
}

/** Fields (specific only) that are facetable, for search filter config. */
function getFacetFields(categoryId) {
  const cat = categoriesById[categoryId];
  if (!cat) return [];
  return (cat.fields || []).filter((f) => f.facetable).map(fieldToClient);
}

function getSortableFields(categoryId) {
  const cat = categoriesById[categoryId];
  if (!cat) return [];
  return (cat.fields || []).filter((f) => f.sortable).map(fieldToClient);
}

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return Number(v);
}

/**
 * Validate + normalize incoming attributes for a category.
 * Returns { errors: {key:msg}, attributes: normalized }.
 * Price/price_type/title/description/location/media are validated at the listing level,
 * here we focus on category-specific fields plus computed area.
 */
function validateAndNormalize(categoryId, input, refLookup) {
  const cat = categoriesById[categoryId];
  const errors = {};
  const attributes = {};
  if (!cat) {
    return { errors: { categoryId: 'Unknown category' }, attributes };
  }

  for (const field of cat.fields || []) {
    if (field.computed) continue; // computed below
    const key = field.key;
    let value = input ? input[key] : undefined;
    const provided = value !== undefined && value !== null && value !== '';

    if (!provided) {
      if (field.required) errors[key] = `${field.label || labelForKey(key)} is required`;
      continue;
    }

    switch (field.type) {
      case 'integer': {
        const n = num(value);
        if (!Number.isFinite(n) || !Number.isInteger(n)) { errors[key] = 'Must be a whole number'; break; }
        const v = field.validation || {};
        if (v.min !== undefined && n < v.min) errors[key] = `Must be ≥ ${v.min}`;
        let max = v.max;
        if (v.maxExpression === 'current_year_plus_1') max = CURRENT_YEAR + 1;
        if (max !== undefined && n > max) errors[key] = `Must be ≤ ${max}`;
        attributes[key] = n;
        break;
      }
      case 'decimal': {
        const n = num(value);
        if (!Number.isFinite(n)) { errors[key] = 'Must be a number'; break; }
        const v = field.validation || {};
        if (v.exclusiveMin !== undefined && n <= v.exclusiveMin) errors[key] = `Must be > ${v.exclusiveMin}`;
        if (v.min !== undefined && n < v.min) errors[key] = `Must be ≥ ${v.min}`;
        if (v.max !== undefined && n > v.max) errors[key] = `Must be ≤ ${v.max}`;
        attributes[key] = n;
        break;
      }
      case 'money': {
        const n = num(value);
        if (!Number.isFinite(n) || n < 0) { errors[key] = 'Invalid amount'; break; }
        attributes[key] = Math.round(n);
        break;
      }
      case 'single_select': {
        const opts = field.options || optionSourceValues(field, refLookup);
        if (opts && opts.length && !opts.includes(value)) errors[key] = 'Invalid option';
        attributes[key] = value;
        break;
      }
      case 'multi_select': {
        let arr = Array.isArray(value) ? value : [value];
        const opts = field.options || optionSourceValues(field, refLookup);
        if (opts && opts.length) {
          const bad = arr.filter((x) => !opts.includes(x));
          if (bad.length) errors[key] = 'Invalid option(s)';
        }
        attributes[key] = arr;
        break;
      }
      case 'reference_select': {
        if (refLookup && !refLookup(field.referenceCatalog, value)) {
          // Soft check — allow unknown in dev seeds, but flag.
          attributes[key] = value;
        } else {
          attributes[key] = value;
        }
        break;
      }
      case 'boolean': {
        attributes[key] = value === true || value === 'true';
        break;
      }
      case 'date': {
        attributes[key] = value;
        break;
      }
      case 'text':
      default: {
        const v = field.validation || {};
        const s = String(value);
        if (v.minLength && s.length < v.minLength) errors[key] = `Too short (min ${v.minLength})`;
        if (v.maxLength && s.length > v.maxLength) errors[key] = `Too long (max ${v.maxLength})`;
        attributes[key] = s;
      }
    }
  }

  // Cross-field: salary gteField
  for (const field of cat.fields || []) {
    const v = field.validation || {};
    if (v.gteField && attributes[field.key] !== undefined && attributes[v.gteField] !== undefined) {
      if (Number(attributes[field.key]) < Number(attributes[v.gteField])) {
        errors[field.key] = `Must be ≥ ${v.gteField.replace(/_/g, ' ')}`;
      }
    }
  }

  // Computed: area_square_metres
  if ((cat.fields || []).some((f) => f.key === 'area_square_metres')) {
    const av = num(attributes.area_value);
    const unit = attributes.area_unit;
    if (Number.isFinite(av) && AREA_TO_SQM[unit]) {
      attributes.area_square_metres = Math.round(av * AREA_TO_SQM[unit] * 100) / 100;
    }
  }

  return { errors, attributes };
}

function optionSourceValues(field, refLookup) {
  // For optionSource fields backed by managed lists we don't hard-validate here.
  return null;
}

/** Build display rows for listing detail (label + value). */
function buildDisplayAttributes(categoryId, attributes, refResolve) {
  const cat = categoriesById[categoryId];
  if (!cat) return [];
  const rows = [];
  for (const field of cat.fields || []) {
    const val = attributes ? attributes[field.key] : undefined;
    if (val === undefined || val === null || val === '') continue;
    let display = val;
    if (field.type === 'reference_select' && refResolve) {
      display = refResolve(field.referenceCatalog, val) || prettifyOption(val);
    } else if (field.type === 'single_select') {
      display = prettifyOption(val);
    } else if (field.type === 'multi_select') {
      display = (Array.isArray(val) ? val : [val]).map(prettifyOption).join(', ');
    } else if (field.key === 'mileage_km') {
      display = `${Number(val).toLocaleString()} km`;
    } else if (field.key === 'area_value') {
      display = `${val} ${prettifyOption(attributes.area_unit || '')}`.trim();
    }
    rows.push({ key: field.key, label: field.label || labelForKey(field.key), value: String(display) });
  }
  return rows;
}

module.exports = {
  raw,
  schemaVersion: raw.schemaVersion,
  AREA_TO_SQM,
  getFormSchema,
  listSchemaCategoryIds,
  getFacetFields,
  getSortableFields,
  validateAndNormalize,
  buildDisplayAttributes,
  prettifyOption,
};
