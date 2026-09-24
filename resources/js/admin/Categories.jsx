import { useState } from 'react';
import Icon from '../Components/Icon';
import { useCategories, saveCategory, deleteCategory } from '../lib/db';
import { COLORS } from '../data/catalog';

const SHAPES = ['tee', 'baby', 'tank', 'long'];
const empty = { id: '', name: '', blurb: '', shape: 'tee', color: 'white', primary: false };
const slugify = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function Categories() {
  const categories = useCategories();
  const [f, setF] = useState(empty);
  const [editing, setEditing] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const edit = (c) => { setEditing(c.id); setF(c); };
  const reset = () => { setEditing(null); setF(empty); };
  const submit = (e) => { e.preventDefault(); saveCategory({ ...f, id: f.id || slugify(f.name) }); reset(); };

  return (
    <div className="grid lg:grid-cols-[1fr_1.15fr] gap-5 items-start">
      <div className="glass rounded-3xl overflow-hidden">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line last:border-0">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{c.name}{c.primary && <span className="ml-2 text-[10px] rounded-full bg-rose text-white px-2 py-0.5">Main</span>}</p>
              <p className="text-[12.5px] text-muted truncate">{c.blurb}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="icon-btn !w-8 !h-8 border border-line" onClick={() => edit(c)} aria-label="Edit"><Icon name="pencil" size={14} /></button>
              <button className="icon-btn !w-8 !h-8 border border-line" onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteCategory(c.id); }} aria-label="Delete"><Icon name="trash" size={14} /></button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="p-6 text-sm text-muted">No categories yet.</p>}
      </div>

      <form onSubmit={submit} className="glass rounded-3xl p-6 space-y-4">
        <p className="font-semibold">{editing ? 'Edit category' : 'New category'}</p>
        <label className="block"><span className="text-sm font-medium">Name</span><input className="field mt-1.5" value={f.name} onChange={set('name')} required /></label>
        <label className="block"><span className="text-sm font-medium">Description</span><input className="field mt-1.5" value={f.blurb} onChange={set('blurb')} /></label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="text-sm font-medium">Preview shape</span><select className="field mt-1.5" value={f.shape} onChange={set('shape')}>{SHAPES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="block"><span className="text-sm font-medium">Preview color</span><select className="field mt-1.5" value={f.color} onChange={set('color')}>{COLORS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        </div>
        <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" checked={f.primary} onChange={set('primary')} className="w-4 h-4" /> Main collection (big tile on the homepage)</label>
        <div className="flex gap-3">
          <button className="btn btn-primary">{editing ? 'Save changes' : 'Add category'}</button>
          {editing && <button type="button" className="btn btn-glass" onClick={reset}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
