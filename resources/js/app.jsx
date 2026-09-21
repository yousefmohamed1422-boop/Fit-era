import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import Layout from './Components/Layout';
import { StoreProvider } from './lib/store';

/**
 * Laravel + Inertia entry. Pages live in resources/js/Pages.
 * Every page is wrapped once in the StoreProvider + Layout (header, footer, cart drawer).
 */
createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
    const page = pages[`./Pages/${name}.jsx`];
    page.default.layout = page.default.layout || ((children) => (
      <StoreProvider><Layout route={{ key: name, name: name.toLowerCase() }}>{children}</Layout></StoreProvider>
    ));
    return page;
  },
  setup({ el, App, props }) { createRoot(el).render(<App {...props} />); },
});
