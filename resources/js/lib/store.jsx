import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useBrand, getDiscounts } from './db';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const storage = {
  get(k, d) { try { const v = window.localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

export function StoreProvider({ children }) {
  const brand = useBrand();
  /* ── theme ── */
  const [theme, setTheme] = useState(() =>
    storage.get('fe-theme', null) ?? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    storage.set('fe-theme', theme);
  }, [theme]);
  const toggleTheme = useCallback(() => {
    const el = document.documentElement;
    el.classList.add('theme-anim');
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    setTimeout(() => el.classList.remove('theme-anim'), 700);
  }, []);

  /* ── page tint (follows the selected product color) ── */
  const [tint, setTintState] = useState('#CFC6B6');
  const setTint = useCallback((t) => {
    setTintState(t);
    document.documentElement.style.setProperty('--tint', t);
  }, []);

  /* ── toast ── */
  const [toastMsg, setToastMsg] = useState(null);
  const timer = useRef();
  const toast = useCallback((msg) => {
    setToastMsg({ msg, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  /* ── wishlist ── */
  const [wish, setWish] = useState(() => storage.get('fe-wish', []));
  const toggleWish = useCallback((id) => {
    setWish((w) => {
      const next = w.includes(id) ? w.filter((x) => x !== id) : [...w, id];
      storage.set('fe-wish', next);
      return next;
    });
  }, []);

  /* ── cart ── */
  const [items, setItems] = useState(() => storage.get('fe-cart', []));
  const [cartOpen, setCartOpen] = useState(false);
  const [code, setCode] = useState(() => storage.get('fe-code', null));
  useEffect(() => { storage.set('fe-cart', items); }, [items]);
  useEffect(() => { storage.set('fe-code', code); }, [code]);

  const add = useCallback((item, qty = 1, { open = true } = {}) => {
    const key = `${item.id}|${item.colorName}|${item.size}`;
    setItems((cur) => {
      const found = cur.find((i) => i.key === key);
      if (found) return cur.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...cur, { ...item, key, qty }];
    });
    if (open) setCartOpen(true);
  }, []);
  const setQty = useCallback((key, qty) => {
    setItems((cur) => (qty <= 0 ? cur.filter((i) => i.key !== key) : cur.map((i) => (i.key === key ? { ...i, qty } : i))));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const applyCode = useCallback((raw) => {
    const c = (raw || '').trim().toUpperCase();
    const table = getDiscounts();
    if (!c) return { ok: false, msg: 'Enter a code first.' };
    if (!table[c]) return { ok: false, msg: 'That code isn’t valid.' };
    setCode({ code: c, pct: table[c] });
    return { ok: true, msg: `${table[c]}% off applied.` };
  }, []);
  const removeCode = useCallback(() => setCode(null), []);

  const totals = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const discount = code ? Math.round((subtotal * code.pct) / 100) : 0;
    const after = subtotal - discount;
    const shipping = items.length === 0 || after >= brand.freeShippingOver ? 0 : brand.shippingFee;
    return { count, subtotal, discount, shipping, total: after + shipping, after };
  }, [items, code, brand]);

  const value = {
    theme, toggleTheme, tint, setTint, toast, toastMsg,
    wish, toggleWish,
    items, add, setQty, clear, cartOpen, setCartOpen, code, applyCode, removeCode, totals,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
