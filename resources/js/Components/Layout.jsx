import { useEffect, useRef } from 'react';
import Header from './Header';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';
import CustomerAccountModal from './CustomerAccountModal';
import Icon from './Icon';
import { Footer } from './Sections';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { BRAND } from '../data/catalog';

function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <i style={{ width: '46vw', height: '46vw', left: '-12vw', top: '-10vw' }} />
      <i style={{ width: '38vw', height: '38vw', right: '-10vw', top: '18vh', animationDelay: '-6s' }} />
      <i style={{ width: '42vw', height: '42vw', left: '22vw', bottom: '-22vw', animationDelay: '-11s' }} />
    </div>
  );
}

function Toast() {
  const { toastMsg } = useStore();
  return (
    <div className="fixed z-[60] left-1/2 bottom-6 -translate-x-1/2 pointer-events-none" aria-live="polite">
      {toastMsg && (
        <div key={toastMsg.id} className="pop glass glass-strong rounded-full pl-3 pr-5 py-2.5 flex items-center gap-3 text-sm font-medium">
          <span className="grid place-items-center w-6 h-6 rounded-full bg-rose text-white"><Icon name="check" size={14} strokeWidth={3} /></span>
          {toastMsg.msg}
        </div>
      )}
    </div>
  );
}

export default function Layout({ route, children }) {
  const first = useRef(true);
  const { setCartOpen } = useStore();
  const { openLogin, setAccountModalOpen } = useAuth();

  useEffect(() => {
    setCartOpen(false);
    if (first.current) { first.current = false; }
    else { window.scrollTo({ top: 0, behavior: 'instant' }); }

    if (route.name === 'login') {
      openLogin();
    } else if (route.name === 'account') {
      setAccountModalOpen(true);
    }
  }, [route.key, route.name]); // eslint-disable-line

  return (
    <div className="min-h-screen">
      <Ambient />
      <Header route={route} />
      <main key={route.key} className="page-enter">{children}</main>
      <Footer />
      <CartDrawer />
      <AuthModal />
      <CustomerAccountModal />
      <Toast />
      <a
        href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"
        className="glass glass-strong fixed z-30 left-4 bottom-5 w-12 h-12 rounded-full grid place-items-center transition-transform duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
      >
        <Icon name="chat" size={22} />
      </a>
    </div>
  );
}
