import { useState } from 'react';
import Icon from '../Components/Icon';
import { useBundles, saveBundle, deleteBundle } from '../lib/db';
import { COLORS, money } from '../data/catalog';

const SHAPES = ['tee', 'baby', 'tank', 'long'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const empty = { id: '', name: '', desc: '', price: 0, was: 0, sizes: ['S', 'M', 'L'], items: [{ shape: 'tee', color: 'white' }] };
const slugify = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function Bundles() {
  const bundles = useBundles();
  const [f, setF] = useState(empty);
  const [editing, setEditing] = useState(null);
  const reset = () => { setEditing(null); setF(empty); };
  const edit = (b) => { setEditing(b.id); setF(b); };
  const setItem = (i, key, val) => { const items = [...f.items]; items[i] = { ...items[i], [key]: val }; setF({ ...f, items }); };
  const submit = (e) => {
    e.preventDefault();
    saveBundle({ ...f, id: f.id || slugify(f.name), price: Number(f.price) || 0, was: Number(f.was) || 0 });
    reset();
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.15fr] gap-5 items-start">
      <div className="glass rounded-3xl overflow-hidden">
        {bundles.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line last:border-0">
            <div className="min-w-0"><p className="font-medium text-sm truncate">{b.name}</p><p className="text-[12.5px] text-muted">{money(b.price)} · {b.items.length} pieces</p></div>
            <div className="flex gap-2 shrink-0">
              <button className="icon-btn !w-8 !h-8 border border-line" onClick={() => edit(b)} aria-label="Edit"><Icon name="pencil" size={14} /></button>
              <button className="icon-btn !w-8 !h-8 border border-line" onClick={() => { if (confirm(`Delete "${b.name}"?`)) deleteBundle(b.id); }} aria-label="Delete"><Icon name="trash" size={14} /></button>
            </div>
          </div>
        ))}
        {bundles.length === 0 && <p className="p-6 text-sm text-muted">No bundles yet.</p>}
      </div>

      <form onSubmit={submit} className="glass rounded-3xl p-6 space-y-4">
        <p className="font-semibold">{editing ? 'Edit bundle' : 'New bundle'}</p>
        <label className="block"><span className="text-sm font-medium">Name</span><input className="field mt-1.5" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></label>
        <label className="block"><span className="text-sm font-medium">Description</span><input className="field mt-1.5" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="text-sm font-medium">Price</span><input type="number" className="field mt-1.5" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></label>
          <label className="block"><span className="text-sm font-medium">Was</span><input type="number" className="field mt-1.5" value={f.was} onChange={(e) => setF({ ...f, was: e.target.value })} /></label>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Sizes</p>
          <div className="flex flex-wrap gap-2">{ALL_SIZES.map((s) => <button type="button" key={s} onClick={() => setF({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] })} className={`chip ${f.sizes.includes(s) ? 'on' : ''}`}>{s}</button>)}</div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Pieces in this bundle</p>
            <button type="button" className="text-[12.5px] underline underline-offset-2 hover:text-rose" onClick={() => setF({ ...f, items: [...f.items, { shape: 'tee', color: 'white' }] })}>+ Add piece</button>
          </div>
          <div className="space-y-2">
            {f.items.map((it, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select className="field" value={it.shape} onChange={(e) => setItem(i, 'shape', e.target.value)}>{SHAPES.map((s) => <option key={s}>{s}</option>)}</select>
                <select className="field" value={it.color} onChange={(e) => setItem(i, 'color', e.target.value)}>{COLORS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                {f.items.length > 1 && <button type="button" className="icon-btn !w-9 !h-9 border border-line shrink-0" onClick={() => setF({ ...f, items: f.items.filter((_, x) => x !== i) })} aria-label="Remove piece"><Icon name="trash" size={13} /></button>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary">{editing ? 'Save changes' : 'Add bundle'}</button>
          {editing && <button type="button" className="btn btn-glass" onClick={reset}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
