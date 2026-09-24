import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import Layout from './Components/Layout';
import AdminLayout from './admin/AdminLayout';
import { StoreProvider } from './lib/store';
import { AdminAuthProvider } from './lib/auth';

/**
 * Laravel + Inertia entry. Pages live in resources/js/Pages (storefront) and resources/js/admin (dashboard).
 * Every page is wrapped once: storefront pages get StoreProvider + Layout, admin pages get AdminLayout.
 * Both sit under one AdminAuthProvider so the dashboard-access button and session work everywhere.
 * NOTE: swap AdminAuthProvider's session check (lib/auth.jsx) for real Laravel auth before shipping.
 */
createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./{Pages,admin}/**/*.jsx', { eager: true });
    const page = pages[`./Pages/${name}.jsx`] || pages[`./admin/${name}.jsx`];
    const isAdmin = name.startsWith('admin/') || ['Login', 'Overview'].includes(name);
    page.default.layout = page.default.layout || ((children) => (
      <AdminAuthProvider>
        {isAdmin
          ? <AdminLayout route={{ key: name, sub: name.split('/').pop().toLowerCase() }}>{children}</AdminLayout>
          : <StoreProvider><Layout route={{ key: name, name: name.toLowerCase() }}>{children}</Layout></StoreProvider>}
      </AdminAuthProvider>
    ));
    return page;
  },
  setup({ el, App, props }) { createRoot(el).render(<App {...props} />); },
});
