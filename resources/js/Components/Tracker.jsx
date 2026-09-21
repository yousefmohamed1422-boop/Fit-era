import { useEffect, useState } from 'react';
import Icon from './Icon';
import { trackOrder } from '../lib/api';
import { ORDER_STEPS, money } from '../data/catalog';

/** Glass step tracker: completed steps get a check, the current one glows. */
export function OrderTracker({ step = 0 }) {
  // animate from 0 → step after mount so the line fills in
  const [shown, setShown] = useState(-1);
  useEffect(() => {
    setShown(-1);
    const t = setTimeout(() => setShown(step), 120);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${ORDER_STEPS.length}, minmax(0, 1fr))` }}>
      {ORDER_STEPS.map((label, i) => {
        const done = i < shown;
        const current = i === shown;
        return (
          <li key={label} className="relative flex flex-col items-center text-center">
            {i < ORDER_STEPS.length - 1 && (
              <>
                <span className="absolute top-[22px] left-1/2 w-full h-[3px] rounded-full bg-fg/[.12]" />
                <span
                  className="step-line absolute top-[22px] left-1/2 w-full h-[3px] rounded-full bg-gradient-to-r from-rose to-[var(--tint)]"
                  style={{ transform: `scaleX(${done ? 1 : 0})`, transitionDelay: `${i * 220}ms` }}
                />
              </>
            )}
            <span
              className={`step-dot relative z-10 grid place-items-center w-11 h-11 rounded-full border-2 text-sm font-semibold ${
                done ? 'bg-rose border-rose text-white' : current ? 'bg-fg text-bg border-fg scale-110' : 'bg-[var(--glass-strong)] border-fg/15 text-muted'
              }`}
              style={{ transitionDelay: `${i * 220}ms`, ...(current ? { animation: 'pulse-ring 1.8s ease-out infinite' } : null) }}
            >
              {done ? <Icon name="check" size={18} strokeWidth={2.6} /> : i + 1}
            </span>
            <span className={`mt-3 text-[12px] sm:text-[13px] leading-tight transition-colors duration-500 ${done || current ? 'font-semibold text-fg' : 'text-muted'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

const HINTS = [
  'We received your order. Keep an eye on WhatsApp — we’ll message you to confirm.',
  'Confirmed on WhatsApp. We’re getting your pieces ready.',
  'Packed with care and waiting for the courier.',
  'Your order is with the courier. Keep your phone close.',
  'Delivered. We hope it fits perfectly.',
];

export function TrackForm({ initial = '', compact = false }) {
  const [number, setNumber] = useState(initial);
  const [phone, setPhone] = useState('');
  const [state, setState] = useState({ status: 'idle' });

  const search = async (e, n = number) => {
    e?.preventDefault();
    if (!n.trim()) { setState({ status: 'error', msg: 'Enter your order number (like FE-1042).' }); return; }
    setState({ status: 'loading' });
    const order = await trackOrder(n, phone);
    setState(order ? { status: 'ok', order } : { status: 'error', msg: 'We couldn’t find that order. Check the number and WhatsApp number and try again.' });
  };

  useEffect(() => { if (initial) search(null, initial); }, []); // eslint-disable-line

  const o = state.order;
  return (
    <div className={`glass rounded-5xl ${compact ? 'p-5 sm:p-8' : 'p-6 sm:p-10'}`}>
      <form onSubmit={search} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <input className={`field ${state.status === 'error' ? 'err' : ''}`} placeholder="Order number, e.g. FE-1042" value={number} onChange={(e) => setNumber(e.target.value)} aria-label="Order number" />
        <input className="field" placeholder="WhatsApp number (optional)" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="WhatsApp number" />
        <button className="btn btn-primary" disabled={state.status === 'loading'}>
          {state.status === 'loading' ? <span className="w-4 h-4 rounded-full border-2 border-bg/40 border-t-bg animate-spin" /> : <Icon name="search" size={16} />}
          Track
        </button>
      </form>

      {state.status === 'error' && <p role="alert" className="mt-4 text-sm text-[#c4534f]">{state.msg}</p>}
      {state.status === 'idle' && <p className="mt-4 text-[13px] text-muted">Try the demo order <button type="button" className="underline underline-offset-2 hover:text-rose" onClick={() => { setNumber('FE-1042'); search(null, 'FE-1042'); }}>FE-1042</button>.</p>}

      {o && (
        <div key={o.number} className="mt-9 page-enter">
          <div className="flex flex-wrap items-end justify-between gap-2 mb-8">
            <div>
              <p className="text-[12px] text-muted">Order</p>
              <p className="font-display h-md">{o.number}</p>
            </div>
            <p className="text-sm text-muted">Total <b className="text-fg font-semibold">{money(o.total)}</b> · {o.payment === 'cod' ? 'Cash on delivery' : o.payment === 'card' ? 'Card' : 'Wallet'}</p>
          </div>
          <OrderTracker step={o.step} />
          <p className="mt-9 rounded-2xl bg-[var(--stage)] border border-line px-4 py-3 text-[13.5px] text-muted">{HINTS[o.step]}</p>
        </div>
      )}
    </div>
  );
}
