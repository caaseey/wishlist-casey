import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

export function useProducts(includeHidden = false) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    let query = supabase.from('products').select('*').order('order_index');
    if (!includeHidden) query = query.eq('visible', true);
    const { data, error } = await query;
    if (!error) setProducts(data ?? []);
    setLoading(false);
  }, [includeHidden]);

  useEffect(() => {
    refetch();
    const channel = supabase
      .channel('products-sync-' + (includeHidden ? 'admin' : 'public'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, refetch)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, includeHidden]);

  return { products, loading, refetch };
}
