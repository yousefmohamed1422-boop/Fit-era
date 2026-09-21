import Layout from './Components/Layout';
import Home from './Pages/Home';
import Shop from './Pages/Shop';
import Product from './Pages/Product';
import Checkout from './Pages/Checkout';
import Order from './Pages/Order';
import Track from './Pages/Track';
import { StoreProvider } from './lib/store';
import { useRoute } from './lib/router';
import { PRODUCTS } from './data/catalog';

/**
 * Standalone entry (used by the preview build).
 * In Laravel each <Page> below is rendered by Inertia from its own route/controller — see README.
 */
export default function Storefront({ products = PRODUCTS }) {
  const route = useRoute();
  let view;
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
  return (
    <StoreProvider>
      <Layout route={route}>{view}</Layout>
    </StoreProvider>
  );
}
