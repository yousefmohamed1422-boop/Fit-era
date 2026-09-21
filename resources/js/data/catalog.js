/**
 * FIT ERA — catalog data (placeholder).
 * In Laravel this whole file gets replaced by props coming from your controllers
 * (Inertia::render('Home', ['products' => Product::with('colors')->get()])).
 * Keep the same field names and the UI won't need any change.
 */

export const BRAND = {
  name: 'FIT ERA',
  tagline: 'Your everyday fit, perfected.',
  whatsapp: '201000000000', // ← رقم الواتساب بتاع البراند (بدون +)
  email: 'hello@fitera.com',
  currency: 'EGP',
  freeShippingOver: 999,
  shippingFee: 60,
  socials: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    tiktok: 'https://tiktok.com/',
    snapchat: 'https://snapchat.com/',
  },
};

/** hex = garment color, tint = the glow the whole page takes when this color is selected */
export const COLORS = [
  { id: 'white', name: 'Ivory White', hex: '#F3EFE6', tint: '#CFC6B6' },
  { id: 'black', name: 'Classic Black', hex: '#1B1B1B', tint: '#5B5B5B' },
  { id: 'beige', name: 'Sand Beige', hex: '#D6C3A5', tint: '#D3B689' },
  { id: 'rose', name: 'Dusty Rose', hex: '#C98F91', tint: '#DA9B9E' },
  { id: 'sage', name: 'Soft Sage', hex: '#9CAE93', tint: '#86AA7E' },
  { id: 'mocha', name: 'Mocha', hex: '#7B5E4E', tint: '#A97D62' },
];
export const colorById = (id) => COLORS.find((c) => c.id === id) || COLORS[0];

export const CATEGORIES = [
  { id: 'basics', name: 'Basics', blurb: 'The everyday essentials. Soft, stretchy, fully opaque.', shape: 'tee', color: 'white', primary: true },
  { id: 'teen', name: 'Teen Edge', blurb: 'Relaxed cuts made for teens.', shape: 'baby', color: 'sage' },
  { id: 'men', name: 'Men', blurb: 'Structured, comfortable, easy.', shape: 'long', color: 'black' },
  { id: 'women', name: 'Women', blurb: 'Smooth, flattering, effortless.', shape: 'tank', color: 'rose' },
];

const ALL = ['white', 'black', 'beige', 'rose', 'sage', 'mocha'];

export const PRODUCTS = [
  {
    id: 1, slug: 'essential-tee', name: 'Essential Tee', category: 'basics', shape: 'tee',
    price: 399, was: null, colors: ALL, sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.8, reviews: 214, badge: 'Best Seller',
    blurb: 'The tee you reach for first. Soft, opaque and shaped to sit smoothly on the body.',
  },
  {
    id: 2, slug: 'baby-fit-tee', name: 'Baby Fit Tee', category: 'basics', shape: 'baby',
    price: 379, was: null, colors: ALL, sizes: ['XS', 'S', 'M', 'L'],
    rating: 4.7, reviews: 128, badge: 'New',
    blurb: 'A cropped, fitted tee with just enough stretch to move with you all day.',
  },
  {
    id: 3, slug: 'second-skin-tank', name: 'Second-Skin Tank', category: 'basics', shape: 'tank',
    price: 329, was: 369, colors: ALL, sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.9, reviews: 302, badge: 'Best Seller',
    blurb: 'A smooth, layer-friendly tank that feels like nothing and looks put together.',
  },
  {
    id: 4, slug: 'long-sleeve-fit-tee', name: 'Long Sleeve Fit Tee', category: 'basics', shape: 'long',
    price: 449, was: null, colors: ALL, sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.6, reviews: 87, badge: null,
    blurb: 'Full-length sleeves with balanced stretch. Easy alone, easy under everything.',
  },
  {
    id: 5, slug: 'teen-boxy-tee', name: 'Teen Boxy Tee', category: 'teen', shape: 'tee',
    price: 349, was: null, colors: ['white', 'black', 'sage', 'mocha'], sizes: ['XS', 'S', 'M', 'L'],
    rating: 4.7, reviews: 64, badge: 'New',
    blurb: 'A relaxed everyday tee cut for teens. Soft on skin, tough on wash day.',
  },
  {
    id: 6, slug: 'teen-crop-tank', name: 'Teen Crop Tank', category: 'teen', shape: 'baby',
    price: 299, was: null, colors: ['white', 'black', 'rose', 'beige'], sizes: ['XS', 'S', 'M'],
    rating: 4.6, reviews: 41, badge: null,
    blurb: 'A short, stretchy layering piece that keeps its shape.',
  },
  {
    id: 7, slug: 'men-core-tee', name: 'Men Core Tee', category: 'men', shape: 'tee',
    price: 429, was: null, colors: ['white', 'black', 'beige', 'mocha', 'sage'], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.8, reviews: 96, badge: 'Best Seller',
    blurb: 'Structured shoulders, a clean drop and a fabric that holds its shape.',
  },
  {
    id: 8, slug: 'men-long-sleeve', name: 'Men Long Sleeve', category: 'men', shape: 'long',
    price: 479, was: null, colors: ['white', 'black', 'beige', 'mocha'], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.7, reviews: 52, badge: null,
    blurb: 'A comfortable long sleeve with the right amount of stretch at the cuff and chest.',
  },
  {
    id: 9, slug: 'women-rib-tank', name: 'Women Rib Tank', category: 'women', shape: 'tank',
    price: 349, was: null, colors: ALL, sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.9, reviews: 176, badge: 'Best Seller',
    blurb: 'A smooth, flattering tank that goes from errands to evenings.',
  },
  {
    id: 10, slug: 'women-fitted-tee', name: 'Women Fitted Tee', category: 'women', shape: 'baby',
    price: 389, was: null, colors: ALL, sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.8, reviews: 118, badge: null,
    blurb: 'A fitted tee with clean lines and a soft, opaque hand-feel.',
  },
];

