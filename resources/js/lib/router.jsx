import { useEffect, useState } from 'react';

/**
 * Minimal hash router so the storefront runs standalone as a preview.
 * ─ In Laravel + Inertia: replace `Link` with `import { Link } from '@inertiajs/react'`
 *   and `navigate(to)` with `router.visit(to)`. Each route below becomes a Laravel route + Inertia page.
 *   /                → Home           /shop/{category?} → Shop
 *   /product/{slug}  → Product        /checkout         → Checkout
 *   /order/{number}  → OrderDone      /track/{number?}  → Track
 */

export function getActivePath() {
  if (typeof window === 'undefined') return '/';
  
  // 1. If hash has a non-empty route (e.g. #/admin, #admin, #/shop/hoodies)
  const rawHash = window.location.hash || '';
  const hashClean = rawHash.replace(/^#\/?/, '').trim();
  if (hashClean) {
    return '/' + hashClean;
  }

  // 2. Check window.location.pathname (e.g. /admin or /admin/products)
  const pathname = window.location.pathname || '/';
  if (pathname && pathname !== '/') {
    return pathname;
  }

  return '/';
}

export function parseRoute(raw) {
  const rawStr = typeof raw === 'string' ? raw : getActivePath();
  const path = (rawStr || '/').replace(/^#\/?/, '').replace(/^\//, '');
  const [a, b, c] = path.split('/');
  switch (a) {
    case 'admin': return { name: 'admin', sub: b || 'overview', id: c, key: '/' + path };
    case 'account': return { name: 'account', tab: b, key: '/' + path };
    case 'login': return { name: 'admin', sub: 'overview', key: '/' + path };
    case 'shop': return { name: 'shop', category: b || 'all', key: '/' + path };
    case 'product': return { name: 'product', slug: b, key: '/' + path };
    case 'checkout': return { name: 'checkout', key: '/' + path };
    case 'order': return { name: 'order', number: b, key: '/' + path };
    case 'track': return { name: 'track', number: b, key: '/' + path };
    default: return { name: 'home', key: '/' };
  }
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(getActivePath()));
  useEffect(() => {
    const on = () => setRoute(parseRoute(getActivePath()));
    window.addEventListener('hashchange', on);
    window.addEventListener('popstate', on);
    return () => {
      window.removeEventListener('hashchange', on);
      window.removeEventListener('popstate', on);
    };
  }, []);
  return route;
}

export const navigate = (to) => {
  const target = to.startsWith('/') ? to : `/${to}`;
  // If running inside Laravel + Inertia environment
  if (typeof window !== 'undefined' && window.__inertia_router?.visit) {
    window.__inertia_router.visit(target);
    return;
  }
  try {
    window.history.pushState(null, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  } catch {
    window.location.hash = target;
  }
};

export function Link({ to, children, onClick, ...rest }) {
  const target = to.startsWith('/') ? to : `/${to}`;
  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      navigate(target);
    }
  };
  return <a href={target} onClick={handleClick} {...rest}>{children}</a>;
}

/** Scroll to a section of the home page (navigates home first when needed). */
export function goSection(id) {
  const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const onHome = parseRoute(getActivePath()).name === 'home';
  if (onHome) return scroll();
  navigate('/');
  setTimeout(scroll, 450);
}
