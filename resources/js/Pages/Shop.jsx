import ProductCard from '../Components/ProductCard';
import { Reveal } from '../Components/ui';
import { navigate } from '../lib/router';
import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { colorById } from '../data/catalog';
import { useCategories } from '../lib/db';

export default function Shop({ products, category = 'all' }) {
  const { setTint } = useStore();
  const categories = useCategories();
  const cat = categories.find((c) => c.id === category);
  const list = category === 'all' ? products : products.filter((p) => p.category === category);
  useEffect(() => { if (cat) setTint(colorById(cat.color).tint); }, [category]); // eslint-disable-line

  return (
    <section className="max-w-[88rem] mx-auto px-4 sm:px-8 pt-32 sm:pt-40">
      <div className="mb-10">
        <p className="text-sm text-muted">Shop / {cat ? cat.name : 'All products'}</p>
        <h1 className="font-display h-xl !text-[clamp(3rem,8vw,7rem)] mt-2">{cat ? cat.name : 'All products'}</h1>
        <p className="mt-4 text-muted max-w-lg">{cat ? cat.blurb : 'Every FIT ERA piece, in every color.'}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Categories">
        {[{ id: 'all', name: 'All' }, ...categories].map((c) => (
          <button key={c.id} role="tab" aria-selected={category === c.id} aria-pressed={category === c.id} className="chip !px-5 !py-2.5" onClick={() => navigate(`/shop/${c.id}`)}>
            {c.name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-muted py-20 text-center">Nothing here yet. New pieces are on the way.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 80}><ProductCard p={p} /></Reveal>)}
        </div>
      )}
    </section>
  );
}
