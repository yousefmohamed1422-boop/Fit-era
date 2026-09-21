import { useEffect, useRef, useState } from 'react';
import Garment from './Garment';
import Icon from './Icon';
import { Link, goSection } from '../lib/router';
import { useStore } from '../lib/store';
import { COLORS, PRODUCTS, money } from '../data/catalog';

const HERO_PRODUCT = PRODUCTS[0];

export default function Hero() {
  const { setTint } = useStore();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const c = COLORS[i];
  const stage = useRef(null);

  // the whole page glows in the selected color
  useEffect(() => { setTint(c.tint); }, [i]); // eslint-disable-line

  useEffect(() => {
    if (paused) return undefined;
    const t = setTimeout(() => setI((v) => (v + 1) % COLORS.length), 4600);
    return () => clearTimeout(t);
  }, [i, paused]);

  const move = (dir) => setI((v) => (v + dir + COLORS.length) % COLORS.length);
  const onMove = (e) => {
    const r = stage.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: px * 14, y: -py * 10 });
  };

  return (
    <section className="relative pt-28 sm:pt-32 pb-14 sm:pb-20" onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setPaused(false); setTilt({ x: 0, y: 0 }); }}>
      <div className="max-w-[88rem] mx-auto px-4 sm:px-8 grid lg:grid-cols-[1.08fr_.92fr] gap-10 lg:gap-6 items-center min-h-[78vh]">
        {/* copy */}
        <div className="order-2 lg:order-1">
          <h1 className="font-display h-xl">
            <span className="block">Your fit,</span>
            <span
              className="block transition-colors duration-700"
              style={{ color: 'color-mix(in srgb, var(--tint) 80%, var(--fg))' }}
            >
              perfected.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-muted">
            Everyday basics made to move with you. Soft fabric, balanced stretch and a smooth, flattering fit that never feels like a compromise.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop/basics" className="btn btn-primary group">
              Shop Basics <Icon name="right" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <button className="btn btn-glass" onClick={() => goSection('bundles')}>Build a bundle</button>
          </div>

          {/* swatches — active one expands with its name */}
          <div className="mt-10">
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Choose a color">
              {COLORS.map((col, idx) => {
                const active = idx === i;
                return (
                  <button
                    key={col.id} role="tab" aria-selected={active} aria-label={col.name} onClick={() => setI(idx)}
                    className={`group relative flex items-center gap-2 h-10 rounded-full border transition-all duration-500 ease-out overflow-hidden ${active ? 'pl-1.5 pr-4 border-fg/25 bg-[var(--glass)]' : 'pl-1.5 pr-1.5 border-transparent hover:scale-110'}`}
                  >
                    <span className="w-7 h-7 rounded-full shrink-0 border border-fg/25 shadow-inner transition-transform duration-300 group-hover:scale-105" style={{ background: col.hex }} />
                    <span className={`text-[13px] font-medium whitespace-nowrap transition-all duration-500 ${active ? 'max-w-[8rem] opacity-100' : 'max-w-0 opacity-0'}`}>{col.name}</span>
                    {active && !paused && <span key={i} className="absolute left-0 bottom-0 h-[2px] w-full bg-fg/60 origin-left" style={{ animation: 'bar 4.6s linear both' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* stage */}
        <div className="order-1 lg:order-2 relative">
          <div
            ref={stage} onMouseMove={onMove}
            className="glass rounded-5xl aspect-[5/5.4] sm:aspect-[5/5] relative overflow-hidden"
          >
            <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: c.tint, opacity: 0.28 }} />
            {/* giant color word */}
            <span
              key={c.id}
              className="absolute inset-x-0 top-[6%] text-center font-display leading-none select-none pointer-events-none"
              style={{ fontSize: 'clamp(6rem, 20vw, 13rem)', color: 'transparent', WebkitTextStroke: '1.5px color-mix(in srgb, var(--fg) 14%, transparent)', animation: 'word-in .7s cubic-bezier(.2,.8,.2,1) both' }}
            >
              {c.name.split(' ').pop()}
            </span>

            {/* rotating ring */}
            <svg viewBox="0 0 400 400" className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[92%] pointer-events-none" style={{ animation: 'spin-slow 26s linear infinite' }}>
              <ellipse cx="200" cy="200" rx="190" ry="72" fill="none" stroke="var(--tint)" strokeWidth="1.6" strokeDasharray="2 9" strokeLinecap="round" transform="rotate(-18 200 200)" style={{ transition: 'stroke 1s' }} />
              <ellipse cx="200" cy="200" rx="160" ry="56" fill="none" stroke="var(--tint)" strokeWidth="2.4" opacity=".7" transform="rotate(-18 200 200)" style={{ transition: 'stroke 1s' }} />
            </svg>

            {/* garment */}
            <div className="absolute inset-0 grid place-items-center pb-16" style={{ perspective: 900 }}>
              <div
                className="w-[74%] transition-transform duration-300 ease-out"
                style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
              >
                <Garment shape={HERO_PRODUCT.shape} color={c.hex} className="w-full drop-shadow-[0_30px_40px_rgba(0,0,0,.18)]" title={`${HERO_PRODUCT.name} in ${c.name}`} />
              </div>
            </div>

            {/* floating chips */}
            <div className="glass glass-strong floaty absolute left-4 top-[26%] sm:left-7 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-[12px]">
              <Icon name="stretch" size={16} /> Balanced stretch
            </div>
            <div className="glass glass-strong floaty absolute right-4 top-[46%] sm:right-7 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-[12px]" style={{ animationDelay: '-3s' }}>
              <Icon name="layers" size={16} /> Fully opaque
            </div>

            {/* info bar */}
            <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 glass glass-strong rounded-3xl px-4 py-3 flex items-center gap-3">
              <button className="icon-btn !w-9 !h-9 border border-line" onClick={() => move(-1)} aria-label="Previous color"><Icon name="left" size={16} /></button>
              <div className="flex-1 min-w-0 text-center">
                <p className="text-[13px] font-semibold truncate">{HERO_PRODUCT.name} <span className="font-normal text-fg/70">· {c.name}</span></p>
                <p className="text-[12px] text-fg/70">{money(HERO_PRODUCT.price)}</p>
              </div>
              <button className="icon-btn !w-9 !h-9 border border-line" onClick={() => move(1)} aria-label="Next color"><Icon name="right" size={16} /></button>
            </div>
          </div>

          {/* dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {COLORS.map((col, idx) => (
              <button key={col.id} aria-label={col.name} onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === i ? 'w-8 bg-fg' : 'w-1.5 bg-fg/25 hover:bg-fg/50'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
