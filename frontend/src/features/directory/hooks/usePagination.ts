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
  const [loadedCount, setLoadedCount] = useState(pageSize);
  const [prevItems, setPrevItems] = useState(items);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);


  // Reset the count (not an array) when items changes
  if (items !== prevItems) {
    setPrevItems(items);
    setLoadedCount(pageSize);
  }

  // Calculate if there are more items to load
  const visibleItems = items.slice(0, loadedCount);
  const hasMore = visibleItems.length < items.length;

  // Load more items
  const loadMore = useCallback(() => {
    if (loading || isLoading || !hasMore) return;

    setIsLoading(true);
    onLoadingChange?.(true);

    // Use setTimeout to make this async and prevent blocking UI
    setTimeout(() => {
      setLoadedCount((prev) => Math.min(prev + pageSize, items.length));
      setIsLoading(false);
      onLoadingChange?.(false);

    }, 0);
  }, [items, pageSize, loading, isLoading, hasMore, onLoadingChange]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading && !loading) {
          loadMore();
        }
      },
      // make the observer more forgiving so small sentinel elements are detected
      { threshold: 0, rootMargin: '200px' }
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
