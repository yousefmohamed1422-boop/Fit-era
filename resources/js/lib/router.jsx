import { useEffect, useState } from 'react';

/**
 * Minimal hash router so the storefront runs standalone as a preview.
 * ─ In Laravel + Inertia: replace `Link` with `import { Link } from '@inertiajs/react'`
 *   and `navigate(to)` with `router.visit(to)`. Each route below becomes a Laravel route + Inertia page.
 *   /                → Home           /shop/{category?} → Shop
 *   /product/{slug}  → Product        /checkout         → Checkout
 *   /order/{number}  → OrderDone      /track/{number?}  → Track
 */

export function parseRoute(hash) {
  const path = (hash || '').replace(/^#/, '') || '/';
  const [, a, b] = path.split('/');
  switch (a) {
    case 'shop': return { name: 'shop', category: b || 'all', key: path };
    case 'product': return { name: 'product', slug: b, key: path };
    case 'checkout': return { name: 'checkout', key: path };
    case 'order': return { name: 'order', number: b, key: path };
    case 'track': return { name: 'track', number: b, key: path };
    default: return { name: 'home', key: '/' };
  }
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const navigate = (to) => { window.location.hash = to; };

export function Link({ to, children, ...rest }) {
  return <a href={`#${to}`} {...rest}>{children}</a>;
}

/** Scroll to a section of the home page (navigates home first when needed). */
export function goSection(id) {
  const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const onHome = parseRoute(window.location.hash).name === 'home';
  if (onHome) return scroll();
  navigate('/');
  setTimeout(scroll, 450);
}
