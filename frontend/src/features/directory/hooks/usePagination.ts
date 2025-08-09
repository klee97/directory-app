import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  pageSize: number;
  loading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

interface UsePaginationReturn<T> {
  visibleItems: T[];
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  observerRef: React.RefObject<HTMLDivElement | null>;
}

export function usePagination<T>({
  items,
  pageSize,
  loading = false,
  onLoadingChange
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Calculate if there are more items to load
  const hasMore = visibleItems.length < items.length;

  // Load more items
  const loadMore = useCallback(() => {
    if (loading || isLoading || !hasMore) return;

    setIsLoading(true);
    onLoadingChange?.(true);

    // Use setTimeout to make this async and prevent blocking UI
    setTimeout(() => {
      setVisibleItems((prevItems) => {
        const currentLength = prevItems.length;
        const nextItems = items.slice(currentLength, currentLength + pageSize);

        if (nextItems.length === 0) {
          setIsLoading(false);
          onLoadingChange?.(false);
          return prevItems;
        }

        const newItems = [...prevItems, ...nextItems];
        setIsLoading(false);
        onLoadingChange?.(false);
        return newItems;
      });
    }, 0);
  }, [items, pageSize, loading, isLoading, hasMore, onLoadingChange]);

  // Reset visible items when the items array changes
  useEffect(() => {
    setVisibleItems(items.slice(0, pageSize));
  }, [items, pageSize]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !loading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    const observerCurrent = observerRef.current;
    if (observerCurrent) {
      observer.observe(observerCurrent);
    }

    return () => {
      if (observerCurrent) {
        observer.unobserve(observerCurrent);
      }
    };
  }, [loadMore, hasMore, isLoading, loading]);

  return {
    visibleItems,
    loadMore,
    hasMore,
    isLoading,
    observerRef
  };
}
