import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Garment from './Garment';
import Icon from './Icon';
import ProductCard from './ProductCard';
import { TrackForm } from './Tracker';
import { Socials } from './Header';
import { Logo, Reveal, SectionHead, spot } from './ui';
import { Link, goSection } from '../lib/router';
import { useStore } from '../lib/store';
import { COLORS, SIZE_CHARTS, colorById, money } from '../data/catalog';
import { useBrand, useCategories, useBundles } from '../lib/db';

/* ───────────── Marquee ───────────── */
export function Marquee() {
  const words = ['Fit', 'Comfort', 'Style'];
  const row = Array.from({ length: 6 }).flatMap(() => words);
  const track = (
    <div className="flex items-center shrink-0" aria-hidden="true">
      {row.map((w, i) => (
        <span key={i} className="flex items-center">
          <span
            className="font-display text-[clamp(2.6rem,6vw,4.6rem)] px-6 sm:px-10 leading-none"
            style={i % 3 === 1 ? { color: 'transparent', WebkitTextStroke: '1.5px var(--fg)' } : undefined}
          >{w}.</span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee overflow-hidden py-7 border-y border-line" role="presentation">
      <div className="marquee-track">{track}{track}</div>
    </div>
  );
}

/* ───────────── Promise ───────────── */
const PILLARS = [
  { icon: 'leaf', title: 'Soft, thoughtful materials', text: 'Breathable fabrics you forget you’re wearing.' },
  { icon: 'stretch', title: 'Balanced stretch', text: 'Moves with your body and keeps its shape.' },
  { icon: 'layers', title: 'Fully opaque', text: 'Smooth coverage with no see-through surprises.' },
  { icon: 'shape', title: 'A fit that flatters', text: 'Clean silhouettes that sit right, every wear.' },
];

export function Pillars() {
  return (
    <section className="max-w-[88rem] mx-auto px-4 sm:px-8 py-20 sm:py-28">
      <Reveal>
        <h2 className="font-display h-lg max-w-4xl">Does it look good, feel good, and fit right?</h2>
        <p className="mt-4 text-lg text-muted">If it doesn’t, we don’t make it.</p>
      </Reveal>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PILLARS.map((p, i) => (
          <Reveal key={p.title} delay={i * 90}>
            <div className="glass glass-spot rounded-4xl p-6 h-full group transition-transform duration-500 hover:-translate-y-1.5" {...spot}>
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-fg text-bg transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                <Icon name={p.icon} size={22} />
              </span>
              <h3 className="mt-6 font-semibold text-[16px]">{p.title}</h3>
              <p className="mt-1.5 text-[14px] text-muted leading-relaxed">{p.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Categories ───────────── */
function CategoryTile({ cat, className = '', big = false, wide = false }) {
  const [hover, setHover] = useState(false);
  const [idx, setIdx] = useState(COLORS.findIndex((c) => c.id === cat.color));
  useEffect(() => {
    if (!hover) return undefined;
    const t = setInterval(() => setIdx((v) => (v + 1) % COLORS.length), 850);
    return () => clearInterval(t);
  }, [hover]);
  const c = COLORS[idx];
  return (
    <Link
      to={`/shop/${cat.id}`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setIdx(COLORS.findIndex((x) => x.id === cat.color)); }}
      className={`glass glass-spot group rounded-5xl block min-h-[16rem] ${className}`} {...spot}
    >
      <div className="absolute inset-0 transition-all duration-700" style={{ backgroundColor: c.tint, opacity: hover ? 0.42 : 0.22 }} />
      <div className={`absolute right-[4%] bottom-[2%] ${big ? 'h-[74%]' : wide ? 'h-[78%]' : 'h-[58%]'} origin-bottom transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-3`}>
        <Garment shape={cat.shape} color={c.hex} className="h-full w-auto" label={false} title={`${cat.name} preview`} />
      </div>
      <div className="relative z-[2] p-6 sm:p-8 h-full flex flex-col justify-between min-h-[inherit]">
        <div>
          {cat.primary && <span className="inline-block mb-3 rounded-full bg-fg text-bg px-3 py-1 text-[11px] font-medium">Our main collection</span>}
          <h3 className={`font-display ${big ? 'h-lg' : 'h-md'}`}>{cat.name}</h3>
          <p className="mt-2 text-[14px] text-muted max-w-[16rem] leading-relaxed">{cat.blurb}</p>
        </div>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
          <span className="grid place-items-center w-10 h-10 rounded-full bg-fg text-bg transition-all duration-500 group-hover:bg-rose group-hover:translate-x-1.5">
            <Icon name="right" size={16} />
          </span>
          <span className="transition-opacity duration-300 opacity-0 group-hover:opacity-100">{c.name}</span>
        </span>
      </div>
    </Link>
  );
}

export function Categories() {
  const categories = useCategories();
  const [basics, ...rest] = categories;
  return (
    <section className="max-w-[88rem] mx-auto px-4 sm:px-8 pt-16 sm:pt-24">
      <Reveal><SectionHead title="Shop by category" sub="Start with Basics, then find your fit in Teen Edge, Men and Women." /></Reveal>
      <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2 md:auto-rows-[minmax(16rem,1fr)]">
        <Reveal className="md:col-span-2 md:row-span-2 min-h-[26rem]"><CategoryTile cat={basics} big className="h-full" /></Reveal>
        <Reveal delay={90}><CategoryTile cat={rest[0]} className="h-full" /></Reveal>
        <Reveal delay={160}><CategoryTile cat={rest[1]} className="h-full" /></Reveal>
        <Reveal delay={230} className="md:col-span-2"><CategoryTile cat={rest[2]} wide className="h-full" /></Reveal>
      </div>
    </section>
  );
}

/* ───────────── Best Seller Seamless Circular Infinite Slider ───────────── */
export function Featured({ products = [] }) {
  // Select top best sellers
  const items = useMemo(() => {
    if (!products || !products.length) return [];
    return [...products]
      .sort((a, b) => {
        const aBs = a.badge === 'Best Seller' ? 1 : 0;
        const bBs = b.badge === 'Best Seller' ? 1 : 0;
        if (aBs !== bBs) return bBs - aBs;
        return (b.reviews || 0) - (a.reviews || 0);
      })
      .slice(0, 8);
  }, [products]);

  // Triple set for completely seamless circular infinite sliding (buffer-left, active, buffer-right)
  const displayItems = useMemo(() => {
    if (!items.length) return [];
    return [
      ...items.map((p) => ({ ...p, _copy: 0 })),
      ...items.map((p) => ({ ...p, _copy: 1 })),
      ...items.map((p) => ({ ...p, _copy: 2 })),
    ];
  }, [items]);

  const sliderRef = useRef(null);
  const currentIndexRef = useRef(items.length);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const wrapTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  // Helper to get exact card step width from rendered DOM
  const getStepWidth = useCallback(() => {
    const el = sliderRef.current;
    if (!el || !el.children.length) return 330;
    const first = el.children[0];
    const second = el.children[1];
    return second && first ? second.offsetLeft - first.offsetLeft : (first.offsetWidth + 24);
  }, []);

  // Smooth or instant slide to a virtual index with silent circular wrap
  const goToIndex = useCallback(
    (targetIndex, smooth = true) => {
      const el = sliderRef.current;
      if (!el || !items.length) return;
      const step = getStepWidth();

      currentIndexRef.current = targetIndex;
      const targetLeft = targetIndex * step;

      el.scrollTo({
        left: targetLeft,
        behavior: smooth ? 'smooth' : 'instant',
      });

      const normalized = ((targetIndex % items.length) + items.length) % items.length;
      setActiveIndex(normalized);

      // Silent wrap after smooth scroll completes so the user never hits an end
      if (smooth) {
        if (wrapTimerRef.current) clearTimeout(wrapTimerRef.current);
        wrapTimerRef.current = setTimeout(() => {
          if (!sliderRef.current) return;
          if (currentIndexRef.current >= items.length * 2) {
            const wrapped = currentIndexRef.current - items.length;
            goToIndex(wrapped, false);
          } else if (currentIndexRef.current < items.length) {
            const wrapped = currentIndexRef.current + items.length;
            goToIndex(wrapped, false);
          }
        }, 520);
      }
    },
    [getStepWidth, items.length]
  );

  // Initialize position in middle set
  useEffect(() => {
    if (!items.length) return;
    currentIndexRef.current = items.length;
    const timer = setTimeout(() => {
      goToIndex(items.length, false);
    }, 60);
    return () => clearTimeout(timer);
  }, [items.length, goToIndex]);

  // Autoplay smooth step every 2 seconds without ever stopping or rewinding
  useEffect(() => {
    if (isPaused || isDragging || items.length <= 1) return;

    const interval = setInterval(() => {
      goToIndex(currentIndexRef.current + 1, true);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, isDragging, items.length, goToIndex]);

  // Manual next/prev handlers
  const handleNext = () => {
    goToIndex(currentIndexRef.current + 1, true);
  };

  const handlePrev = () => {
    goToIndex(currentIndexRef.current - 1, true);
  };

  // Drag-to-scroll support for mouse
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollStart(sliderRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.35;
    sliderRef.current.scrollLeft = scrollStart - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging || !sliderRef.current) return;
    setIsDragging(false);
    const step = getStepWidth();
    const nearest = Math.round(sliderRef.current.scrollLeft / step);
    goToIndex(nearest, true);
  };

  // Touch handling for mobile: pause on touch, smooth resume after release
  const handleTouchStart = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
      // Snap to nearest card cleanly on touch release
      if (sliderRef.current) {
        const step = getStepWidth();
        const nearest = Math.round(sliderRef.current.scrollLeft / step);
        goToIndex(nearest, true);
      }
    }, 800);
  };

  return (
    <section id="bestsellers" className="relative pt-24 sm:pt-32 overflow-hidden select-none">
      <div className="max-w-[88rem] mx-auto px-4 sm:px-8 relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted font-medium mb-1.5">Top Rated Fits</p>
              <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-none font-bold uppercase tracking-tight">
                Best Sellers
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-muted max-w-xl leading-relaxed">
                Our most coveted everyday cuts, engineered for flawless drape, heavyweight cotton, and all-day comfort.
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous product"
                className="icon-btn border border-line glass hover:border-fg/40 hover:scale-105 active:scale-95 transition-all w-11 h-11"
              >
                <Icon name="left" size={18} />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next product"
                className="icon-btn border border-line glass hover:border-fg/40 hover:scale-105 active:scale-95 transition-all w-11 h-11"
              >
                <Icon name="right" size={18} />
              </button>

              <Link to="/shop/all" className="btn btn-primary !py-2.5 !px-4 text-xs group flex items-center gap-1.5 ml-1 shadow-md hover:shadow-lg">
                <span>View All</span>
                <Icon name="right" size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Endless Circular Slider Track */}
      <div
        className="relative mt-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          handleMouseUpOrLeave();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          className={`flex gap-5 sm:gap-6 overflow-x-auto no-scrollbar px-4 sm:px-8 py-4 cursor-grab ${
            isDragging ? 'cursor-grabbing select-none' : ''
          }`}
          style={{ willChange: 'scroll-position' }}
        >
          {displayItems.map((p, idx) => (
            <div
              key={`${p.id}-c${p._copy}-${idx}`}
              data-product-card
              className="shrink-0 w-[80vw] xs:w-[285px] sm:w-[310px] lg:w-[330px] transition-transform duration-300 hover:scale-[1.015]"
            >
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Circular Dots Indicator */}
      <div className="max-w-[88rem] mx-auto px-4 sm:px-8 mt-4 flex items-center justify-between gap-4">
        {/* Seamless Interactive Dots Indicator */}
        <div className="flex items-center gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToIndex(items.length + idx, true)}
              aria-label={`Jump to product ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-7 bg-fg'
                  : 'w-2 bg-fg/20 hover:bg-fg/40'
              }`}
            />
          ))}
        </div>

        {/* Minimalist Live Status */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-fg/40 animate-ping" />
          <span className="text-[12px] text-muted">
            0{activeIndex + 1} <span className="text-muted/60">/ 0{items.length}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

export const BestSellers = Featured;

/* ───────────── Discount banner (mid-page) ───────────── */
export function DiscountBanner() {
  const { toast } = useStore();
  const brand = useBrand();
  const promo = brand.promo || { title: 'Get 15% off your fit', text: '', code: 'FIT15' };
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(promo.code); } catch { /* clipboard blocked */ }
    setCopied(true); toast(`Code ${promo.code} copied`); setTimeout(() => setCopied(false), 1800);
  };
  return (
    <section className="max-w-[88rem] mx-auto px-4 sm:px-8 pt-24 sm:pt-32">
      <Reveal>
        <div className="glass relative overflow-hidden rounded-5xl px-6 py-10 sm:px-14 sm:py-14 grid md:grid-cols-[1.2fr_.8fr] gap-8 items-center">
          <div className="absolute inset-0 opacity-60 transition-colors duration-1000" style={{ background: 'linear-gradient(115deg, color-mix(in srgb, var(--rose) 45%, transparent), color-mix(in srgb, var(--tint) 45%, transparent))' }} />
          <span className="absolute top-0 left-0 h-full w-1/5 bg-white/30 blur-md pointer-events-none" style={{ animation: 'sweep 5.5s ease-in-out infinite' }} />
          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full bg-fg text-bg text-[12px] font-medium px-3.5 py-1.5"><Icon name="tag" size={14} /> This week only</p>
            <h2 className="font-display h-lg mt-4">{promo.title}</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed">{promo.text}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button onClick={copy} className="btn btn-glass !py-3 font-mono tracking-[.2em] text-[15px]" aria-label={`Copy code ${promo.code}`}>
                {promo.code} <Icon name={copied ? 'check' : 'copy'} size={16} className={copied ? 'text-rose pop' : ''} />
              </button>
              <Link to="/shop/basics" className="btn btn-primary">Shop now</Link>
            </div>
          </div>
          <div className="relative hidden md:flex justify-center items-end h-56">
            {['rose', 'white', 'sage'].map((id, i) => (
              <div key={id} className="absolute w-44 transition-transform duration-700 hover:scale-105" style={{ transform: `translateX(${(i - 1) * 78}px) rotate(${(i - 1) * 9}deg)`, zIndex: i === 1 ? 2 : 1 }}>
                <Garment shape={['baby', 'tee', 'tank'][i]} color={colorById(id).hex} className="w-full drop-shadow-xl" label={false} />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ───────────── Bundles ───────────── */
function BundleCard({ b }) {
  const { add, toast } = useStore();
  const [size, setSize] = useState(b.sizes[2] || b.sizes[0]);
  const [hover, setHover] = useState(false);
  const n = b.items.length;
  const save = b.was - b.price;
  const onAdd = () => {
    const first = colorById(b.items[0].color);
    add({ id: `bundle-${b.id}`, name: b.name, shape: b.items[0].shape, hex: first.hex, colorName: 'Bundle', size, price: b.price });
    toast(`${b.name} (${size}) added to your bag`);
  };
  return (
    <article
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="glass glass-spot rounded-5xl p-4 transition-transform duration-500 hover:-translate-y-1.5" {...spot}
    >
      <div className="relative h-64 rounded-[28px] overflow-hidden" style={{ background: 'var(--stage)' }}>
        <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: colorById(b.items[hover ? n - 1 : 0].color).tint, opacity: 0.3 }} />
        <span className="absolute left-4 top-4 z-[3] rounded-full bg-rose text-white px-3 py-1 text-[11px] font-medium">Save {money(save)}</span>
        {b.items.map((it, i) => {
          const k = i - (n - 1) / 2;
          const spread = hover ? 1.75 : 1;
          return (
            <div key={i} className="absolute left-1/2 bottom-3 w-[46%] transition-transform duration-700 ease-out"
              style={{ transform: `translateX(calc(-50% + ${k * 46 * spread}px)) rotate(${k * 8 * spread}deg) translateY(${hover ? -8 : 0}px)`, zIndex: i === Math.floor(n / 2) ? 2 : 1 }}>
              <Garment shape={it.shape} color={colorById(it.color).hex} className="w-full drop-shadow-xl" label={false} />
            </div>
          );
        })}
      </div>
      <div className="px-2 pt-5 pb-2">
        <h3 className="font-semibold text-lg">{b.name}</h3>
        <p className="text-[14px] text-muted mt-1">{b.desc}</p>
        <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Size">
          {b.sizes.map((s) => <button key={s} role="radio" aria-checked={s === size} aria-pressed={s === size} className="chip" onClick={() => setSize(s)}>{s}</button>)}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-[1.7rem] leading-none">{money(b.price)}</p>
            <p className="text-[12px] text-muted line-through mt-1">{money(b.was)}</p>
          </div>
          <button className="btn btn-primary" onClick={onAdd}><Icon name="bag" size={16} /> Add bundle</button>
        </div>
      </div>
    </article>
  );
}

export function Bundles() {
  const bundles = useBundles();
  return (
    <section id="bundles" className="max-w-[88rem] mx-auto px-4 sm:px-8 pt-24 sm:pt-32 scroll-mt-24">
      <Reveal><SectionHead title="Bundles" sub="Build your rotation and save. Pick one size and we pack the set." /></Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        {bundles.map((b, i) => <Reveal key={b.id} delay={i * 100}><BundleCard b={b} /></Reveal>)}
      </div>
    </section>
  );
}

/* ───────────── Size guide ───────────── */
const parseRange = (s) => { const m = String(s).match(/(\d+)[–-](\d+)/); return m ? [Number(m[1]), Number(m[2])] : null; };

export function SizeGuide() {
  const [tab, setTab] = useState('women');
  const [val, setVal] = useState('');
  const chart = SIZE_CHARTS[tab];
  const measureCol = chart.cols.findIndex((c) => c === 'Chest' || c === 'Bust');
  const match = useMemo(() => {
    const v = parseFloat(val);
    if (!v || measureCol < 0) return -1;
    let best = -1;
    chart.rows.forEach((r, i) => {
      const range = parseRange(r[measureCol]);
      if (range && v >= range[0] - 0.5 && (v <= range[1] + 0.5 || best === -1)) best = i;
    });
    const last = parseRange(chart.rows[chart.rows.length - 1][measureCol]);
    if (last && v > last[1] + 0.5) return chart.rows.length - 1;
    return best;
  }, [val, tab]); // eslint-disable-line
  const tabs = Object.entries(SIZE_CHARTS);
  const idx = tabs.findIndex(([k]) => k === tab);

  return (
    <section id="sizes" className="max-w-[88rem] mx-auto px-4 sm:px-8 pt-24 sm:pt-32 scroll-mt-24">
      <Reveal><SectionHead title="Find your size" sub="Basics fit true to size. Measurements are in centimeters." /></Reveal>
      <Reveal>
        <div className="glass rounded-5xl p-5 sm:p-9 grid lg:grid-cols-[.8fr_1.2fr] gap-8 lg:gap-12">
          <div>
            {/* tabs with sliding pill */}
            <div className="relative inline-grid grid-cols-3 rounded-full p-1 bg-[var(--stage)] border border-line" role="tablist">
              <span className="absolute top-1 bottom-1 rounded-full bg-fg transition-all duration-500 ease-out" style={{ width: 'calc((100% - .5rem) / 3)', left: `calc(.25rem + ${idx} * (100% - .5rem) / 3)` }} />
              {tabs.map(([k, v]) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                  className={`relative z-10 px-4 sm:px-5 py-2.5 text-[13px] font-medium rounded-full transition-colors duration-500 ${tab === k ? 'text-bg' : 'text-fg hover:text-rose'}`}>
                  {v.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <label htmlFor="finder" className="text-sm font-medium">Quick size finder</label>
              <p className="text-[13px] text-muted mt-1">Enter your {chart.cols.includes('Bust') ? 'bust' : 'chest'} measurement in cm.</p>
              <div className="mt-3 relative max-w-[15rem]">
                <input id="finder" className="field pr-12" inputMode="decimal" placeholder="e.g. 90" value={val} onChange={(e) => setVal(e.target.value.replace(/[^\d.]/g, ''))} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-muted">cm</span>
              </div>
              <div className="h-14 mt-4">
                {match >= 0 && (
                  <p key={match} className="pop inline-flex items-center gap-3 rounded-2xl bg-fg text-bg px-4 py-3 text-sm">
                    <Icon name="check" size={16} /> We’d suggest <b className="font-display text-xl leading-none">{chart.rows[match][0]}</b>
                  </p>
                )}
              </div>
            </div>

            <ul className="mt-2 space-y-3 text-[13.5px] text-muted">
              <li className="flex gap-3"><span className="w-6 h-6 shrink-0 grid place-items-center rounded-full border border-line text-fg text-[12px]">1</span> Use a soft tape and stand naturally.</li>
              <li className="flex gap-3"><span className="w-6 h-6 shrink-0 grid place-items-center rounded-full border border-line text-fg text-[12px]">2</span> Measure around the fullest part of your chest or bust.</li>
              <li className="flex gap-3"><span className="w-6 h-6 shrink-0 grid place-items-center rounded-full border border-line text-fg text-[12px]">3</span> Between two sizes? Choose the one you’d like to feel more comfortable in.</li>
            </ul>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table key={tab} className="w-full min-w-[26rem] text-left page-enter">
              <thead>
                <tr className="text-[12px] text-muted">
                  {chart.cols.map((c) => <th key={c} className="font-medium px-4 pb-3">{c}{c !== 'Size' && <span className="opacity-60"> (cm)</span>}</th>)}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((r, i) => (
                  <tr key={r[0]} className={`transition-colors duration-300 ${match === i ? 'bg-rose/25' : 'hover:bg-[color-mix(in_srgb,var(--fg)_6%,transparent)]'}`}>
                    {r.map((cell, j) => (
                      <td key={j} className={`px-4 py-3.5 text-[14px] first:rounded-l-2xl last:rounded-r-2xl border-t border-line ${j === 0 ? 'font-display text-lg' : ''}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ───────────── Track order ───────────── */
export function TrackSection() {
  return (
    <section id="track" className="max-w-5xl mx-auto px-4 sm:px-8 pt-24 sm:pt-32 scroll-mt-24">
      <Reveal><SectionHead title="Where’s my order?" sub="Enter the order number we sent you on WhatsApp." /></Reveal>
      <Reveal><TrackForm compact /></Reveal>
    </section>
  );
}

/* ───────────── Footer ───────────── */
export function Footer() {
  const brand = useBrand();
  const categories = useCategories();
  return (
    <footer className="mt-28 sm:mt-40 px-3 sm:px-5 pb-5">
      <div className="glass rounded-5xl max-w-[88rem] mx-auto px-6 sm:px-12 py-12">
        <div className="grid md:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10">
          <div>
            <Logo className="h-14" />
            <p className="mt-4 text-[14px] text-muted max-w-xs leading-relaxed">Modern everyday clothing with a smooth, flattering fit and effortless comfort.</p>
            <Socials className="mt-5 -ml-2" size={20} bare />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Shop</h4>
            <ul className="space-y-2.5 text-[14px] text-muted">
              {categories.map((c) => <li key={c.id}><Link to={`/shop/${c.id}`} className="hover:text-fg transition-colors">{c.name}</Link></li>)}
              <li><button onClick={() => goSection('bundles')} className="hover:text-fg transition-colors">Bundles</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Help</h4>
            <ul className="space-y-2.5 text-[14px] text-muted">
              <li><button onClick={() => goSection('sizes')} className="hover:text-fg transition-colors">Size guide</button></li>
              <li><Link to="/track" className="hover:text-fg transition-colors">Track your order</Link></li>
              <li><a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-fg transition-colors">WhatsApp us</a></li>
              <li><a href={`mailto:${brand.email}`} className="hover:text-fg transition-colors">{brand.email}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Pay your way</h4>
            <ul className="space-y-3 text-[14px] text-muted">
              <li className="flex items-center gap-2.5"><Icon name="cash" size={18} /> Cash on delivery</li>
              <li className="flex items-center gap-2.5"><Icon name="card" size={18} /> Credit / debit card</li>
              <li className="flex items-center gap-2.5"><Icon name="wallet" size={18} /> Wallet / InstaPay</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
          <p>© {new Date().getFullYear()} FIT ERA. {brand.tagline}</p>
          <p className="font-display text-base tracking-wider text-fg">Fit. Comfort. Style.</p>
        </div>
      </div>
    </footer>
  );
}
