# FIT ERA — Storefront (React + Inertia, Laravel-ready)

## Preview now (no Laravel needed)
Open `dist/index.html` in a browser.
Rebuild after edits: `npm install && node build-preview.js`

## Stack
- React 19 + Inertia.js (official Laravel pairing) · Tailwind CSS 3 · no animation lib (pure CSS transitions)
- Fonts: Anton (Impact-style headings, Impact fallback) + Poppins
- Dark / Light mode (`.dark` class + CSS variables) — tokens in `resources/css/app.css`

## Move into Laravel
1. `composer create-project laravel/laravel fit-era-app` then install Inertia:
   `composer require inertiajs/inertia-laravel` + `php artisan inertia:middleware`
   `npm i react react-dom @inertiajs/react @vitejs/plugin-react tailwindcss@3 postcss autoprefixer`
2. Copy `resources/js`, `resources/css`, `tailwind.config.js` into the Laravel project.
3. Vite: add `@vitejs/plugin-react` and set input to `resources/js/app.jsx` + `resources/css/app.css`.
4. Blade root view: `@viteReactRefresh @vite(['resources/js/app.jsx']) @inertia`
   and add the Google Fonts link for Anton + Poppins in `<head>`.
5. Routes → Inertia pages (each page already exists in `resources/js/Pages`):
   - `/` → `Home` (props: `products`)
   - `/shop/{category?}` → `Shop` (props: `products`, `category`)
   - `/product/{slug}` → `Product` (props: `product`, `related`)
   - `/checkout` → `Checkout`
   - `/order/{number}` → `Order` (props: `number`)
   - `/track/{number?}` → `Track` (props: `number`)
6. Replace `lib/router.jsx` with Inertia's `Link` / `router.visit`.
7. Replace `lib/api.js` (2 functions) with real calls:
   - `placeOrder` → `POST /orders` (guest, no auth; fields: customer{name, whatsapp, email?}, shipping, payment, code, items, total)
   - `trackOrder` → `GET /orders/{number}?phone=`
8. Replace `data/catalog.js` with data from your DB (same field names).

## Dashboard (/admin)
- Open `#/admin` (there's also a small gear icon next to the cart on every page).
- Default login: `admin@fitera.com` / `fitera2026` — change both from Settings once you're in.
- Products, categories, bundles, discount codes, orders and brand settings (WhatsApp, socials,
  shipping, the homepage discount banner) are all editable there, and changes show up on the site
  immediately — no rebuild needed, because both dashboard and site read from `lib/db.js`.
- `lib/db.js` is a localStorage stand-in for your database, seeded once from `data/catalog.js`.
  In Laravel, replace each function in that file with a real API call (`saveProduct` → `POST /api/products`,
  etc.) — the dashboard pages themselves don't need to change.
- `lib/auth.jsx` is a demo session check against `db.verifyAdmin`. Replace it with real Laravel auth
  (a proper `/admin/login` route + guarded middleware) before this goes live — as built, anyone who
  knows the login can sign in from any browser since the password just lives in localStorage.
- The gear icon that links to `/admin` is intentionally subtle but still visible to every visitor.
  Remove it from `Components/Header.jsx` once you're ready to launch, and just open `/admin` directly by URL.

## Things to edit
- `data/catalog.js`: WhatsApp number, socials, email, prices, sizes, size charts, discount codes, shipping fee.
- Real product photos: add `image: '/img/x.jpg'` to a product — cards and product page use it instead of the SVG.
- Logo: `resources/js/images/logo.png` (transparent, auto-inverts in dark mode).
