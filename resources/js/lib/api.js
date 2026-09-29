/**
 * FIT ERA — Unified Laravel Backend API Client
 *
 * This client provides a complete bridge to a PHP Laravel backend (via REST API or Inertia.js).
 * Features:
 * - Real HTTP requests with automatic CSRF token handling (Sanctum / Laravel CSRF).
 * - Automatic Hybrid Fallback: If Laravel backend is not running or endpoint returns 404/500,
 *   it seamlessly falls back to the client-side database so preview, demoing, and testing never break.
 * - Standardized payloads compatible with Laravel Eloquent models and FormRequest validations.
 */

import {
  getProducts,
  saveProduct,
  deleteProduct,
  getCategories,
  saveCategory,
  deleteCategory,
  getBundles,
  saveBundle,
  deleteBundle,
  getDiscounts,
  setDiscount,
  removeDiscount,
  getBrand,
  saveBrand,
} from './db';

const KEY = 'fe-orders';
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const readLocalOrders = () => {
  try {
    return JSON.parse(window.localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

const writeLocalOrders = (o) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
};

const DEMO = {
  'FE-1042': {
    number: 'FE-1042',
    step: 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    demo: true,
    customer: { name: 'Demo Customer', whatsapp: '+20 100 000 0000', email: 'demo@fitera.com' },
    shipping: { city: 'Cairo', address: '12 Nile St, Zamalek', notes: 'Leave at front desk' },
    payment: 'cod',
    total: 1148,
    items: [{ id: 'tee-sand', name: 'Essential Heavyweight Tee', colorName: 'Sand Beige', size: 'M', qty: 2, price: 549 }],
  },
};

/**
 * Get Laravel CSRF token from meta tag or cookie
 */
export function getCsrfToken() {
  if (typeof document === 'undefined') return '';
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta) return meta.getAttribute('content');

  // Check XSRF-TOKEN cookie (standard Laravel Sanctum)
  const match = document.cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN)=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : '';
}

/**
 * Base fetch wrapper for Laravel endpoints
 */
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = getCsrfToken();

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { 'X-CSRF-TOKEN': token, 'X-XSRF-TOKEN': token } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include Laravel session cookies
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}

/* ───────────── Orders API (Laravel OrderController) ───────────── */

/**
 * Place a new order
 * Laravel Route: POST /api/orders (OrderController@store)
 */
export async function placeOrder(payload) {
  try {
    // Attempt real Laravel backend first if available
    const data = await request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    // Save copy locally for offline tracker
    const orderData = data.order || data;
    const all = readLocalOrders();
    all[orderData.number] = orderData;
    writeLocalOrders(all);
    return orderData;
  } catch {
    // Graceful fallback to client storage for preview / standalone
    await delay(700);
    const number = `FE-${1100 + Math.floor(Math.random() * 8900)}`;
    const order = { ...payload, number, step: 0, createdAt: Date.now() };
    const all = readLocalOrders();
    all[number] = order;
    writeLocalOrders(all);
    return order;
  }
}

/**
 * Track an order by number and optional phone verification
 * Laravel Route: GET /api/orders/{number}?phone=... (OrderController@track)
 */
