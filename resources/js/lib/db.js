import { useState, useEffect } from 'react';
import { BRAND, CATEGORIES, PRODUCTS, BUNDLES, DISCOUNT_CODES } from '../data/catalog';

const STORAGE_KEYS = {
  products: 'fe-products',
  categories: 'fe-categories',
  bundles: 'fe-bundles',
  brand: 'fe-brand',
  discounts: 'fe-discounts',
  admin: 'fe-admin-creds',
};

const DEFAULT_ADMIN = {
  email: 'admin@fitera.com',
  password: 'fitera2026',
};

const storage = {
  get(key, fallback) {
    if (typeof window === 'undefined') return fallback;
    try {
      const val = window.localStorage.getItem(key);
      if (val === null || val === undefined) return fallback;
      return JSON.parse(val);
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      return fallback;
    }
  },
  set(key, value) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing localStorage key "${key}":`, e);
    }
  },
};

const listeners = new Set();
function notifyChange() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Error in db listener:', e);
    }
  });
}

function useDbItem(getter) {
  const [val, setVal] = useState(getter);

  useEffect(() => {
    const onUpdate = () => {
      setVal(getter());
    };
    listeners.add(onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      listeners.delete(onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, [getter]);

  return val;
}

/* ────────── Products ────────── */
export function getProducts() {
  const stored = storage.get(STORAGE_KEYS.products, null);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  // Initialize from catalog
  storage.set(STORAGE_KEYS.products, PRODUCTS);
  return PRODUCTS;
}

export function useProducts() {
  return useDbItem(getProducts);
}

export function saveProduct(product) {
  const list = getProducts();
  const index = list.findIndex((p) => p.id === product.id);
  let next;
  if (index >= 0) {
    next = [...list];
    next[index] = { ...list[index], ...product };
  } else {
    next = [product, ...list];
  }
  storage.set(STORAGE_KEYS.products, next);
  notifyChange();
  return next;
}

export function deleteProduct(id) {
  const list = getProducts().filter((p) => p.id !== id);
  storage.set(STORAGE_KEYS.products, list);
  notifyChange();
  return list;
}

/* ────────── Categories ────────── */
export function getCategories() {
  const stored = storage.get(STORAGE_KEYS.categories, null);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  storage.set(STORAGE_KEYS.categories, CATEGORIES);
  return CATEGORIES;
}

export function useCategories() {
  return useDbItem(getCategories);
}

export function saveCategory(category) {
  const list = getCategories();
  const index = list.findIndex((c) => c.id === category.id);
  let next;
  if (index >= 0) {
    next = [...list];
    next[index] = { ...list[index], ...category };
  } else {
    next = [...list, category];
  }
  storage.set(STORAGE_KEYS.categories, next);
  notifyChange();
  return next;
}

export function deleteCategory(id) {
  const list = getCategories().filter((c) => c.id !== id);
  storage.set(STORAGE_KEYS.categories, list);
  notifyChange();
  return list;
}

/* ────────── Bundles ────────── */
export function getBundles() {
  const stored = storage.get(STORAGE_KEYS.bundles, null);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  storage.set(STORAGE_KEYS.bundles, BUNDLES);
  return BUNDLES;
}

export function useBundles() {
  return useDbItem(getBundles);
}

export function saveBundle(bundle) {
  const list = getBundles();
  const index = list.findIndex((b) => b.id === bundle.id);
  let next;
  if (index >= 0) {
    next = [...list];
    next[index] = { ...list[index], ...bundle };
  } else {
    next = [...list, bundle];
  }
  storage.set(STORAGE_KEYS.bundles, next);
  notifyChange();
  return next;
}

export function deleteBundle(id) {
  const list = getBundles().filter((b) => b.id !== id);
  storage.set(STORAGE_KEYS.bundles, list);
  notifyChange();
  return list;
}

/* ────────── Brand ────────── */
export function getBrand() {
  const stored = storage.get(STORAGE_KEYS.brand, null);
  if (stored && typeof stored === 'object') return { ...BRAND, ...stored };
  storage.set(STORAGE_KEYS.brand, BRAND);
  return BRAND;
}

export function useBrand() {
  return useDbItem(getBrand);
}

export function saveBrand(brandUpdate) {
  const current = getBrand();
  const next = { ...current, ...brandUpdate };
  storage.set(STORAGE_KEYS.brand, next);
  notifyChange();
  return next;
}

/* ────────── Discounts ────────── */
export function getDiscounts() {
  const stored = storage.get(STORAGE_KEYS.discounts, null);
  if (stored && typeof stored === 'object') return stored;
  storage.set(STORAGE_KEYS.discounts, DISCOUNT_CODES);
  return DISCOUNT_CODES;
}

export function useDiscounts() {
  return useDbItem(getDiscounts);
}

export function setDiscount(code, pct) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) return getDiscounts();
  const all = { ...getDiscounts(), [cleanCode]: Number(pct) };
  storage.set(STORAGE_KEYS.discounts, all);
  notifyChange();
  return all;
}

export function removeDiscount(code) {
  const cleanCode = (code || '').trim().toUpperCase();
  const all = { ...getDiscounts() };
  delete all[cleanCode];
  storage.set(STORAGE_KEYS.discounts, all);
  notifyChange();
  return all;
}

/* ────────── Admin Auth Data ────────── */
export function getAdminCreds() {
  const stored = storage.get(STORAGE_KEYS.admin, null);
  if (stored && stored.email && stored.password) return stored;
  storage.set(STORAGE_KEYS.admin, DEFAULT_ADMIN);
  return DEFAULT_ADMIN;
}

export function verifyAdmin(email, password) {
  const creds = getAdminCreds();
  const matchEmail = (email || '').trim().toLowerCase() === creds.email.toLowerCase();
  const matchPassword = (password || '') === creds.password;
  return matchEmail && matchPassword;
}

export function updateAdmin({ email, password }) {
  const current = getAdminCreds();
  const next = {
    email: email ? email.trim() : current.email,
    password: password ? password : current.password,
  };
  storage.set(STORAGE_KEYS.admin, next);
  notifyChange();
  return next;
}
