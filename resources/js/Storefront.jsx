import Layout from './Components/Layout';
import Home from './Pages/Home';
import Shop from './Pages/Shop';
import Product from './Pages/Product';
import Checkout from './Pages/Checkout';
import Order from './Pages/Order';
import Track from './Pages/Track';
import AdminLayout from './admin/AdminLayout';
import Login from './admin/Login';
import Overview from './admin/Overview';
import ProductsAdmin from './admin/Products';
import CategoriesAdmin from './admin/Categories';
import BundlesAdmin from './admin/Bundles';
import OrdersAdmin from './admin/Orders';
import DiscountsAdmin from './admin/Discounts';
import SettingsAdmin from './admin/Settings';
import { StoreProvider } from './lib/store';
import { AdminAuthProvider, useAdminAuth } from './lib/auth';
import { useRoute } from './lib/router';
import { useProducts } from './lib/db';

function AdminArea({ route }) {
  const { authed } = useAdminAuth();
  if (!authed) return <Login />;
  let view;
  switch (route.sub) {
    case 'products': view = <ProductsAdmin id={route.id} />; break;
    case 'categories': view = <CategoriesAdmin />; break;
    case 'bundles': view = <BundlesAdmin />; break;
    case 'orders': view = <OrdersAdmin />; break;
    case 'discounts': view = <DiscountsAdmin />; break;
    case 'settings': view = <SettingsAdmin />; break;
    default: view = <Overview />;
  }
  return <AdminLayout route={route}>{view}</AdminLayout>;
}

/**
 * Standalone entry (used by the preview build).
 * In Laravel each <Page> below is rendered by Inertia from its own route/controller — see README.
 * Products/categories/bundles/brand come from lib/db.js (a localStorage stand-in for your API) so
 * edits made in /admin show up on the site immediately, with no rebuild.
 */
export default function Storefront() {
  const route = useRoute();
  const products = useProducts();

  let view;
  if (route.name !== 'admin') {
    switch (route.name) {
      case 'shop': view = <Shop products={products} category={route.category} />; break;
      case 'product': {
        const p = products.find((x) => x.slug === route.slug) || products[0];
        const related = products.filter((x) => x.id !== p.id && x.category === p.category).concat(products.filter((x) => x.category !== p.category)).slice(0, 4);
        view = <Product product={p} related={related} />; break;
      }
      case 'checkout': view = <Checkout />; break;
      case 'order': view = <Order number={route.number} />; break;
      case 'track': view = <Track number={route.number} />; break;
      default: view = <Home products={products} />;
    }
  }

  return (
    <AdminAuthProvider>
      {route.name === 'admin' ? (
        <AdminArea route={route} />
      ) : (
        <StoreProvider>
          <Layout route={route}>{view}</Layout>
        </StoreProvider>
      )}
    </AdminAuthProvider>
  );
}
