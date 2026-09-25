import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Category, Subcategory } from '../types';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '') || 'c' + Date.now();

export default function CategoryManager({
  categories,
  subcategories,
  subsFor,
  onClose,
  onChanged,
}: {
  categories: Category[];
  subcategories: Subcategory[];
  subsFor: (categoryId: string) => Subcategory[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [subInputs, setSubInputs] = useState<Record<string, string>>({});

  const addCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    await supabase
      .from('categories')
      .insert({ slug: slugify(name), label: name, icon: newCatIcon.trim() || '🎁', order_index: categories.length + 1 });
    setNewCatName('');
    setNewCatIcon('');
    onChanged();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría? Los productos que la usen quedarán sin categoría.')) return;
    await supabase.from('categories').delete().eq('id', id);
    onChanged();
  };

  const addSub = async (categoryId: string) => {
    const val = (subInputs[categoryId] || '').trim();
    if (!val) return;
    await supabase.from('subcategories').insert({ category_id: categoryId, slug: slugify(val), label: val });
    setSubInputs((s) => ({ ...s, [categoryId]: '' }));
    onChanged();
  };

  const deleteSub = async (id: string) => {
    await supabase.from('subcategories').delete().eq('id', id);
    onChanged();
  };

  return (
    <div className="formOverlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="formBox">
        <h3>Categorías y subcategorías</h3>
        <div>
          {categories.map((c) => (
            <div key={c.id} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <b>
                  {c.icon} {c.label}
                </b>
                <button className="iconBtn" onClick={() => deleteCategory(c.id)} title="Eliminar categoría">
                  🗑
                </button>
              </div>
              <div className="catList">
                {subsFor(c.id).length === 0 && <div>Sin subcategorías</div>}
                {subsFor(c.id).map((s) => (
                  <div key={s.id}>
                    · {s.label}{' '}
                    <button
                      className="iconBtn"
                      style={{ width: 22, height: 22, fontSize: 11 }}
                      onClick={() => deleteSub(s.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="catAdd">
                <input
                  placeholder="Nueva subcategoría"
                  value={subInputs[c.id] || ''}
                  onChange={(e) => setSubInputs((s) => ({ ...s, [c.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addSub(c.id)}
                />
                <button className="aBtn sm" onClick={() => addSub(c.id)}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="catAdd">
          <input placeholder="Nueva categoría (ej. Libros)" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
          <input
            placeholder="Emoji"
            style={{ maxWidth: 64 }}
            value={newCatIcon}
            onChange={(e) => setNewCatIcon(e.target.value)}
          />
          <button className="aBtn sm" onClick={addCategory}>
            + Añadir
          </button>
        </div>
        <div className="formActions">
          <button className="aBtn ghost" style={{ flex: 1 }} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
