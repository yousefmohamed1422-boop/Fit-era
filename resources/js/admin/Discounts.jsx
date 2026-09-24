import { useState } from 'react';
import Icon from '../Components/Icon';
import { useDiscounts, setDiscount, removeDiscount } from '../lib/db';

export default function Discounts() {
  const discounts = useDiscounts();
  const [code, setCode] = useState('');
  const [pct, setPct] = useState(10);

  const submit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setDiscount(code, pct);
    setCode(''); setPct(10);
  };

  return (
    <div className="max-w-xl space-y-5">
      <form onSubmit={submit} className="glass rounded-3xl p-6 flex flex-wrap gap-3 items-end">
        <label className="flex-1 min-w-[10rem] block"><span className="text-sm font-medium">Code</span><input className="field mt-1.5 uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER20" /></label>
        <label className="w-24 block"><span className="text-sm font-medium">% off</span><input type="number" min="1" max="90" className="field mt-1.5" value={pct} onChange={(e) => setPct(e.target.value)} /></label>
        <button className="btn btn-primary"><Icon name="plus" size={16} /> Add</button>
      </form>

      <div className="glass rounded-3xl overflow-hidden">
        {Object.entries(discounts).length === 0 && <p className="p-6 text-sm text-muted">No codes yet — add one above.</p>}
        {Object.entries(discounts).map(([c, p]) => (
          <div key={c} className="flex items-center justify-between px-5 py-4 border-b border-line last:border-0">
            <span className="font-mono tracking-widest text-sm">{c}</span>
            <span className="text-sm text-muted">{p}% off</span>
            <button className="icon-btn !w-8 !h-8 border border-line" onClick={() => removeDiscount(c)} aria-label={`Delete ${c}`}><Icon name="trash" size={14} /></button>
          </div>
        ))}
      </div>
      <p className="text-[12.5px] text-muted">The code shown on the homepage banner is set separately, under Settings.</p>
    </div>
  );
}
