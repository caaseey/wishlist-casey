export type Priority = 'love' | 'like' | 'normal';

export interface Category {
  id: string;
  slug: string;
  label: string;
  icon: string;
  order_index: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  slug: string;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string | null;
  subcategory_id: string | null;
  brand: string;
  model: string;
  size: string;
  color: string;
  image_url: string;
  link_url: string;
  priority: Priority;
  visible: boolean;
  order_index: number;
  is_demo: boolean;
  created_at: string;
}

export const PRIORITY_META: Record<Priority, { label: string; icon: string }> = {
  love: { label: 'Muy deseado', icon: '❤' },
  like: { label: 'Me gusta mucho', icon: '★' },
  normal: { label: 'Normal', icon: '' },
};
