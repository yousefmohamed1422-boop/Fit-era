import { useCallback, useSyncExternalStore } from 'react';
import {
  BRAND as SEED_BRAND, PRODUCTS as SEED_PRODUCTS, CATEGORIES as SEED_CATEGORIES,
  BUNDLES as SEED_BUNDLES, DISCOUNT_CODES as SEED_DISCOUNTS,
} from '../data/catalog';

/**
 * Stand-in "backend": everything the dashboard edits lives here, in localStorage.
 * Laravel wiring (later): swap each function's body for a fetch()/axios call to your API —
 * the exported names and shapes are designed to map 1:1 onto REST endpoints
 * (e.g. saveProduct → PUT/POST /api/products, listProducts → GET /api/products).
 */

const KEY = 'fe-db-v1';
const listeners = new Set();
let cache = null;

function seed() {
  return {
    brand: { ...SEED_BRAND, promo: { title: 'Get 15% off your fit', text: 'Use the code at checkout on any order. Bundles already save you more, and the code stacks on top.', code: 'FIT15' } },
    products: SEED_PRODUCTS.map((p) => ({ ...p })),
    categories: SEED_CATEGORIES.map((c) => ({ ...c })),
    bundles: SEED_BUNDLES.map((b) => ({ ...b })),
    discounts: { ...SEED_DISCOUNTS },
    admin: { email: 'admin@fitera.com', password: 'fitera2026' },
  };
}
const looksValid = (o) => o && o.products && o.categories && o.bundles && o.brand && o.admin;

function read() {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : null;
  } catch { cache = null; }
  if (!looksValid(cache)) cache = seed();
  return cache;
}
function write(next) {
  cache = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn());
}
function update(mutator) { write(mutator(structuredClone(read()))); }

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function resetDb() { write(seed()); }

/* ---------- live hooks (re-render when their slice changes) ---------- */
const selBrand = (d) => d.brand;
const selProducts = (d) => d.products;
const selCategories = (d) => d.categories;
const selBundles = (d) => d.bundles;
const selDiscounts = (d) => d.discounts;
function useSlice(selector) {
  return useSyncExternalStore(subscribe, useCallback(() => selector(read()), [selector]));
}
export const useBrand = () => useSlice(selBrand);
export const useProducts = () => useSlice(selProducts);
export const useCategories = () => useSlice(selCategories);
export const useBundles = () => useSlice(selBundles);
export const useDiscounts = () => useSlice(selDiscounts);

/* ---------- imperative reads (for use outside React render) ---------- */
export const getBrand = () => read().brand;
export const getDiscounts = () => read().discounts;
export const getAdmin = () => read().admin;

/* ---------- products ---------- */
export function saveProduct(p) {
  update((d) => {
    const i = d.products.findIndex((x) => x.id === p.id);
    if (i >= 0) d.products[i] = p; else d.products.push(p);
    return d;
  });
}
export function deleteProduct(id) { update((d) => { d.products = d.products.filter((x) => x.id !== id); return d; }); }

/* ---------- categories ---------- */
export function saveCategory(c) {
  update((d) => {
    const i = d.categories.findIndex((x) => x.id === c.id);
    if (i >= 0) d.categories[i] = c; else d.categories.push(c);
    return d;
  });
}
export function deleteCategory(id) { update((d) => { d.categories = d.categories.filter((x) => x.id !== id); return d; }); }

/* ---------- bundles ---------- */
export function saveBundle(b) {
  update((d) => {
    const i = d.bundles.findIndex((x) => x.id === b.id);
    if (i >= 0) d.bundles[i] = b; else d.bundles.push(b);
    return d;
  });
}
export function deleteBundle(id) { update((d) => { d.bundles = d.bundles.filter((x) => x.id !== id); return d; }); }

/* ---------- brand & discounts ---------- */
export function saveBrand(partial) { update((d) => ({ ...d, brand: { ...d.brand, ...partial } })); }
export function setDiscount(code, pct) {
  const c = (code || '').trim().toUpperCase();
  if (!c) return;
  update((d) => { d.discounts[c] = Number(pct) || 0; return d; });
}
export function removeDiscount(code) { update((d) => { delete d.discounts[code]; return d; }); }

/* ---------- admin account ---------- */
export function verifyAdmin(email, password) {
  const a = read().admin;
  return a.email.trim().toLowerCase() === (email || '').trim().toLowerCase() && a.password === password;
}
export function updateAdmin(partial) {
  update((d) => ({ ...d, admin: { ...d.admin, ...partial, password: partial.password || d.admin.password } }));
}
