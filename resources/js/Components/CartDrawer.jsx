import { useState } from 'react';
import Garment from './Garment';
import Icon from './Icon';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { money } from '../data/catalog';
import { useBrand } from '../lib/db';

export function CodeBox() {
  const { code, applyCode, removeCode } = useStore();
  const [v, setV] = useState('');
  const [msg, setMsg] = useState(null);
  if (code) {
    return (
      <div className="flex items-center justify-between rounded-2xl bg-rose/20 border border-rose/40 px-4 py-2.5 text-sm pop">
        <span className="flex items-center gap-2"><Icon name="tag" size={15} /> <b className="font-mono tracking-widest">{code.code}</b> · {code.pct}% off</span>
        <button onClick={removeCode} className="text-[12px] underline underline-offset-2 hover:text-rose">Remove</button>
      </div>
    );
  }
  const submit = (e) => { e.preventDefault(); setMsg(applyCode(v)); };
  return (
    <form onSubmit={submit}>
      <div className="flex gap-2">
        <input className={`field !py-2.5 uppercase ${msg && !msg.ok ? 'err' : ''}`} placeholder="Discount code" value={v} onChange={(e) => { setV(e.target.value); setMsg(null); }} aria-label="Discount code" />
        <button className="btn btn-glass !py-2.5 !px-5">Apply</button>
      </div>
      {msg && !msg.ok && <p role="alert" className="mt-2 text-[12.5px] text-[#c4534f]">{msg.msg}</p>}
    </form>
  );
}

export function Totals({ className = '' }) {
  const { totals } = useStore();
  return (
    <dl className={`space-y-2 text-[14px] ${className}`}>
      <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
      {totals.discount > 0 && <div className="flex justify-between text-rose"><dt>Discount</dt><dd>−{money(totals.discount)}</dd></div>}
      <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{totals.shipping === 0 ? 'Free' : money(totals.shipping)}</dd></div>
      <div className="flex justify-between pt-3 mt-1 border-t border-line text-base font-semibold"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
    </dl>
  );
}

export function Line({ item, compact = false }) {
  const { setQty } = useStore();
  return (
    <li className="flex gap-4">
      <div className="w-[4.6rem] h-[5.4rem] shrink-0 rounded-2xl grid place-items-center overflow-hidden border border-line" style={{ background: 'var(--stage)' }}>
        <Garment shape={item.shape} color={item.hex} className="w-[80%]" label={false} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-3">
          <p className="font-medium text-[14.5px] leading-tight">{item.name}</p>
          <p className="font-semibold text-[14px] shrink-0">{money(item.price * item.qty)}</p>
        </div>
        <p className="text-[12.5px] text-muted mt-0.5">{item.colorName} · Size {item.size}</p>
        <div className="mt-2.5 flex items-center justify-between">
          {compact ? (
            <span className="text-[12.5px] text-muted">Qty {item.qty}</span>
          ) : (
            <div className="inline-flex items-center rounded-full border border-line">
              <button className="icon-btn !w-8 !h-8" onClick={() => setQty(item.key, item.qty - 1)} aria-label="Decrease quantity"><Icon name="minus" size={14} /></button>
              <span key={item.qty} className="pop w-6 text-center text-sm font-medium">{item.qty}</span>
              <button className="icon-btn !w-8 !h-8" onClick={() => setQty(item.key, item.qty + 1)} aria-label="Increase quantity"><Icon name="plus" size={14} /></button>
            </div>
          )}
          {!compact && <button onClick={() => setQty(item.key, 0)} className="text-[12px] text-muted underline underline-offset-2 hover:text-rose transition-colors">Remove</button>}
        </div>
      </div>
    </li>
  );
}

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, totals } = useStore();
  const brand = useBrand();
  const left = Math.max(0, brand.freeShippingOver - totals.after);
  const pct = Math.min(100, (totals.after / brand.freeShippingOver) * 100);
  const close = () => setCartOpen(false);

  return (
    <>
      <div onClick={close} className={`fixed inset-0 z-50 bg-black/35 backdrop-blur-[3px] transition-opacity duration-500 ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <aside
        role="dialog" aria-modal="true" aria-label="Shopping bag" inert={!cartOpen} style={{ background: 'color-mix(in srgb, var(--bg) 78%, transparent)' }}
        className={`fixed z-50 top-3 right-3 bottom-3 w-[min(27rem,calc(100vw-1.5rem))] glass glass-strong rounded-[34px] flex flex-col transition-transform duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)] ${cartOpen ? 'translate-x-0' : 'translate-x-[112%]'}`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="font-display text-3xl">Your bag <span className="text-muted text-xl">({totals.count})</span></h2>
          <button className="icon-btn border border-line" onClick={close} aria-label="Close bag"><Icon name="close" size={18} /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center text-center px-8">
            <div>
              <div className="mx-auto w-20 h-20 grid place-items-center rounded-full bg-[var(--stage)] border border-line floaty"><Icon name="bag" size={30} /></div>
              <p className="mt-6 font-semibold">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted">Start with something soft. Basics are a good place to begin.</p>
              <button className="btn btn-primary mt-6" onClick={() => { close(); navigate('/shop/basics'); }}>Shop Basics</button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 pb-4">
              <p className="text-[13px]">
                {left > 0 ? <>Add <b>{money(left)}</b> more for free delivery</> : <span className="text-rose font-medium">You’ve unlocked free delivery</span>}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-fg/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-rose to-[var(--tint)] transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-5 pb-4">
              {items.map((it) => <Line key={it.key} item={it} />)}
            </ul>
            <div className="px-6 pt-4 pb-6 border-t border-line space-y-4">
              <CodeBox />
              <Totals />
              <button className="btn btn-primary w-full !py-4" onClick={() => { close(); navigate('/checkout'); }}>
                Checkout <Icon name="right" size={16} />
              </button>
              <p className="text-center text-[12px] text-muted">No account needed. We confirm your order on WhatsApp.</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
