import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Category, Subcategory } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const [{ data: cats }, { data: subs }] = await Promise.all([
      supabase.from('categories').select('*').order('order_index'),
      supabase.from('subcategories').select('*'),
    ]);
    setCategories(cats ?? []);
    setSubcategories(subs ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
    const channel = supabase
      .channel('categories-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subcategories' }, refetch)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const subsFor = (categoryId: string) => subcategories.filter((s) => s.category_id === categoryId);

  return { categories, subcategories, subsFor, loading, refetch };
}
