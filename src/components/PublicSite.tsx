import { useMemo, useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import type { Product } from '../types';

type Sort = 'rec' | 'new' | 'asc' | 'desc';

export default function PublicSite() {
  const { categories, subsFor } = useCategories();
  const { products, loading } = useProducts(false);
  const [cat, setCat] = useState('all');
  const [sub, setSub] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('rec');
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  const activeCategory = categories.find((c) => c.slug === cat);
  const activeSubcats = activeCategory ? subsFor(activeCategory.id) : [];

  const catOf = (p: Product) => categories.find((c) => c.id === p.category_id);
  const subOf = (p: Product) => subsFor(p.category_id ?? '').find((s) => s.id === p.subcategory_id);

  const list = useMemo(() => {
    let l = [...products];
    if (activeCategory) l = l.filter((p) => p.category_id === activeCategory.id);
    if (sub) {
      const subObj = activeSubcats.find((s) => s.slug === sub);
      if (subObj) l = l.filter((p) => p.subcategory_id === subObj.id);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      l = l.filter((p) => `${p.name} ${p.brand} ${p.description} ${p.model}`.toLowerCase().includes(q));
    }
    const prioRank: Record<string, number> = { love: 0, like: 1, normal: 2 };
    if (sort === 'asc') l.sort((a, b) => a.price - b.price);
    else if (sort === 'desc') l.sort((a, b) => b.price - a.price);
    else if (sort === 'new') l.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    else l.sort((a, b) => (prioRank[a.priority] ?? 2) - (prioRank[b.priority] ?? 2) || a.order_index - b.order_index);
    return l;
  }, [products, activeCategory, sub, activeSubcats, search, sort]);

  return (
    <div>
      <header className="top">
        <div className="wrap hero">
          <h1>Wishlist de Casey</h1>
          <p>Para que sea más fácil acertar</p>
        </div>
        <div className="wrap">
          <div className="searchRow">
            <div className="searchBox">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                placeholder="Buscar…"
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="sortSel" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="rec">Recomendados</option>
              <option value="new">Más recientes</option>
              <option value="asc">Precio: menor a mayor</option>
              <option value="desc">Precio: mayor a menor</option>
            </select>
          </div>
          <div className="pills">
            <button className={`pill ${cat === 'all' ? 'active' : ''}`} onClick={() => { setCat('all'); setSub(null); }}>
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`pill ${cat === c.slug ? 'active' : ''}`}
                onClick={() => { setCat(c.slug); setSub(null); }}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          {activeCategory && activeSubcats.length > 0 && (
            <div className="subpills">
              <button className={`spill ${!sub ? 'active' : ''}`} onClick={() => setSub(null)}>
                Todas
              </button>
              {activeSubcats.map((s) => (
                <button key={s.id} className={`spill ${sub === s.slug ? 'active' : ''}`} onClick={() => setSub(s.slug)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="wrap">
        <div className="grid">
          {!loading && list.length === 0 && <div className="empty">No hay regalos que coincidan. Prueba con otro filtro.</div>}
          {list.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              category={catOf(p)}
              subLabel={subOf(p)?.label}
              delayMs={Math.min(i * 35, 300)}
              onClick={() => setOpenProduct(p)}
            />
          ))}
        </div>
      </main>

      <footer>
        <a href="/admin">admin</a>
      </footer>

      <ProductModal
        product={openProduct}
        category={openProduct ? catOf(openProduct) : undefined}
        subLabel={openProduct ? subOf(openProduct)?.label : undefined}
        onClose={() => setOpenProduct(null)}
      />
    </div>
  );
}
