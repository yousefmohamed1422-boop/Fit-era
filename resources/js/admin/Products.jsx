import { useState } from 'react';
import Garment from '../Components/Garment';
import Icon from '../Components/Icon';
import { navigate } from '../lib/router';
import { useProducts, useCategories, saveProduct, deleteProduct } from '../lib/db';
import { COLORS, money } from '../data/catalog';

const SHAPES = ['tee', 'baby', 'tank', 'long'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BADGES = ['', 'Best Seller', 'New'];
const slugify = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function ProductForm({ id }) {
  const products = useProducts();
  const categories = useCategories();
  const existing = id ? products.find((p) => p.id === id) : null;
  const [f, setF] = useState(() => existing || {
    id: Date.now(), name: '', slug: '', category: categories[0]?.id || 'basics', shape: 'tee',
    price: 399, was: '', colors: ['white'], sizes: ['S', 'M', 'L'], rating: 4.8, reviews: 0, badge: '', blurb: '', image: '',
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (arr, val) => (arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const submit = (e) => {
    e.preventDefault();
    const slug = slugify(f.slug || f.name);
    saveProduct({ ...f, slug, price: Number(f.price) || 0, was: f.was ? Number(f.was) : null, rating: Number(f.rating) || 0, reviews: Number(f.reviews) || 0 });
    navigate('/admin/products');
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-5">
      <button type="button" onClick={() => navigate('/admin/products')} className="text-sm text-muted flex items-center gap-1.5 hover:text-fg transition-colors">
        <Icon name="left" size={15} /> Back to products
      </button>

      <div className="glass rounded-3xl p-6 grid sm:grid-cols-2 gap-5">
        <label className="block sm:col-span-2"><span className="text-sm font-medium">Name</span><input className="field mt-1.5" value={f.name} onChange={set('name')} required /></label>
        <label className="block"><span className="text-sm font-medium">Slug</span><input className="field mt-1.5" value={f.slug} onChange={set('slug')} placeholder="auto from name" /></label>
        <label className="block">
          <span className="text-sm font-medium">Category</span>
          <select className="field mt-1.5" value={f.category} onChange={set('category')}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Shape</span>
          <select className="field mt-1.5" value={f.shape} onChange={set('shape')}>{SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Badge</span>
          <select className="field mt-1.5" value={f.badge} onChange={set('badge')}>{BADGES.map((b) => <option key={b} value={b}>{b || 'None'}</option>)}</select>
        </label>
        <label className="block"><span className="text-sm font-medium">Price</span><input type="number" className="field mt-1.5" value={f.price} onChange={set('price')} required /></label>
        <label className="block"><span className="text-sm font-medium">Was (optional)</span><input type="number" className="field mt-1.5" value={f.was || ''} onChange={set('was')} /></label>
        <label className="block"><span className="text-sm font-medium">Rating</span><input type="number" step="0.1" min="0" max="5" className="field mt-1.5" value={f.rating} onChange={set('rating')} /></label>
        <label className="block"><span className="text-sm font-medium">Reviews</span><input type="number" className="field mt-1.5" value={f.reviews} onChange={set('reviews')} /></label>
        <label className="block sm:col-span-2"><span className="text-sm font-medium">Image URL <span className="text-muted font-normal">(optional — leave empty to use the drawn preview)</span></span><input className="field mt-1.5" value={f.image || ''} onChange={set('image')} placeholder="/img/product.jpg" /></label>
        <label className="block sm:col-span-2"><span className="text-sm font-medium">Description</span><textarea rows="3" className="field mt-1.5" value={f.blurb} onChange={set('blurb')} /></label>
      </div>

      <div className="glass rounded-3xl p-6">
        <p className="text-sm font-medium mb-3">Colors</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button type="button" key={c.id} onClick={() => setF({ ...f, colors: toggle(f.colors, c.id) })}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${f.colors.includes(c.id) ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg/40'}`}>
              <span className="w-4 h-4 rounded-full border border-black/20" style={{ background: c.hex }} /> {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <p className="text-sm font-medium mb-3">Sizes</p>
        <div className="flex flex-wrap gap-2">{ALL_SIZES.map((s) => <button type="button" key={s} onClick={() => setF({ ...f, sizes: toggle(f.sizes, s) })} className={`chip ${f.sizes.includes(s) ? 'on' : ''}`}>{s}</button>)}</div>
      </div>

      <div className="flex gap-3">
        <button className="btn btn-primary"><Icon name="check" size={16} /> Save product</button>
        <button type="button" className="btn btn-glass" onClick={() => navigate('/admin/products')}>Cancel</button>
      </div>
    </form>
  );
}

export default function Products({ id }) {
  const products = useProducts();
  if (id) return <ProductForm id={id === 'new' ? null : Number(id)} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-muted text-sm">{products.length} products</p>
        <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')}><Icon name="plus" size={16} /> New product</button>
      </div>
      <div className="glass rounded-3xl overflow-x-auto no-scrollbar">
        <table className="w-full text-sm min-w-[38rem]">
          <thead><tr className="text-left text-muted border-b border-line"><th className="p-4 font-medium">Product</th><th className="p-4 font-medium">Category</th><th className="p-4 font-medium">Price</th><th className="p-4 font-medium">Colors</th><th className="p-4" /></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-fg/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-11 rounded-lg overflow-hidden grid place-items-center shrink-0" style={{ background: 'var(--stage)' }}>
                      <Garment shape={p.shape} color={COLORS.find((c) => c.id === p.colors[0])?.hex} className="w-[80%]" label={false} />
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 capitalize text-muted">{p.category}</td>
                <td className="p-4">{money(p.price)}</td>
                <td className="p-4 text-muted">{p.colors.length}</td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <button className="icon-btn !w-8 !h-8 border border-line" onClick={() => navigate(`/admin/products/${p.id}`)} aria-label="Edit"><Icon name="pencil" size={14} /></button>
                    <button className="icon-btn !w-8 !h-8 border border-line" onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id); }} aria-label="Delete"><Icon name="trash" size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-muted">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
