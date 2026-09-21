import { useEffect, useState } from 'react';
import Garment from '../Components/Garment';
import Icon from '../Components/Icon';
import ProductCard from '../Components/ProductCard';
import { Reveal, Stars } from '../Components/ui';
import { Link, goSection, navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { BRAND, CATEGORIES, colorById, money } from '../data/catalog';

const FEATURES = [
  { icon: 'leaf', t: 'Soft & breathable', d: 'Gentle on skin, comfortable all day.' },
  { icon: 'stretch', t: 'Balanced stretch', d: 'Moves with you and keeps its shape.' },
  { icon: 'layers', t: 'Fully opaque', d: 'Smooth coverage in every color.' },
  { icon: 'shape', t: 'Flattering fit', d: 'Clean lines that sit right on the body.' },
];

export default function Product({ product: p, related = [] }) {
  const { add, setTint, wish, toggleWish, toast } = useStore();
  const [colorId, setColorId] = useState(p.colors[0]);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const c = colorById(colorId);
  const cat = CATEGORIES.find((x) => x.id === p.category);
  const liked = wish.includes(p.id);
  const idx = p.colors.indexOf(colorId);

  useEffect(() => { setTint(c.tint); }, [colorId]); // eslint-disable-line
  useEffect(() => { setColorId(p.colors[0]); setSize(null); setQty(1); }, [p.id]); // eslint-disable-line

  const item = () => ({ id: p.id, name: p.name, shape: p.shape, hex: c.hex, colorName: c.name, size, price: p.price });
  const guard = () => { if (!size) { setErr(true); setTimeout(() => setErr(false), 700); return false; } return true; };
  const addToBag = () => { if (!guard()) return; add(item(), qty); toast(`${p.name} added to your bag`); };
  const buyNow = () => { if (!guard()) return; add(item(), qty, { open: false }); navigate('/checkout'); };
  const cycle = (d) => setColorId(p.colors[(idx + d + p.colors.length) % p.colors.length]);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 12, y: -((e.clientY - r.top) / r.height - 0.5) * 8 });
  };

  return (
    <>
      <section className="max-w-[88rem] mx-auto px-4 sm:px-8 pt-28 sm:pt-32">
        <nav aria-label="Breadcrumb" className="text-[13px] text-muted mb-6 flex flex-wrap gap-x-1.5">
          <Link to="/" className="hover:text-fg transition-colors">Home</Link> /
          <Link to={`/shop/${p.category}`} className="hover:text-fg transition-colors">{cat?.name}</Link> /
          <span className="text-fg">{p.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-8 lg:gap-14 items-start">
          {/* gallery */}
          <div className="lg:sticky lg:top-28">
            <div className="glass rounded-5xl relative overflow-hidden aspect-[5/5.2]" onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
              <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: c.tint, opacity: 0.26 }} />
              <span
                key={c.id} className="absolute inset-x-0 top-[5%] text-center font-display leading-none select-none pointer-events-none"
                style={{ fontSize: 'clamp(5rem, 16vw, 11rem)', color: 'transparent', WebkitTextStroke: '1.5px color-mix(in srgb, var(--fg) 13%, transparent)', animation: 'word-in .7s both' }}
              >{c.name.split(' ').pop()}</span>
              <div className="absolute inset-0 grid place-items-center pb-6" style={{ perspective: 900 }}>
                <div className="w-[66%] transition-transform duration-300 ease-out" style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}>
                  {p.image ? <img src={p.image} alt={p.name} className="w-full" /> : <Garment shape={p.shape} color={c.hex} className="w-full drop-shadow-[0_30px_36px_rgba(0,0,0,.2)]" title={`${p.name} in ${c.name}`} />}
                </div>
              </div>
              <button className="icon-btn !w-11 !h-11 absolute left-4 top-1/2 -translate-y-1/2 bg-[var(--glass-strong)] backdrop-blur border border-[var(--glass-border)]" onClick={() => cycle(-1)} aria-label="Previous color"><Icon name="left" size={18} /></button>
              <button className="icon-btn !w-11 !h-11 absolute right-4 top-1/2 -translate-y-1/2 bg-[var(--glass-strong)] backdrop-blur border border-[var(--glass-border)]" onClick={() => cycle(1)} aria-label="Next color"><Icon name="right" size={18} /></button>
              {p.badge && <span className={`absolute left-5 top-5 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${p.badge === 'Best Seller' ? 'bg-rose text-white' : 'bg-fg text-bg'}`}>{p.badge}</span>}
            </div>
            <div className="flex items-center justify-center gap-2 mt-5">
              {p.colors.map((id) => {
                const col = colorById(id);
                return (
                  <button key={id} onClick={() => setColorId(id)} aria-label={col.name} aria-pressed={id === colorId}
                    className={`w-14 h-16 rounded-2xl grid place-items-center overflow-hidden border transition-all duration-400 hover:-translate-y-1 ${id === colorId ? 'border-fg scale-105 bg-[var(--glass-strong)]' : 'border-line bg-[var(--stage)]'}`}>
                    <Garment shape={p.shape} color={col.hex} className="w-[78%]" label={false} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* details */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display h-lg">{p.name}</h1>
                <div className="mt-3 flex items-center gap-3"><Stars value={p.rating} reviews={`${p.reviews} ratings`} size={15} /></div>
              </div>
              <button onClick={() => toggleWish(p.id)} aria-pressed={liked} aria-label="Wishlist" className="icon-btn border border-line mt-2">
                <Icon name="heart" fill={liked ? 'var(--rose)' : 'none'} className={liked ? 'text-rose' : ''} />
              </button>
            </div>

            <p className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl">{money(p.price)}</span>
              {p.was && <span className="text-muted line-through">{money(p.was)}</span>}
            </p>
            <p className="mt-4 text-[15px] text-muted leading-relaxed max-w-lg">{p.blurb}</p>

            <ul className="mt-7 grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {FEATURES.map((f) => (
                <li key={f.t} className="flex gap-3">
                  <Icon name={f.icon} size={20} className="mt-0.5 shrink-0" />
                  <div><p className="text-[14px] font-medium leading-tight">{f.t}</p><p className="text-[12.5px] text-muted mt-0.5">{f.d}</p></div>
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <p className="text-sm font-medium">Color <span className="text-muted font-normal">· {c.name}</span></p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {p.colors.map((id) => {
                  const col = colorById(id);
                  return (
                    <button key={id} onClick={() => setColorId(id)} aria-label={col.name} aria-pressed={id === colorId} title={col.name}
                      className={`w-9 h-9 rounded-full border border-fg/25 transition-all duration-300 hover:scale-110 ${id === colorId ? 'outline outline-2 outline-offset-[3px] outline-fg scale-110' : ''}`} style={{ background: col.hex }} />
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between max-w-md">
                <p className="text-sm font-medium">Size</p>
                <button className="text-[13px] underline underline-offset-2 text-muted hover:text-rose transition-colors" onClick={() => goSection('sizes')}>Size guide</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2" style={err ? { animation: 'shake .5s' } : undefined}>
                {p.sizes.map((s) => (
                  <button key={s} aria-pressed={size === s} onClick={() => { setSize(s); setErr(false); }}
                    className={`chip !min-w-[3.2rem] !py-2.5 ${err ? '!border-[#c4534f]' : ''}`}>{s}</button>
                ))}
              </div>
              <p className={`mt-2 text-[13px] text-[#c4534f] transition-all duration-300 ${err ? 'opacity-100' : 'opacity-0 h-0'}`} role="alert">Choose a size first.</p>
            </div>

            <div className="mt-8">
              <p className="text-sm font-medium">Quantity</p>
              <div className="mt-3 inline-flex items-center rounded-full border border-line bg-[var(--stage)]">
                <button className="icon-btn !w-11 !h-11" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><Icon name="minus" size={16} /></button>
                <span key={qty} className="pop w-10 text-center font-medium">{qty}</span>
                <button className="icon-btn !w-11 !h-11" onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase"><Icon name="plus" size={16} /></button>
              </div>
            </div>

            <div className="mt-8 grid gap-3 max-w-md">
              <button className="btn btn-primary !py-4 text-base" onClick={buyNow}>Buy now · {money(p.price * qty)}</button>
              <button className="btn btn-glass !py-4 text-base" onClick={addToBag}><Icon name="bag" size={18} /> Add to bag</button>
            </div>

            <div className="mt-9 glass rounded-3xl p-5 max-w-md">
              <p className="font-medium text-sm flex items-center gap-2"><Icon name="truck" size={18} /> Shipping</p>
              <ul className="mt-3 space-y-1.5 text-[13.5px] text-muted list-disc pl-5">
                <li>Delivery in 2–4 business days across Egypt.</li>
                <li>Free delivery over {money(BRAND.freeShippingOver)}.</li>
                <li>Pay by cash on delivery, card or mobile wallet.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="max-w-[88rem] mx-auto px-4 sm:px-8 pt-24 sm:pt-32">
          <Reveal><h2 className="font-display h-lg mb-9">You may also like</h2></Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r, i) => <Reveal key={r.id} delay={i * 80}><ProductCard p={r} /></Reveal>)}
          </div>
        </section>
      )}
    </>
  );
}