export const BUNDLES = [
  {
    id: 'trio', name: 'The Basics Trio', desc: '3 Essential Tees in white, black and sand.',
    items: [{ shape: 'tee', color: 'white' }, { shape: 'tee', color: 'black' }, { shape: 'tee', color: 'beige' }],
    price: 999, was: 1197, sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'duo', name: 'Everyday Duo', desc: 'A Baby Fit Tee and a Second-Skin Tank.',
    items: [{ shape: 'baby', color: 'rose' }, { shape: 'tank', color: 'sage' }],
    price: 649, was: 708, sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 'layer', name: 'The Layer Set', desc: 'Long sleeve, baby tee and tank, made to stack.',
    items: [{ shape: 'long', color: 'mocha' }, { shape: 'baby', color: 'beige' }, { shape: 'tank', color: 'black' }],
    price: 1099, was: 1157, sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
];

/** Placeholder measurements (cm) — swap in your real size charts. */
export const SIZE_CHARTS = {
  teen: {
    label: 'Teen Edge',
    cols: ['Size', 'Height', 'Chest', 'Waist'],
    rows: [
      ['XS', '150–158', '78–82', '62–66'],
      ['S', '158–164', '82–86', '66–70'],
      ['M', '164–170', '86–90', '70–74'],
      ['L', '170–176', '90–94', '74–78'],
    ],
  },
  men: {
    label: 'Men',
    cols: ['Size', 'Chest', 'Waist', 'Length'],
    rows: [
      ['S', '88–94', '74–80', '68'],
      ['M', '94–100', '80–86', '70'],
      ['L', '100–106', '86–92', '72'],
      ['XL', '106–112', '92–98', '74'],
      ['XXL', '112–118', '98–104', '76'],
    ],
  },
  women: {
    label: 'Women',
    cols: ['Size', 'Bust', 'Waist', 'Hip'],
    rows: [
      ['XS', '80–84', '60–64', '86–90'],
      ['S', '84–88', '64–68', '90–94'],
      ['M', '88–92', '68–72', '94–98'],
      ['L', '92–97', '72–77', '98–103'],
      ['XL', '97–102', '77–82', '103–108'],
    ],
  },
};

export const GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'Qalyubia', 'Dakahlia', 'Gharbia', 'Sharqia', 'Monufia', 'Beheira',
  'Kafr El Sheikh', 'Damietta', 'Port Said', 'Ismailia', 'Suez', 'Fayoum', 'Beni Suef', 'Minya',
  'Assiut', 'Sohag', 'Qena', 'Luxor', 'Aswan', 'Red Sea', 'Matrouh', 'South Sinai', 'North Sinai', 'Other',
];

export const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on delivery', note: 'Pay in cash when your order arrives.', icon: 'cash' },
  { id: 'card', label: 'Credit / debit card', note: 'We send a secure payment link on WhatsApp.', icon: 'card' },
  { id: 'wallet', label: 'Mobile wallet / InstaPay', note: 'Vodafone Cash, Etisalat Cash, InstaPay.', icon: 'wallet' },
];

export const DISCOUNT_CODES = { FIT15: 15, WELCOME10: 10 };

export const ORDER_STEPS = ['Placed', 'Confirmed', 'Packed', 'On the way', 'Delivered'];

export const money = (n) => `${Math.round(n).toLocaleString('en-US')} ${BRAND.currency}`;