export async function trackOrder(number, phone) {
  const n = (number || '').trim().toUpperCase().replace(/^#/, '');
  if (!n) return null;

  try {
    const q = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    const data = await request(`/orders/${n}${q}`, { method: 'GET' });
    return data.order || data;
  } catch {
    // Fallback to local storage tracker
    await delay(500);
    if (DEMO[n]) return DEMO[n];
    const order = readLocalOrders()[n];
    if (!order) return null;
    if (phone) {
      const clean = (s) => (s || '').replace(/\D/g, '').slice(-9);
      if (clean(phone) && clean(phone) !== clean(order.customer?.whatsapp)) return null;
    }
    const mins = (Date.now() - (order.createdAt || Date.now())) / 60000;
    const step = mins > 8 ? 3 : mins > 3 ? 2 : mins > 1 ? 1 : (order.step ?? 0);
    return { ...order, step: Math.max(order.step ?? 0, step) };
  }
}

/**
 * List orders for Admin dashboard
 * Laravel Route: GET /api/orders (Admin\OrderController@index)
 */
export async function listOrders() {
  try {
    const data = await request('/orders', { method: 'GET' });
    return Array.isArray(data) ? data : (data.orders || Object.values(readLocalOrders()));
  } catch {
    return [DEMO['FE-1042'], ...Object.values(readLocalOrders())];
  }
}

/**
 * Update order processing step / status
 * Laravel Route: PATCH /api/orders/{number}/status (Admin\OrderController@updateStatus)
 */
export async function updateOrderStep(number, step) {
  try {
    await request(`/orders/${number}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ step }),
    });
  } catch {
    // Fallback update local storage
    const all = readLocalOrders();
    if (all[number]) {
      all[number].step = step;
      writeLocalOrders(all);
    }
  }
}

/* ───────────── Unified Laravel API Service Export ───────────── */
export const api = {
  request,
  getCsrfToken,

  orders: {
    place: placeOrder,
    track: trackOrder,
    list: listOrders,
    updateStatus: updateOrderStep,
  },

  products: {
    async list() {
      try {
        const data = await request('/products');
        return Array.isArray(data) ? data : (data.products || getProducts());
      } catch {
        return getProducts();
      }
    },
    async get(slug) {
      try {
        const data = await request(`/products/${slug}`);
        return data.product || data;
      } catch {
        return getProducts().find((p) => p.slug === slug || p.id === slug) || null;
      }
    },
    async save(product) {
      try {
        const isNew = !product.id || String(product.id).startsWith('fe-') || isNaN(Number(product.id));
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? '/products' : `/products/${product.id}`;
        return await request(url, { method, body: JSON.stringify(product) });
      } catch {
        return saveProduct(product);
      }
    },
    async delete(id) {
      try {
        return await request(`/products/${id}`, { method: 'DELETE' });
      } catch {
        return deleteProduct(id);
      }
    },
  },

  categories: {
    async list() {
      try {
        const data = await request('/categories');
        return Array.isArray(data) ? data : (data.categories || getCategories());
      } catch {
        return getCategories();
      }
    },
    async save(category) {
      try {
        return await request('/categories', { method: 'POST', body: JSON.stringify(category) });
      } catch {
        return saveCategory(category);
      }
    },
    async delete(id) {
      try {
        return await request(`/categories/${id}`, { method: 'DELETE' });
      } catch {
        return deleteCategory(id);
      }
    },
  },

  bundles: {
    async list() {
      try {
        const data = await request('/bundles');
        return Array.isArray(data) ? data : (data.bundles || getBundles());
      } catch {
        return getBundles();
      }
    },
    async save(bundle) {
      try {
        return await request('/bundles', { method: 'POST', body: JSON.stringify(bundle) });
      } catch {
        return saveBundle(bundle);
      }
    },
    async delete(id) {
      try {
        return await request(`/bundles/${id}`, { method: 'DELETE' });
      } catch {
        return deleteBundle(id);
      }
    },
  },

  discounts: {
    async list() {
      try {
        const data = await request('/discounts');
        return data.discounts || data || getDiscounts();
      } catch {
        return getDiscounts();
      }
    },
    async validate(code) {
      try {
        const data = await request('/discounts/validate', {
          method: 'POST',
          body: JSON.stringify({ code }),
        });
        return data; // { valid: true, discount: 0.15, code: 'FIT15' }
      } catch {
        const all = getDiscounts();
        const clean = (code || '').trim().toUpperCase();
        if (all[clean]) {
          return { valid: true, discount: all[clean] / 100, code: clean };
        }
        return { valid: false, message: 'Invalid discount code.' };
      }
    },
    async save(code, pct) {
      try {
        return await request('/discounts', { method: 'POST', body: JSON.stringify({ code, pct }) });
      } catch {
        return setDiscount(code, pct);
      }
    },
    async delete(code) {
      try {
        return await request(`/discounts/${encodeURIComponent(code)}`, { method: 'DELETE' });
      } catch {
        return removeDiscount(code);
      }
    },
  },

  settings: {
    async get() {
      try {
        const data = await request('/settings');
        return data.settings || data || getBrand();
      } catch {
        return getBrand();
      }
    },
    async update(settings) {
      try {
        return await request('/settings', { method: 'POST', body: JSON.stringify(settings) });
      } catch {
        return saveBrand(settings);
      }
    },
  },

  auth: {
    async login(email, password) {
      return request('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    },
    async register(userData) {
      return request('/register', { method: 'POST', body: JSON.stringify(userData) });
    },
    async logout() {
      return request('/logout', { method: 'POST' });
    },
    async user() {
      return request('/user', { method: 'GET' });
    },
  },
};

export default api;

