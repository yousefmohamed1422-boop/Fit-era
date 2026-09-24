import { useEffect, useState } from 'react';
import Icon from '../Components/Icon';
import { OrderTracker } from '../Components/Tracker';
import { Link } from '../lib/router';
import { trackOrder } from '../lib/api';
import { money } from '../data/catalog';
import { useBrand } from '../lib/db';

/** Confirmation screen shown right after placing an order. */
export default function Order({ number }) {
  const brand = useBrand();
  const [order, setOrder] = useState(null);
  useEffect(() => { trackOrder(number).then(setOrder); }, [number]);

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-8 pt-32 sm:pt-40">
      <div className="glass rounded-5xl p-7 sm:p-12 text-center">
        <span className="pop mx-auto grid place-items-center w-20 h-20 rounded-full bg-rose text-white shadow-[0_18px_40px_-14px_var(--rose)]"><Icon name="check" size={38} strokeWidth={2.6} /></span>
        <h1 className="font-display h-lg mt-7">Order placed</h1>
        <p className="mt-3 text-muted max-w-md mx-auto text-[15px]">Thank you. We’ll message you on WhatsApp shortly to confirm your order and delivery time.</p>
        <p className="mt-7 inline-flex flex-col rounded-3xl bg-[var(--stage)] border border-line px-8 py-4">
          <span className="text-[12px] text-muted">Order number</span>
          <span className="font-display text-3xl tracking-wider">{number}</span>
        </p>

        <div className="mt-12 text-left"><OrderTracker step={order?.step ?? 0} /></div>

        {order && (
          <div className="mt-12 text-left rounded-3xl border border-line bg-[var(--stage)] p-5 text-[14px]">
            <ul className="space-y-1.5">
              {order.items?.map((i, k) => <li key={k} className="flex justify-between gap-4"><span>{i.qty} × {i.name} <span className="text-muted">({i.colorName}, {i.size})</span></span></li>)}
            </ul>
            <p className="mt-4 pt-4 border-t border-line flex justify-between font-semibold"><span>Total</span><span>{money(order.total)}</span></p>
            <p className="mt-1 text-muted text-[13px]">{order.payment === 'cod' ? 'Pay in cash when your order arrives.' : 'We’ll send your payment link on WhatsApp.'}</p>
          </div>
        )}

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(`Hi FIT ERA, my order number is ${number}`)}`} target="_blank" rel="noreferrer" className="btn btn-rose"><Icon name="chat" size={17} /> Message us on WhatsApp</a>
          <Link to="/shop/basics" className="btn btn-glass">Keep shopping</Link>
        </div>
      </div>
    </section>
  );
}
