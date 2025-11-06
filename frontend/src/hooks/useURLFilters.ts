import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useURLFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname() || ''; // SSR-safe

  // Return a stable string version to memoize dependencies
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
      const newParams = new URLSearchParams(paramsString);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      const search = newParams.toString();
      const newUrl = search ? `${pathname}?${search}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [router, pathname, paramsString]
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setParams({ [key]: value });
    },
    [setParams]
  );

  const setArrayParam = useCallback(
    (key: string, values: string[] | null) => {
      const newParams = new URLSearchParams(paramsString);
      newParams.delete(key);
      if (values && values.length > 0) {
        values.forEach(value => newParams.append(key, value));
      }
      const search = newParams.toString();
      const newUrl = search ? `${pathname}?${search}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [router, pathname, paramsString]
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
