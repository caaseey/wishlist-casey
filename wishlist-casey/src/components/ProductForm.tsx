import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Category, Subcategory, Product, Priority } from '../types';

export default function ProductForm({
  product,
  categories,
  subsFor,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  subsFor: (categoryId: string) => Subcategory[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = !!product;
  const [catId, setCatId] = useState(product?.category_id ?? categories[0]?.id ?? '');
  const [subId, setSubId] = useState(product?.subcategory_id ?? '');
  const [name, setName] = useState(product?.name ?? '');
  const [desc, setDesc] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [model, setModel] = useState(product?.model ?? '');
  const [size, setSize] = useState(product?.size ?? '');
  const [color, setColor] = useState(product?.color ?? '');
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [linkUrl, setLinkUrl] = useState(product?.link_url ?? '');
  const [priority, setPriority] = useState<Priority>(product?.priority ?? 'normal');
  const [visible, setVisible] = useState(product?.visible ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const subs = subsFor(catId);

  const save = async () => {
    if (!name.trim()) {
      setError('Ponle un nombre al regalo.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      name: name.trim(),
      description: desc.trim(),
      price: parseFloat(price) || 0,
      category_id: catId || null,
      subcategory_id: subId || null,
      brand: brand.trim(),
      model: model.trim(),
      size: size.trim(),
      color: color.trim(),
      image_url: imageUrl.trim(),
      link_url: linkUrl.trim(),
      priority,
      visible,
      is_demo: false,
    };
    const query = isEdit
      ? supabase.from('products').update(payload).eq('id', product!.id)
      : supabase.from('products').insert({ ...payload, order_index: 9999 });
    const { error: err } = await query;
    setSaving(false);
    if (err) {
      setError('No se pudo guardar: ' + err.message);
      return;
    }
    onSaved(isEdit ? 'Producto actualizado' : 'Producto añadido');
    onClose();
  };

  return (
    <div className="formOverlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="formBox">
        <h3>{isEdit ? 'Editar producto' : 'Añadir producto'}</h3>

        <div className="fGrid full">
          <div className="field">
            <label>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div className="fGrid full">
          <div className="field">
            <label>Descripción</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
        </div>
        <div className="fGrid">
          <div className="field">
            <label>Categoría</label>
            <select
              value={catId}
              onChange={(e) => {
                setCatId(e.target.value);
                setSubId('');
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Subcategoría</label>
            <select value={subId} onChange={(e) => setSubId(e.target.value)}>
              <option value="">—</option>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="fGrid">
          <div className="field">
            <label>Precio (€)</label>
            <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="field">
            <label>Marca</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
        </div>
        <div className="fGrid">
          <div className="field">
            <label>Talla</label>
            <input value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
          <div className="field">
            <label>Color</label>
            <input value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
        </div>
        <div className="fGrid">
          <div className="field">
            <label>Modelo</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          <div className="field">
            <label>URL del producto</label>
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <div className="field">
          <label>Imagen (URL)</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="field">
          <label>Prioridad</label>
          <div className="prioSel">
            <div className={`prioOpt ${priority === 'love' ? 'sel' : ''}`} onClick={() => setPriority('love')}>
              ❤ Muy deseado
            </div>
            <div className={`prioOpt ${priority === 'like' ? 'sel' : ''}`} onClick={() => setPriority('like')}>
              ★ Me gusta
            </div>
            <div className={`prioOpt ${priority === 'normal' ? 'sel' : ''}`} onClick={() => setPriority('normal')}>
              Normal
            </div>
          </div>
        </div>
        <div className="field checkField">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} id="visChk" />
          <label htmlFor="visChk" style={{ margin: 0 }}>
            Visible en la wishlist
          </label>
        </div>

        {error && <div className="loginErr">{error}</div>}

        <div className="formActions">
          <button className="aBtn ghost" style={{ flex: 1 }} onClick={onClose}>
            Cancelar
          </button>
          <button className="aBtn" style={{ flex: 1 }} onClick={save} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
