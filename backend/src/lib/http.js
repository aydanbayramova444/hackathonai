export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (what) => new HttpError(404, `${what} not found`);

/**
 * Minimal validator. rules: { field: { required, type: 'string'|'number'|'boolean', oneOf, min, max, maxLength, email, date } }
 * When partial=true, required is ignored (for PATCH). Returns only the fields present in rules.
 */
export function validate(body, rules, { partial = false } = {}) {
  const errors = {};
  const out = {};
  const src = body && typeof body === 'object' ? body : {};

  for (const [field, rule] of Object.entries(rules)) {
    let value = src[field];
    const missing = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

    if (missing) {
      if (rule.required && !partial) errors[field] = 'This field is required';
      else if (value !== undefined && rule.default !== undefined) out[field] = rule.default;
      else if (value !== undefined && rule.type === 'string') out[field] = '';
      else if (value === null && rule.nullable) out[field] = null;
      continue;
    }

    if (rule.type === 'string') {
      if (typeof value !== 'string') { errors[field] = 'Must be text'; continue; }
      value = value.trim();
      if (rule.maxLength && value.length > rule.maxLength) { errors[field] = `Must be at most ${rule.maxLength} characters`; continue; }
      if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { errors[field] = 'Must be a valid email'; continue; }
      if (rule.date && Number.isNaN(Date.parse(value))) { errors[field] = 'Must be a valid date'; continue; }
    } else if (rule.type === 'number') {
      value = Number(value);
      if (!Number.isFinite(value)) { errors[field] = 'Must be a number'; continue; }
      if (rule.integer && !Number.isInteger(value)) { errors[field] = 'Must be a whole number'; continue; }
      if (rule.min !== undefined && value < rule.min) { errors[field] = `Must be at least ${rule.min}`; continue; }
      if (rule.max !== undefined && value > rule.max) { errors[field] = `Must be at most ${rule.max}`; continue; }
    } else if (rule.type === 'boolean') {
      if (typeof value !== 'boolean') { errors[field] = 'Must be true or false'; continue; }
    }

    if (rule.oneOf && !rule.oneOf.includes(value)) { errors[field] = `Must be one of: ${rule.oneOf.join(', ')}`; continue; }
    out[field] = value;
  }

  if (Object.keys(errors).length) throw new HttpError(400, 'Validation failed', errors);
  return out;
}

export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid id');
  return id;
}

/** Build "a = @a, b = @b" for UPDATE statements from a validated object. */
export const setClause = (fields) => Object.keys(fields).map((k) => `${k} = @${k}`).join(', ');
