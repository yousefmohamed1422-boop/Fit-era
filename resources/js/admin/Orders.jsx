import { useState } from 'react';
import { listOrders, updateOrderStep } from '../lib/api';
import { ORDER_STEPS, money } from '../data/catalog';

export default function Orders() {
  const [tick, setTick] = useState(0);
  const orders = listOrders();

  return (
    <div className="glass rounded-3xl overflow-x-auto no-scrollbar">
      <table className="w-full text-sm min-w-[38rem]">
        <thead>
          <tr className="text-left text-muted border-b border-line">
            <th className="p-4 font-medium">Order</th>
            <th className="p-4 font-medium">Customer</th>
            <th className="p-4 font-medium">Total</th>
            <th className="p-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice().reverse().map((o) => (
            <tr key={o.number} className="border-b border-line last:border-0">
              <td className="p-4 font-medium">{o.number}{o.demo && <span className="ml-2 text-[10px] text-muted">(demo)</span>}</td>
              <td className="p-4"><span className="block">{o.customer?.name}</span><span className="block text-[12px] text-muted">{o.customer?.whatsapp}</span></td>
              <td className="p-4">{money(o.total)}</td>
              <td className="p-4">
                <select
                  className="field !py-2 !w-auto min-w-[9rem]" value={o.step ?? 0}
                  onChange={(e) => { updateOrderStep(o.number, Number(e.target.value)); setTick((t) => t + 1); }}
                >
                  {ORDER_STEPS.map((s, i) => <option key={s} value={i}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan="4" className="p-10 text-center text-muted">No orders yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
