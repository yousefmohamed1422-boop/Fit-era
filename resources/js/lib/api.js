/**
 * Mock backend. Everything the storefront needs from the server goes through these two functions.
 *
 * Laravel wiring (later):
 *   placeOrder → POST /orders    (OrderController@store, guest checkout, no auth)
 *   trackOrder → GET  /orders/{number}?phone=...  (OrderController@show)
 * Same payload / response shape, so only these two functions change.
 */

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const KEY = 'fe-orders';

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const write = (o) => { try { window.localStorage.setItem(KEY, JSON.stringify(o)); } catch { /* ignore */ } };

const DEMO = {
  'FE-1042': {
    number: 'FE-1042', step: 3, createdAt: Date.now() - 1000 * 60 * 60 * 30, demo: true,
    customer: { name: 'Demo Customer', whatsapp: '+20 100 000 0000' },
    payment: 'cod', total: 1148, items: [{ name: 'Essential Tee', colorName: 'Sand Beige', size: 'M', qty: 2 }],
  },
};

export async function placeOrder(payload) {
  await delay(900);
  const number = `FE-${1100 + Math.floor(Math.random() * 8900)}`;
  const order = { ...payload, number, step: 0, createdAt: Date.now() };
  const all = read();
  all[number] = order;
  write(all);
  return order;
}

export async function trackOrder(number, phone) {
  await delay(650);
  const n = (number || '').trim().toUpperCase().replace(/^#/, '');
  if (DEMO[n]) return DEMO[n];
  const order = read()[n];
  if (!order) return null;
  if (phone) {
    const clean = (s) => (s || '').replace(/\D/g, '').slice(-9);
    if (clean(phone) && clean(phone) !== clean(order.customer?.whatsapp)) return null;
  }
  // demo: orders "progress" over time so the tracker feels alive
  const mins = (Date.now() - order.createdAt) / 60000;
  const step = mins > 8 ? 3 : mins > 3 ? 2 : mins > 1 ? 1 : 0;
  return { ...order, step: Math.max(order.step, step) };
}
