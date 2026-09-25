import type { Product, Category } from '../types';

export default function ProductModal({
  product,
  category,
  subLabel,
  onClose,
}: {
  product: Product | null;
  category?: Category;
  subLabel?: string;
  onClose: () => void;
}) {
  const euros = (n: number) => n.toLocaleString('es-ES') + ' €';
  const show = !!product;
  const tags = product
    ? [
        product.size && `Talla: ${product.size}`,
        product.color && `Color: ${product.color}`,
        product.model && `Modelo: ${product.model}`,
        product.brand && `Marca: ${product.brand}`,
      ].filter(Boolean)
    : [];

  return (
    <div className={`overlay ${show ? 'show' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      {product && (
        <div className="modal">
          <div className="mImg">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} />
            ) : (
              <span className="ph" style={{ fontSize: 52 }}>
                {category?.icon ?? '🎁'}
              </span>
            )}
            <button className="mClose" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="mBody">
            <p className="mCat">
              {category?.label}
              {subLabel ? ` · ${subLabel}` : ''}
            </p>
            <h2 className="mName">{product.name}</h2>
            <p className="mPrice">{euros(product.price)}</p>
            {product.description && <p className="mDesc">{product.description}</p>}
            {tags.length > 0 && (
              <div className="mMeta">
                {tags.map((t) => (
                  <span className="mTag" key={t as string}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            {product.link_url && (
              <a className="mBtn" href={product.link_url} target="_blank" rel="noopener noreferrer">
                Ver producto →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
