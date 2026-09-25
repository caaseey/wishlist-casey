import type { Product, Category } from '../types';

export default function ProductCard({
  product,
  category,
  subLabel,
  onClick,
  delayMs,
}: {
  product: Product;
  category?: Category;
  subLabel?: string;
  onClick: () => void;
  delayMs: number;
}) {
  const euros = (n: number) => n.toLocaleString('es-ES') + ' €';
  return (
    <div className="card" style={{ animationDelay: `${delayMs}ms` }} onClick={onClick}>
      <div className="thumb">
        {product.image_url ? (
          <img src={product.image_url} loading="lazy" alt={product.name} />
        ) : (
          <span className="ph">{category?.icon ?? '🎁'}</span>
        )}
        {product.priority === 'love' && <span className="badge">❤ Muy deseado</span>}
        {product.priority === 'like' && <span className="badge">★ Me gusta mucho</span>}
      </div>
      <div className="cbody">
        <p className="cname">{product.name}</p>
        <p className="ccat">
          {category?.label}
          {subLabel ? ` · ${subLabel}` : ''}
        </p>
        <div className="crow">
          <span className="cprice">{euros(product.price)}</span>
          <span className="clink">Ver regalo →</span>
        </div>
      </div>
    </div>
  );
}
