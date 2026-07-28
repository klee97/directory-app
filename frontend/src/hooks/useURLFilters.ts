import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

function buildUrl(pathname: string, newParams: URLSearchParams): string {
  const search = newParams.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function useURLFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname() || '';

  const paramsString = useMemo(() => searchParams?.toString() ?? "", [searchParams]);

  const getParam = useCallback(
    (key: string) => searchParams?.get(key),
    [searchParams]
  );

  const getAllParams = useCallback(
    (key: string) => searchParams?.getAll(key),
    [searchParams]
  );

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
      const newParams = new URLSearchParams(currentSearch);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      router.replace(buildUrl(pathname, newParams), { scroll: false });
    },
    [router, pathname]
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setParams({ [key]: value });
    },
    [setParams]
  );

  const setArrayParam = useCallback(
    (key: string, values: string[] | null) => {
      const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
      const newParams = new URLSearchParams(currentSearch);
      newParams.delete(key);
      if (values && values.length > 0) {
        values.forEach(value => newParams.append(key, value));
      }
      router.replace(buildUrl(pathname, newParams), { scroll: false });
    },
    [router, pathname]
  );

  return {
    searchParams,
    paramsString,
    getParam,
    getAllParams,
    setParam,
    setParams,
    setArrayParam
  };
}