import { useState } from 'react';
import Garment from './Garment';
import Icon from './Icon';
import { Stars, spot } from './ui';
import { Link } from '../lib/router';
import { useStore } from '../lib/store';
import { colorById, money } from '../data/catalog';

export default function ProductCard({ p }) {
  const { add, wish, toggleWish, toast } = useStore();
  const availableColors = Array.isArray(p?.colors) && p.colors.length > 0 ? p.colors : ['black'];
  const [colorId, setColorId] = useState(availableColors[0]);
  const [picking, setPicking] = useState(false);
  const c = colorById(colorId);
  const liked = p ? wish.includes(p.id) : false;

  // Color-specific image or cover / first image
  const colorImg = p.colorImages?.[colorId] || (Array.isArray(p.images) ? p.images.find((x) => typeof x === 'object' && x.colorId === colorId)?.url : null);
  const coverImg = (Array.isArray(p.images) ? (p.images.find((x) => typeof x === 'object' && x.isCover)?.url || (typeof p.images[0] === 'object' ? p.images[0].url : p.images[0])) : null) || p.image || null;
  const activeImg = colorImg || coverImg;

  const totalPhotos = Array.isArray(p.images) ? p.images.length : (p.image ? 1 : 0);

  const addWithSize = (size) => {
    add({ id: p.id, name: p.name, shape: p.shape, hex: c.hex, colorName: c.name, size, price: p.price, image: activeImg });
    setPicking(false);
    toast(`${p.name} (${size}) added to your bag`);
  };

  return (
    <article className="glass glass-spot group rounded-[30px] p-3 transition-transform duration-500 hover:-translate-y-1.5" {...spot}>
      {/* image */}
      <div className="relative aspect-[4/4.6] rounded-[22px] overflow-hidden" style={{ background: 'var(--stage)' }}>
        <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: c.tint, opacity: 0.3 }} />
        <Link to={`/product/${p.slug}`} className="absolute inset-0 grid place-items-center" aria-label={`View ${p.name}`}>
          {activeImg ? (
            <img key={activeImg} src={activeImg} alt={`${p.name} in ${c.name}`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          ) : (
            <Garment shape={p.shape} color={c.hex} className="w-[74%] transition-transform duration-700 ease-out group-hover:scale-[1.07] group-hover:-rotate-2" title={`${p.name} in ${c.name}`} />
          )}
        </Link>

        {p.badge && (
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur-md ${p.badge === 'Best Seller' ? 'bg-rose/90 text-white' : 'bg-fg/85 text-bg'}`}>
            {p.badge}
          </span>
        )}
        <button
          onClick={() => { toggleWish(p.id); }}
          aria-pressed={liked} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 grid place-items-center w-9 h-9 rounded-full bg-[var(--glass-strong)] backdrop-blur-md border border-[var(--glass-border)] transition-transform duration-300 hover:scale-110 active:scale-90"
        >
          <Icon name="heart" size={16} fill={liked ? 'var(--rose)' : 'none'} className={`transition-colors ${liked ? 'text-rose' : ''}`} key={String(liked)} style={liked ? { animation: 'pop .4s both' } : undefined} />
        </button>

        {p.was && (
          <span className="absolute left-3 bottom-3 rounded-full bg-[var(--glass-strong)] backdrop-blur-md border border-[var(--glass-border)] px-2.5 py-1 text-[11px] font-medium">
            Save {Math.round(((p.was - p.price) / p.was) * 100)}%
          </span>
        )}

        {totalPhotos > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-[var(--glass-strong)] backdrop-blur-md border border-[var(--glass-border)] px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 text-muted">
            <Icon name="image" size={10} /> {totalPhotos}
          </span>
        )}
      </div>

      {/* info */}
      <div className="px-2 pt-4 pb-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/product/${p.slug}`} className="block font-semibold text-[15px] leading-tight truncate hover:text-rose transition-colors">{p.name}</Link>
            <div className="mt-1.5"><Stars value={p.rating} reviews={p.reviews} /></div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold text-[15px]">{money(p.price)}</p>
            {p.was && <p className="text-[12px] text-muted line-through">{money(p.was)}</p>}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2" role="radiogroup" aria-label="Color">
            {p.colors.slice(0, 6).map((id) => {
              const col = colorById(id);
              return (
                <button
                  key={id} role="radio" aria-checked={id === colorId} aria-label={col.name} title={col.name}
                  onClick={() => setColorId(id)} onMouseEnter={() => setColorId(id)}
                  className={`w-[18px] h-[18px] rounded-full border border-fg/25 transition-all duration-300 hover:scale-125 ${id === colorId ? 'outline outline-2 outline-offset-2 outline-fg scale-110' : ''}`}
                  style={{ background: col.hex }}
                />
              );
            })}
          </div>
          <button
            onClick={() => setPicking((v) => !v)} aria-expanded={picking} aria-label="Choose size and add to bag"
            className={`grid place-items-center w-11 h-11 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${picking ? 'bg-rose text-white rotate-45' : 'bg-fg text-bg'}`}
          >
            <Icon name={picking ? 'plus' : 'bag'} size={18} />
          </button>
        </div>

        <div className={`collapse ${picking ? 'open' : ''}`}>
          <div>
            <p className="pt-4 pb-2 text-[12px] text-muted">Pick a size to add — {c.name}</p>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {p.sizes.map((s) => (
                <button key={s} className="chip" onClick={() => addWithSize(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
