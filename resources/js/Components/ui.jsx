import { useEffect, useRef } from 'react';
import Icon from './Icon';
import logoUrl from '../images/logo.png';

/** Fades/slides children in when they enter the viewport. */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>{children}</Tag>;
}

export function Stars({ value, reviews, size = 13 }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-muted">
      <Icon name="star" size={size} fill="#E0A63B" strokeWidth={0} className="text-[#E0A63B]" />
      <b className="font-medium text-fg">{value}</b>
      {reviews != null && <span>({reviews})</span>}
    </span>
  );
}

/** Logo is a transparent PNG (black). Inverted automatically in dark mode. */
export function Logo({ className = 'h-10' }) {
  return <img src={logoUrl} alt="FIT ERA" className={`${className} w-auto select-none dark:invert transition-[filter] duration-500`} draggable="false" />;
}

/** Moves the glass "spotlight" with the cursor. Spread onto any .glass-spot element. */
export const spot = {
  onMouseMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  },
};

export function SectionHead({ title, sub, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-9">
      <div>
        <h2 className="font-display h-lg">{title}</h2>
        {sub && <p className="mt-3 text-muted max-w-xl text-[15px] leading-relaxed">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
