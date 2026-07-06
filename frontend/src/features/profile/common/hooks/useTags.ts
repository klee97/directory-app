import { callApi } from '@/lib/api/client';
import { VendorTag } from '@/types/vendor';
import { useEffect, useState } from 'react';

export function useTags() {
  const [tags, setTags] = useState<VendorTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTags() {
      setLoading(true);
      const result = await callApi<VendorTag[]>('/api/tags');
      setTags(result.ok ? result.data : []);
      setLoading(false);
    }
    fetchTags();
  }, []);

  return { tags, loading };
}
