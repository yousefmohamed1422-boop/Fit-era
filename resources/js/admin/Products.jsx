import { useRef, useState } from 'react';
import Garment from '../Components/Garment';
import Icon from '../Components/Icon';
import { navigate } from '../lib/router';
import { useProducts, useCategories, saveProduct, deleteProduct } from '../lib/db';
import { COLORS, colorById, money } from '../data/catalog';

const SHAPES = ['tee', 'baby', 'tank', 'long'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BADGES = ['', 'Best Seller', 'New'];
const slugify = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function resizeImageFile(file, maxDim = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ProductForm({ id }) {
  const products = useProducts();
  const categories = useCategories();
  const existing = id ? products.find((p) => p.id === id) : null;
  const fileInputRef = useRef(null);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [f, setF] = useState(() => {
    if (!existing) {
      return {
        id: Date.now(), name: '', slug: '', category: categories[0]?.id || 'basics', shape: 'tee',
        price: 399, was: '', colors: ['white'], sizes: ['S', 'M', 'L'], rating: 4.8, reviews: 0, badge: '', blurb: '',
        image: '', images: [], colorImages: {},
      };
    }
    let images = [];
    if (Array.isArray(existing.images) && existing.images.length > 0) {
      images = existing.images.map((img, i) => {
        if (typeof img === 'string') {
          return { id: `img-${i}-${Date.now()}`, url: img, colorId: '', isCover: i === 0 };
        }
        return { ...img, id: img.id || `img-${i}-${Date.now()}` };
      });
    } else if (existing.image) {
      images = [{ id: `img-0-${Date.now()}`, url: existing.image, colorId: '', isCover: true }];
    }
    return {
      ...existing,
      images,
      colorImages: existing.colorImages || {},
    };
  });

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (arr, val) => (arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);
    try {
      const added = [];
      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith('image/')) continue;
        const dataUrl = await resizeImageFile(file);
        added.push({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: dataUrl,
          colorId: '',
          isCover: false,
        });
      }
      setF((prev) => {
        const nextImages = [...(prev.images || []), ...added];
        if (nextImages.length > 0 && !nextImages.some((x) => x.isCover)) {
          nextImages[0].isCover = true;
        }
        return { ...prev, images: nextImages };
      });
    } catch (err) {
      console.error('Failed to read image', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addUrlImage = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const newImg = {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: trimmed,
      colorId: '',
      isCover: (f.images || []).length === 0,
    };
    setF((prev) => ({ ...prev, images: [...(prev.images || []), newImg] }));
    setUrlInput('');
  };

  const removeImage = (imgId) => {
    setF((prev) => {
      const nextImages = (prev.images || []).filter((x) => x.id !== imgId);
      if (nextImages.length > 0 && !nextImages.some((x) => x.isCover)) {
        nextImages[0].isCover = true;
      }
      return { ...prev, images: nextImages };
    });
  };

  const setCoverImage = (imgId) => {
    setF((prev) => ({
      ...prev,
      images: (prev.images || []).map((x) => ({ ...x, isCover: x.id === imgId })),
    }));
  };

  const setImageColor = (imgId, colorId) => {
    setF((prev) => ({
      ...prev,
      images: (prev.images || []).map((x) => (x.id === imgId ? { ...x, colorId } : x)),
    }));
  };

  const moveImage = (index, delta) => {
    setF((prev) => {
      const list = [...(prev.images || [])];
      const target = index + delta;
      if (target < 0 || target >= list.length) return prev;
      const [moved] = list.splice(index, 1);
      list.splice(target, 0, moved);
      return { ...prev, images: list };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    const slug = slugify(f.slug || f.name);

    // Build colorImages mapping from assigned images
    const colorImages = {};
    (f.images || []).forEach((img) => {
      if (img.colorId && !colorImages[img.colorId]) {
        colorImages[img.colorId] = img.url;
      }
    });

    const coverImg = (f.images || []).find((x) => x.isCover)?.url || f.images?.[0]?.url || f.image || '';

    saveProduct({
      ...f,
      slug,
      image: coverImg,
      images: f.images || [],
      colorImages,
      price: Number(f.price) || 0,
      was: f.was ? Number(f.was) : null,
      rating: Number(f.rating) || 0,
      reviews: Number(f.reviews) || 0,
    });
    navigate('/admin/products');
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-6">
      <button type="button" onClick={() => navigate('/admin/products')} className="text-sm text-muted flex items-center gap-1.5 hover:text-fg transition-colors">
        <Icon name="left" size={15} /> Back to products
      </button>

      {/* Main Info */}
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
        <label className="block sm:col-span-2"><span className="text-sm font-medium">Description</span><textarea rows="3" className="field mt-1.5" value={f.blurb} onChange={set('blurb')} /></label>
      </div>

      {/* Colors */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Colors Available</p>
          <span className="text-xs text-muted">{f.colors.length} colors selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button type="button" key={c.id} onClick={() => setF({ ...f, colors: toggle(f.colors, c.id) })}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${f.colors.includes(c.id) ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg/40'}`}>
              <span className="w-4 h-4 rounded-full border border-black/20" style={{ background: c.hex }} /> {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Image Upload & Per-Color Photos */}
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-base font-semibold">Product Images & Color Variations</h3>
            <p className="text-xs text-muted mt-0.5">
              ارفع صورة أو أكثر للموديل، وحدد صورة لكل لون ليظهر لون الموديل تلقائياً عند اختياره في المتجر
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-fg/10">
            {(f.images || []).length} {f.images?.length === 1 ? 'صورة' : 'صور'}
          </span>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            dragOver ? 'border-rose bg-rose/10 scale-[0.99]' : 'border-line hover:border-fg/40 hover:bg-fg/[0.02]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="w-12 h-12 rounded-full bg-fg/10 grid place-items-center text-fg">
              <Icon name="upload" size={24} />
            </span>
            <p className="font-medium text-sm">
              {isUploading ? 'جاري معالجة ورفع الصور...' : 'اضغط لاختيار صور من جهازك أو اسحب الصور هنا'}
            </p>
            <p className="text-xs text-muted">
              يمكنك رفع عدة صور دفعة واحدة (PNG, JPG, WebP)
            </p>
          </div>
        </div>

        {/* Add by URL */}
        <div className="mt-4 flex gap-2">
          <input
            className="field !py-2 text-sm"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="أو أضف رابط صورة مباشر (URL)..."
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrlImage(); } }}
          />
          <button type="button" onClick={addUrlImage} className="btn btn-glass !py-2 !px-4 text-sm shrink-0">
            <Icon name="plus" size={16} /> إضافة رابط
          </button>
        </div>

        {/* Uploaded Images Gallery / List */}
        {(f.images || []).length > 0 ? (
          <div className="mt-5 grid sm:grid-cols-2 gap-3.5">
            {f.images.map((img, idx) => {
              const assignedColor = COLORS.find((c) => c.id === img.colorId);
              return (
                <div
                  key={img.id}
                  className={`relative rounded-2xl border p-3 flex gap-3.5 transition-all ${
                    img.isCover ? 'border-fg bg-fg/5 ring-1 ring-fg' : 'border-line bg-[var(--stage)]'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border border-line bg-black/5">
                    <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                    {img.isCover && (
                      <span className="absolute left-1 top-1 rounded-md bg-fg text-bg text-[10px] font-medium px-1.5 py-0.5">
                        الغلاف
                      </span>
                    )}
                  </div>

                  {/* Info & Controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-semibold text-muted">صورة #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveImage(idx, -1)}
                            className="icon-btn !w-6 !h-6 border border-line disabled:opacity-30"
                            title="تحريك للخلف"
                          >
                            <Icon name="left" size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (f.images.length - 1)}
                            onClick={() => moveImage(idx, 1)}
                            className="icon-btn !w-6 !h-6 border border-line disabled:opacity-30"
                            title="تحريك للأمام"
                          >
                            <Icon name="right" size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="icon-btn !w-6 !h-6 border border-line text-[#c4534f] hover:bg-[#c4534f]/10"
                            title="حذف الصورة"
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Color Assignment */}
                      <label className="block mt-1">
                        <span className="text-[11px] font-medium text-muted block mb-1">اللون المرتبط:</span>
                        <select
                          className="field !py-1 !px-2 text-xs"
                          value={img.colorId || ''}
                          onChange={(e) => setImageColor(img.id, e.target.value)}
                        >
                          <option value="">صورة عامة (لكل الألوان)</option>
                          {f.colors.map((cId) => {
                            const col = colorById(cId);
                            return (
                              <option key={cId} value={cId}>
                                {col.name}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                      {assignedColor && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ background: assignedColor.hex }} />
                          <span className="text-[11px] text-muted truncate">يظهر عند اختيار {assignedColor.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Set as Cover */}
                    {!img.isCover && (
                      <button
                        type="button"
                        onClick={() => setCoverImage(img.id)}
                        className="text-[11px] underline underline-offset-2 text-muted hover:text-fg text-left mt-2"
                      >
                        تعيين كصورة غلاف رئيسية
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-2xl bg-fg/5 text-center text-xs text-muted">
            لم يتم رفع صور بعد. سيتم استخدام المعاينة التوضيحية الافتراضية (Garment SVG) حتى تقوم برفع صور.
          </div>
        )}
      </div>

      {/* Sizes */}
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
  const categories = useCategories();
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('fe-admin-products-view') || 'list';
    } catch {
      return 'list';
    }
  });

  const changeViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('fe-admin-products-view', mode);
    } catch { /* ignore */ }
  };

  if (id) return <ProductForm id={id === 'new' ? null : Number(id)} />;

  // Filter products
  const filtered = products.filter((p) => {
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    if (!matchesCat) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(q);
    const catMatch = p.category?.toLowerCase().includes(q);
    const slugMatch = p.slug?.toLowerCase().includes(q);
    const priceMatch = String(p.price).includes(q);
    return nameMatch || catMatch || slugMatch || priceMatch;
  });

  return (
    <div className="space-y-5">
      {/* Header & New Product Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">المنتجات (Products)</h2>
          <p className="text-muted text-xs mt-0.5">
            إجمالي {products.length} منتج {query || selectedCat !== 'all' ? `· تم العثور على ${filtered.length}` : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')}>
          <Icon name="plus" size={16} /> إضافة منتج جديد
        </button>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            className="field !py-2 !pl-10 !pr-8 text-sm w-full"
            placeholder="بحث بالاسم، القسم، أو السعر..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
              title="مسح البحث"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <select
            className="field !py-2 !px-3 text-sm !w-auto"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="all">كل الأقسام (All Categories)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* View Mode Toggle: List vs Grid */}
          <div className="flex items-center rounded-xl border border-line p-1 bg-[var(--stage)] shrink-0">
            <button
              type="button"
              onClick={() => changeViewMode('list')}
              aria-label="عرض قائمة (تحت بعض)"
              title="عرض قائمة (تحت بعض)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-fg text-bg shadow-sm'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Icon name="list" size={15} />
              <span className="hidden sm:inline">تحت بعض</span>
            </button>
            <button
              type="button"
              onClick={() => changeViewMode('grid')}
              aria-label="عرض مربعات (Grid)"
              title="عرض مربعات (Grid)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-fg text-bg shadow-sm'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Icon name="grid" size={15} />
              <span className="hidden sm:inline">مربعات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Display: List or Grid */}
      {viewMode === 'list' ? (
        /* List / Table View */
        <div className="glass rounded-3xl overflow-x-auto no-scrollbar">
          <table className="w-full text-sm min-w-[38rem]">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                <th className="p-4 font-medium">المنتج</th>
                <th className="p-4 font-medium">القسم</th>
                <th className="p-4 font-medium">السعر</th>
                <th className="p-4 font-medium">الألوان</th>
                <th className="p-4 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const photoCount = Array.isArray(p.images) ? p.images.length : (p.image ? 1 : 0);
                const thumbImg = (Array.isArray(p.images) && p.images[0]?.url) || p.image;
                return (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-fg/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-xl overflow-hidden grid place-items-center shrink-0 border border-line bg-[var(--stage)]">
                          {thumbImg ? (
                            <img src={thumbImg} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Garment shape={p.shape} color={COLORS.find((c) => c.id === p.colors[0])?.hex} className="w-[80%]" label={false} />
                          )}
                        </div>
                        <div>
                          <span
                            onClick={() => navigate(`/admin/products/${p.id}`)}
                            className="font-medium block cursor-pointer hover:text-rose transition-colors"
                          >
                            {p.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted">
                            {p.badge && (
                              <span className="px-1.5 py-0.2 rounded bg-rose/15 text-rose font-medium">
                                {p.badge}
                              </span>
                            )}
                            {photoCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Icon name="image" size={11} /> {photoCount} {photoCount === 1 ? 'صورة' : 'صور'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-muted">{p.category}</td>
                    <td className="p-4 font-semibold">
                      {money(p.price)}
                      {p.was && <span className="block text-xs text-muted line-through font-normal">{money(p.was)}</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {p.colors.slice(0, 5).map((cId) => (
                          <span
                            key={cId}
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ background: COLORS.find((c) => c.id === cId)?.hex || '#888' }}
                            title={COLORS.find((c) => c.id === cId)?.name}
                          />
                        ))}
                        {p.colors.length > 5 && (
                          <span className="text-[10px] text-muted">+{p.colors.length - 5}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="icon-btn !w-8 !h-8 border border-line hover:border-fg"
                          onClick={() => navigate(`/product/${p.slug}`)}
                          title="معاينة في المتجر"
                        >
                          <Icon name="eye" size={14} />
                        </button>
                        <button
                          className="icon-btn !w-8 !h-8 border border-line hover:border-fg"
                          onClick={() => navigate(`/admin/products/${p.id}`)}
                          aria-label="Edit"
                          title="تعديل"
                        >
                          <Icon name="pencil" size={14} />
                        </button>
                        <button
                          className="icon-btn !w-8 !h-8 border border-line text-[#c4534f] hover:bg-[#c4534f]/10"
                          onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id); }}
                          aria-label="Delete"
                          title="حذف"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-muted">
                    {query || selectedCat !== 'all' ? 'لا توجد منتجات تطابق معايير البحث.' : 'لا توجد منتجات حتى الآن.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid / Squares View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const photoCount = Array.isArray(p.images) ? p.images.length : (p.image ? 1 : 0);
            const thumbImg = (Array.isArray(p.images) && (p.images.find(x => x.isCover)?.url || p.images[0]?.url)) || p.image;
            const primaryColor = COLORS.find((c) => c.id === p.colors[0]);

            return (
              <div
                key={p.id}
                className="glass rounded-3xl overflow-hidden p-3.5 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  {/* Square Image Container */}
                  <div className="relative aspect-[4/4.2] rounded-2xl overflow-hidden border border-line bg-[var(--stage)] grid place-items-center">
                    {thumbImg ? (
                      <img
                        src={thumbImg}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Garment
                        shape={p.shape}
                        color={primaryColor?.hex}
                        className="w-[74%] transition-transform duration-500 group-hover:scale-105"
                        label={false}
                      />
                    )}

                    {/* Badge */}
                    {p.badge && (
                      <span className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-md bg-fg/85 text-bg">
                        {p.badge}
                      </span>
                    )}

                    {/* Photos Count Badge */}
                    {photoCount > 0 && (
                      <span className="absolute right-2.5 bottom-2.5 rounded-full bg-[var(--glass-strong)] backdrop-blur-md border border-[var(--glass-border)] px-2 py-0.5 text-[10px] font-medium flex items-center gap-1">
                        <Icon name="image" size={10} /> {photoCount}
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="pt-3.5 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => navigate(`/admin/products/${p.id}`)}
                        className="font-semibold text-sm truncate cursor-pointer hover:text-rose transition-colors"
                        title={p.name}
                      >
                        {p.name}
                      </h3>
                      <span className="font-bold text-sm shrink-0">{money(p.price)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-xs text-muted">
                      <span className="capitalize">{p.category}</span>
                      {p.was && <span className="line-through">{money(p.was)}</span>}
                    </div>

                    {/* Colors Circles */}
                    <div className="flex items-center gap-1 mt-3">
                      {p.colors.map((cId) => (
                        <span
                          key={cId}
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ background: COLORS.find((c) => c.id === cId)?.hex || '#888' }}
                          title={COLORS.find((c) => c.id === cId)?.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-line/60 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => navigate(`/product/${p.slug}`)}
                    className="text-xs text-muted hover:text-fg flex items-center gap-1 transition-colors"
                    title="معاينة في المتجر"
                  >
                    <Icon name="eye" size={13} />
                    <span>المتجر</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate(`/admin/products/${p.id}`)}
                      className="btn btn-glass !py-1 !px-2.5 text-xs flex items-center gap-1"
                    >
                      <Icon name="pencil" size={12} /> تعديل
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id); }}
                      className="icon-btn !w-7 !h-7 border border-line text-[#c4534f] hover:bg-[#c4534f]/10"
                      title="حذف"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full glass rounded-3xl p-12 text-center text-muted">
              {query || selectedCat !== 'all' ? 'لا توجد منتجات تطابق معايير البحث.' : 'لا توجد منتجات حتى الآن.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

