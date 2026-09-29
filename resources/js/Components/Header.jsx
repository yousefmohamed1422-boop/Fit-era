import { useEffect, useState } from 'react';
import Icon from './Icon';
import { Logo } from './ui';
import { Link, goSection, navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { useBrand, useCategories } from '../lib/db';

const SOCIALS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'snapchat', label: 'Snapchat' },
];

export function Socials({ className = '', size = 18, bare = false }) {
  const brand = useBrand();
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {SOCIALS.map((s) => (
        <a
          key={s.id} href={brand.socials?.[s.id] || '#'} target="_blank" rel="noreferrer" aria-label={s.label} title={s.label}
          className={bare ? 'icon-btn !w-10 !h-10' : 'icon-btn !w-9 !h-9'}
        >
          <Icon name={s.id} size={size} />
        </a>
      ))}
    </div>
  );
}

export default function Header({ route }) {
  const { theme, toggleTheme, totals, setCartOpen } = useStore();
  const { authed, isAdmin, isCustomer, customer, openLogin, setAccountModalOpen } = useAuth();
  const categories = useCategories();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [shop, setShop] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setMenu(false); setShop(false); }, [route.key]);

  const link = 'relative px-4 py-2 rounded-full text-[13.5px] font-medium transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)]';
  const go = (id) => (e) => { e.preventDefault(); setMenu(false); goSection(id); };

  return (
    <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-5 pt-3 pointer-events-none">
      <div className="max-w-[88rem] mx-auto flex items-center gap-2.5 pointer-events-auto">
        {/* logo */}
        <Link
          to="/" aria-label="FIT ERA home"
          className={`glass glass-strong rounded-full flex items-center px-4 transition-all duration-500 hover:scale-[1.03] ${scrolled ? 'h-12' : 'h-14'}`}
        >
          <Logo className={`transition-all duration-500 ${scrolled ? 'h-7' : 'h-8'}`} />
        </Link>

        {/* nav bar */}
        <nav className={`glass glass-strong hidden lg:flex items-center rounded-full px-1.5 transition-all duration-500 ${scrolled ? 'h-12' : 'h-14'}`}>
          <Link to="/" className={`${link} ${route.name === 'home' ? 'bg-[color-mix(in_srgb,var(--fg)_10%,transparent)]' : ''}`}>Home</Link>
          <div className="relative" onMouseEnter={() => setShop(true)} onMouseLeave={() => setShop(false)}>
            <button
              className={`${link} inline-flex items-center gap-1 ${route.name === 'shop' ? 'bg-[color-mix(in_srgb,var(--fg)_10%,transparent)]' : ''}`}
              aria-expanded={shop} onClick={() => setShop((v) => !v)}
            >
              Shop <Icon name="down" size={14} className={`transition-transform duration-300 ${shop ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`absolute left-0 top-full pt-2.5 w-64 transition-all duration-300 ${shop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}
            >
              <div className="rounded-3xl p-2.5 bg-[var(--bg)] border border-[var(--line)] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)] ring-1 ring-black/5 dark:ring-white/10">
                <Link to="/shop/all" className="flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-medium text-fg hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] transition-colors">
                  <span>All products</span>
                  <Icon name="right" size={14} className="text-muted" />
                </Link>
                {categories.map((c) => (
                  <Link key={c.id} to={`/shop/${c.id}`} className="group flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-medium text-fg hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] transition-colors">
                    <span className="flex items-center">
                      {c.name}
                      {c.primary && <span className="ml-2 text-[10px] rounded-full bg-rose text-white px-2 py-0.5 font-medium shadow-sm">Main</span>}
                    </span>
                    <Icon name="right" size={14} className="text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <a href="#/" onClick={go('bundles')} className={link}>Bundles</a>
          <a href="#/" onClick={go('sizes')} className={link}>Size guide</a>
          <Link to="/track" className={`${link} ${route.name === 'track' ? 'bg-[color-mix(in_srgb,var(--fg)_10%,transparent)]' : ''}`}>Track order</Link>
        </nav>

        {/* social icons — right beside the bar */}
        <div className={`glass glass-strong hidden xl:flex items-center rounded-full px-1.5 transition-all duration-500 ${scrolled ? 'h-12' : 'h-14'}`}>
          <Socials />
        </div>

        <div className="flex-1" />

        {/* actions */}
        <div className={`glass glass-strong rounded-full flex items-center gap-0.5 px-1.5 transition-all duration-500 ${scrolled ? 'h-12' : 'h-14'}`}>
          <button className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <span className="relative block w-5 h-5">
              <Icon name="sun" className={`absolute inset-0 transition-all duration-500 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'}`} />
              <Icon name="moon" className={`absolute inset-0 transition-all duration-500 ${theme === 'dark' ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
            </span>
          </button>
          <button className="icon-btn relative" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${totals.count} items`}>
            <Icon name="bag" />
            {totals.count > 0 && (
              <span key={totals.count} className="pop absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-rose text-white text-[10px] font-semibold">
                {totals.count}
              </span>
            )}
          </button>
          <button className="icon-btn lg:hidden" onClick={() => setMenu((v) => !v)} aria-label="Menu" aria-expanded={menu}>
            <Icon name={menu ? 'close' : 'menu'} />
          </button>
        </div>

        {/* Auth / Account / Dashboard access button */}
        {isAdmin ? (
          <Link
            to="/admin"
            aria-label="Open Dashboard"
            title="Admin Dashboard"
            className={`glass glass-strong rounded-full flex items-center gap-1.5 px-3.5 border border-rose/40 bg-rose/10 text-rose hover:bg-rose/20 transition-all duration-300 font-medium text-xs sm:text-sm ${
              scrolled ? 'h-12' : 'h-14'
            }`}
          >
            <Icon name="gear" size={16} />
            <span className="hidden sm:inline font-semibold">Dashboard</span>
          </Link>
        ) : isCustomer ? (
          <button
            onClick={() => setAccountModalOpen(true)}
            aria-label={`Account of ${customer.name}`}
            title="My Account"
            className={`glass glass-strong rounded-full flex items-center gap-2 px-3 hover:border-fg/40 transition-all duration-300 text-xs sm:text-sm font-medium ${
              scrolled ? 'h-12' : 'h-14'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-fg/10 grid place-items-center text-xs font-bold text-fg">
              {customer.name?.charAt(0).toUpperCase() || 'U'}
            </span>
            <span className="hidden sm:inline font-semibold truncate max-w-[6rem]">
              {customer.name?.split(' ')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={openLogin}
            aria-label="Sign in or Sign up"
            title="Sign in / Register"
            className={`glass glass-strong rounded-full flex items-center gap-1.5 px-3.5 hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] transition-all duration-300 text-xs sm:text-sm font-medium ${
              scrolled ? 'h-12' : 'h-14'
            }`}
          >
            <Icon name="user" size={16} className="text-muted" />
            <span className="hidden sm:inline font-semibold">Sign in</span>
          </button>
        )}
      </div>

      {/* mobile menu */}
      <div className={`collapse max-w-[88rem] mx-auto lg:hidden pointer-events-auto ${menu ? 'open' : ''}`}>
        <div>
          <div className="glass glass-strong rounded-4xl mt-2.5 p-3">
            {[
              ['Home', () => navigate('/')],
              ...categories.map((c) => [c.name, () => navigate(`/shop/${c.id}`)]),
              ['Bundles', () => { setMenu(false); goSection('bundles'); }],
              ['Size guide', () => { setMenu(false); goSection('sizes'); }],
              ['Track order', () => navigate('/track')],
              ...(isAdmin
                ? [['Admin Dashboard', () => navigate('/admin')]]
                : isCustomer
                ? [[`My Account (${customer.name?.split(' ')[0]})`, () => { setMenu(false); setAccountModalOpen(true); }]]
                : [['Sign in / Create Account', () => { setMenu(false); openLogin(); }]]),
            ].map(([label, fn]) => (
              <button key={label} onClick={fn} className="w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left text-[15px] hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] transition-colors">
                {label} <Icon name="right" size={16} className="opacity-50" />
              </button>
            ))}
            <div className="flex justify-center pt-2 border-t border-line mt-2"><Socials bare size={20} /></div>
          </div>
        </div>
      </div>
    </header>
  );
}
