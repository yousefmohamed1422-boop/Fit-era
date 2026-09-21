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

## Things to edit
- `data/catalog.js`: WhatsApp number, socials, email, prices, sizes, size charts, discount codes, shipping fee.
- Real product photos: add `image: '/img/x.jpg'` to a product — cards and product page use it instead of the SVG.
- Logo: `resources/js/images/logo.png` (transparent, auto-inverts in dark mode).
