// Small fetch wrapper that adds the JWT and turns API errors into thrown Errors.
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// Indian Rupees with Indian digit grouping, e.g. ₹1,49,999 (paise shown only when present)
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
export const money = (n) => inr.format(Number(n) || 0).replace(/\.00$/, '');

// Categories rarely change, so fetch them once and share the result.
let categoriesPromise;
export const getCategories = () => {
  categoriesPromise ??= api('/products/categories').catch((e) => {
    categoriesPromise = undefined;
    throw e;
  });
  return categoriesPromise;
};
