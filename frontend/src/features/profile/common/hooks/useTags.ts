import { VendorTag } from '@/types/vendor';
import { useEffect, useState } from 'react';


export function useTags() {
  const [tags, setTags] = useState<VendorTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTags() {
      setLoading(true);
      try {
        const res = await fetch('/api/tags');
        const data = await res.json();
        setTags(data);
      } catch {
        setTags([]);
      }
      setLoading(false);
    }
    fetchTags();
  }, []);

  return { tags, loading };
}
