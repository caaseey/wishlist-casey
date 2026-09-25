import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { supabase } from '../lib/supabase';
import ProductForm from './ProductForm';
import CategoryManager from './CategoryManager';
import Toast from './Toast';
import { PRIORITY_META, type Product } from '../types';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const { categories, subsFor, refetch: refetchCats } = useCategories();
  const { products, refetch } = useProducts(true);
  const [formProduct, setFormProduct] = useState<Product | 'new' | null>(null);
  const [showCatManager, setShowCatManager] = useState(false);
  const [toast, setToast] = useState('');

  const fireToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const catLabel = (p: Product) => {
    const c = categories.find((x) => x.id === p.category_id);
    const s = subsFor(p.category_id ?? '').find((x) => x.id === p.subcategory_id);
    return c ? `${c.label}${s ? ' · ' + s.label : ''}` : '—';
  };
  const euros = (n: number) => n.toLocaleString('es-ES') + ' €';

  const sorted = [...products].sort((a, b) => a.order_index - b.order_index);
  const stats = {
    total: products.length,
    love: products.filter((p) => p.priority === 'love').length,
    visible: products.filter((p) => p.visible).length,
    cats: categories.length,
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    await supabase.from('products').delete().eq('id', p.id);
    fireToast('Producto eliminado');
    refetch();
  };

  const toggleVisible = async (p: Product) => {
    await supabase.from('products').update({ visible: !p.visible }).eq('id', p.id);
    fireToast(p.visible ? 'Producto oculto' : 'Producto visible');
    refetch();
  };

  const move = async (p: Product, dir: 'up' | 'down') => {
    const i = sorted.findIndex((x) => x.id === p.id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= sorted.length) return;
    const other = sorted[j];
    await Promise.all([
      supabase.from('products').update({ order_index: other.order_index }).eq('id', p.id),
      supabase.from('products').update({ order_index: p.order_index }).eq('id', other.id),
    ]);
    refetch();
  };

  return (
    <div>
      <div className="aTop">
        <h2>Wishlist de Casey · Admin</h2>
        <button className="aExit" onClick={() => signOut()}>
          Salir ✕
        </button>
      </div>
      <div className="aWrap">
        <div className="stats">
          <div className="stat">
            <b>{stats.total}</b>
            <span>Productos</span>
          </div>
          <div className="stat">
            <b>{stats.love}</b>
            <span>Muy deseados</span>
          </div>
          <div className="stat">
            <b>{stats.visible}</b>
            <span>Visibles</span>
          </div>
          <div className="stat">
            <b>{stats.cats}</b>
            <span>Categorías</span>
          </div>
        </div>

        <div className="aRow">
          <button className="aBtn" onClick={() => setFormProduct('new')}>
            + Añadir producto
          </button>
          <button className="aBtn ghost" onClick={() => setShowCatManager(true)}>
            Gestionar categorías
          </button>
        </div>

        <div className="tblWrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Prioridad</th>
                <th>Visible</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id} className={p.visible ? '' : 'hidden-row'}>
                  <td className="tName">
                    {p.name}
                    {p.is_demo && <span style={{ color: 'var(--sub2)', fontSize: 11 }}> (demo)</span>}
                  </td>
                  <td>{catLabel(p)}</td>
                  <td>{euros(p.price)}</td>
                  <td className={PRIORITY_META[p.priority].icon ? (p.priority === 'love' ? 'prio-love' : 'prio-like') : ''}>
                    {PRIORITY_META[p.priority].icon} {PRIORITY_META[p.priority].label}
                  </td>
                  <td>{p.visible ? 'Sí' : 'Oculto'}</td>
                  <td>
                    <div className="tActions">
                      <button className="iconBtn" title="Subir" onClick={() => move(p, 'up')}>
                        ↑
                      </button>
                      <button className="iconBtn" title="Bajar" onClick={() => move(p, 'down')}>
                        ↓
                      </button>
                      <button className="iconBtn" title="Editar" onClick={() => setFormProduct(p)}>
                        ✎
                      </button>
                      <button className="iconBtn" title="Ocultar/mostrar" onClick={() => toggleVisible(p)}>
                        {p.visible ? '🚫' : '👁'}
                      </button>
                      <button className="iconBtn" title="Eliminar" onClick={() => deleteProduct(p)}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {formProduct && (
        <ProductForm
          product={formProduct === 'new' ? null : formProduct}
          categories={categories}
          subsFor={subsFor}
          onClose={() => setFormProduct(null)}
          onSaved={(msg) => {
            fireToast(msg);
            refetch();
          }}
        />
      )}
      {showCatManager && (
        <CategoryManager
          categories={categories}
          subcategories={[]}
          subsFor={subsFor}
          onClose={() => setShowCatManager(false)}
          onChanged={refetchCats}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
