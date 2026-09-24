import Icon from '../Components/Icon';
import { navigate } from '../lib/router';
import { useProducts, useCategories, useBundles } from '../lib/db';
import { listOrders } from '../lib/api';
import { money } from '../data/catalog';

export default function Overview() {
  const products = useProducts();
  const categories = useCategories();
  const bundles = useBundles();
  const orders = listOrders();
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const cards = [
    { label: 'Products', value: products.length, icon: 'shape', go: '/admin/products' },
    { label: 'Categories', value: categories.length, icon: 'tag', go: '/admin/categories' },
    { label: 'Bundles', value: bundles.length, icon: 'layers', go: '/admin/bundles' },
    { label: 'Orders', value: orders.length, icon: 'truck', go: '/admin/orders' },
  ];

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button key={c.label} onClick={() => navigate(c.go)} className="glass rounded-3xl p-5 text-left transition-transform hover:-translate-y-1">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-fg text-bg"><Icon name={c.icon} size={18} /></span>
            <p className="font-display text-3xl mt-4">{c.value}</p>
            <p className="text-muted text-sm">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="glass rounded-3xl p-6 mt-5">
        <p className="text-sm text-muted">Total revenue placed through checkout</p>
        <p className="font-display text-4xl mt-2">{money(revenue)}</p>
      </div>

      <div className="glass rounded-3xl p-6 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent orders</h2>
          <button onClick={() => navigate('/admin/orders')} className="text-[13px] underline underline-offset-2 hover:text-rose">View all</button>
        </div>
        {orders.length === 0 ? (
          <p className="text-muted text-sm">No orders yet — they’ll show up here as customers check out.</p>
        ) : (
          <ul className="divide-y divide-line">
            {orders.slice().reverse().slice(0, 6).map((o) => (
              <li key={o.number} className="py-3 flex items-center justify-between text-sm gap-3">
                <span className="font-medium">{o.number}</span>
                <span className="text-muted truncate flex-1">{o.customer?.name}</span>
                <span>{money(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
