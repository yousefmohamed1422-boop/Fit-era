import { useState, useEffect } from 'react';
import Icon from '../Components/Icon';
import { CodeBox, Line, Totals } from '../Components/CartDrawer';
import { Link, navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { placeOrder } from '../lib/api';
import { GOVERNORATES, PAYMENT_METHODS } from '../data/catalog';

const phoneOk = (v) => /^\+?\d{9,15}$/.test(v.replace(/[\s-]/g, ''));
const emailOk = (v) => !v || /^\S+@\S+\.\S+$/.test(v);

function Field({ label, hint, error, required, children }) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium">{label}{required && <span className="text-rose"> *</span>}{!required && <span className="text-muted font-normal"> (optional)</span>}</span>
      <div className="mt-1.5">{children}</div>
      <span className={`block text-[12.5px] mt-1.5 transition-colors ${error ? 'text-[#c4534f]' : 'text-muted'}`} role={error ? 'alert' : undefined}>{error || hint}</span>
    </label>
  );
}

export default function Checkout() {
  const { items, totals, code, clear } = useStore();
  const { customer } = useAuth();
  const [f, setF] = useState(() => ({
    name: customer?.name || '',
    whatsapp: customer?.phone || '',
    email: customer?.email || '',
    city: 'Cairo',
    address: '',
    notes: '',
    payment: 'cod',
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (customer) {
      setF((prev) => ({
        ...prev,
        name: prev.name || customer.name || '',
        whatsapp: prev.whatsapp || customer.phone || '',
        email: prev.email || customer.email || '',
      }));
    }
  }, [customer]);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: null }); };

  if (items.length === 0) {
    return (
      <section className="max-w-xl mx-auto px-4 pt-40 text-center">
        <div className="glass rounded-5xl p-10 page-enter">
          <div className="mx-auto w-20 h-20 grid place-items-center rounded-full bg-[var(--stage)] border border-line floaty"><Icon name="bag" size={30} /></div>
          <h1 className="font-display h-md mt-6">Your bag is empty</h1>
          <p className="text-muted mt-2 text-sm">Add a piece to check out.</p>
          <Link to="/shop/basics" className="btn btn-primary mt-7">Shop Basics</Link>
        </div>
      </section>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = 'Enter your full name.';
    if (!phoneOk(f.whatsapp)) er.whatsapp = 'Enter a valid WhatsApp number, like 010 1234 5678.';
    if (!emailOk(f.email)) er.email = 'That email doesn’t look right.';
    if (f.address.trim().length < 8) er.address = 'Enter your full address so the courier can find you.';
    setErrors(er);
    if (Object.keys(er).length) { document.querySelector('[role=alert]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }

    setBusy(true);
    const order = await placeOrder({
      customer: { name: f.name.trim(), whatsapp: f.whatsapp.trim(), email: f.email.trim() || null },
      shipping: { city: f.city, address: f.address.trim(), notes: f.notes.trim() },
      payment: f.payment, code: code?.code || null,
      items: items.map((i) => ({ id: i.id, name: i.name, colorName: i.colorName, size: i.size, qty: i.qty, price: i.price, hex: i.hex, shape: i.shape, image: i.image || null })),
      total: totals.total,
    });
    clear();
    navigate(`/order/${order.number}`);
  };

  return (
    <section className="max-w-[80rem] mx-auto px-4 sm:px-8 pt-28 sm:pt-36">
      <h1 className="font-display h-lg mb-2">Checkout</h1>
      <p className="text-muted mb-10 text-[15px]">No account needed. We’ll confirm your order on WhatsApp.</p>

      <form onSubmit={submit} noValidate className="grid lg:grid-cols-[1.15fr_.85fr] gap-6 lg:gap-10 items-start">
        <div className="space-y-6">
          {/* contact */}
          <div className="glass rounded-5xl p-6 sm:p-9">
            <h2 className="font-semibold text-lg mb-6">Contact</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Full name" required error={errors.name}>
                <input className={`field ${errors.name ? 'err' : ''}`} value={f.name} onChange={set('name')} autoComplete="name" placeholder="Your name" />
              </Field>
              <Field label="WhatsApp number" required error={errors.whatsapp} hint="We message you here to confirm the order.">
                <input className={`field ${errors.whatsapp ? 'err' : ''}`} value={f.whatsapp} onChange={set('whatsapp')} inputMode="tel" autoComplete="tel" placeholder="010 1234 5678" />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Email" error={errors.email} hint="For your receipt. You can skip this.">
                <input className={`field ${errors.email ? 'err' : ''}`} type="email" value={f.email} onChange={set('email')} autoComplete="email" placeholder="you@email.com" />
              </Field>
            </div>
          </div>

          {/* delivery */}
          <div className="glass rounded-5xl p-6 sm:p-9">
            <h2 className="font-semibold text-lg mb-6">Delivery</h2>
            <div className="grid sm:grid-cols-[.6fr_1.4fr] gap-5">
              <Field label="Governorate" required>
                <select className="field" value={f.city} onChange={set('city')} autoComplete="address-level1">
                  {GOVERNORATES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Address" required error={errors.address}>
                <input className={`field ${errors.address ? 'err' : ''}`} value={f.address} onChange={set('address')} autoComplete="street-address" placeholder="Street, building, apartment" />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Notes for the courier">
                <input className="field" value={f.notes} onChange={set('notes')} placeholder="Landmark, best time to call…" />
              </Field>
            </div>
          </div>

          {/* payment */}
          <div className="glass rounded-5xl p-6 sm:p-9">
            <h2 className="font-semibold text-lg mb-6">Payment</h2>
            <div className="grid gap-3" role="radiogroup" aria-label="Payment method">
              {PAYMENT_METHODS.map((m) => {
                const on = f.payment === m.id;
                return (
                  <button
                    type="button" key={m.id} role="radio" aria-checked={on} onClick={() => setF({ ...f, payment: m.id })}
                    className={`text-left flex items-center gap-4 rounded-3xl border px-5 py-4 transition-all duration-400 hover:-translate-y-0.5 ${on ? 'border-rose bg-rose/15 shadow-[0_12px_30px_-16px_var(--rose)]' : 'border-line bg-[var(--stage)] hover:border-fg/40'}`}
                  >
                    <span className={`grid place-items-center w-11 h-11 rounded-2xl transition-colors duration-400 ${on ? 'bg-rose text-white' : 'bg-fg/10'}`}><Icon name={m.icon} size={20} /></span>
                    <span className="flex-1">
                      <span className="block font-medium text-[15px]">{m.label}</span>
                      <span className="block text-[13px] text-muted">{m.note}</span>
                    </span>
                    <span className={`grid place-items-center w-6 h-6 rounded-full border-2 transition-all duration-300 ${on ? 'border-rose bg-rose text-white scale-110' : 'border-fg/25'}`}>{on && <Icon name="check" size={13} strokeWidth={3} />}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* summary */}
        <aside className="glass rounded-5xl p-6 sm:p-8 lg:sticky lg:top-28">
          <h2 className="font-semibold text-lg mb-6">Order summary</h2>
          <ul className="space-y-5">{items.map((it) => <Line key={it.key} item={it} />)}</ul>
          <div className="my-6 border-t border-line pt-6"><CodeBox /></div>
          <Totals />
          <button className="btn btn-primary w-full !py-4 mt-7 text-base" disabled={busy}>
            {busy ? <><span className="w-4 h-4 rounded-full border-2 border-bg/40 border-t-bg animate-spin" /> Placing order…</> : <>Place order · {f.payment === 'cod' ? 'pay on delivery' : 'pay after confirmation'}</>}
          </button>
          <p className="text-[12px] text-muted text-center mt-3">By ordering you agree we may contact you on WhatsApp about this order.</p>
        </aside>
      </form>
    </section>
  );
}
