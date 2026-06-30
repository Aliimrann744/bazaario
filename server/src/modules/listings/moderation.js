'use strict';
/**
 * Lightweight pre-publication checks (blueprint §5.11). Release-1 rules engine:
 * obvious prohibited terms -> hold for human review; price sanity -> hold; else auto-approve.
 * Real system would add image OCR, perceptual hashes, velocity, duplicate detection, etc.
 */
const PROHIBITED_TERMS = [
  'weapon', 'gun', 'pistol', 'ammo', 'ammunition', 'drug', 'heroin', 'cocaine',
  'fake currency', 'counterfeit', 'human organ', 'kidney for sale', 'wildlife',
];

const CONTACT_REGEX = /(\+?92|0)?3\d{2}[-\s]?\d{7}|\b\d{11}\b/;

function runChecks({ title, description, priceMinor, priceType }) {
  const text = `${title} ${description}`.toLowerCase();
  const flags = [];

  for (const term of PROHIBITED_TERMS) {
    if (text.includes(term)) flags.push({ rule: 'prohibited_terms', detail: term, severity: 'high' });
  }
  if (CONTACT_REGEX.test(description)) {
    flags.push({ rule: 'contact_details', detail: 'phone-like pattern in description', severity: 'low' });
  }
  // Price sanity: a sale listing with 0 price but not a free/contact type
  if (priceType === 'fixed' && (!priceMinor || Number(priceMinor) <= 0)) {
    flags.push({ rule: 'price_anomaly', detail: 'fixed price must be > 0', severity: 'medium' });
  }

  const highOrMedium = flags.filter((f) => f.severity === 'high' || f.severity === 'medium');
  const decision = highOrMedium.length ? 'PENDING_REVIEW' : 'ACTIVE';
  const reason = highOrMedium.length ? highOrMedium.map((f) => f.rule).join(', ') : null;
  return { decision, flags, reason };
}

module.exports = { runChecks, PROHIBITED_TERMS };
