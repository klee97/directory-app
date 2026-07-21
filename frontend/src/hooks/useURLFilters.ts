import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

export function useURLFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname() || ''; // SSR-safe

  // Store the latest values in refs to avoid recreating callbacks
  const searchParamsRef = useRef(searchParams);
  const pathnameRef = useRef(pathname);

  // Update refs on every render
  useEffect(() => {
    searchParamsRef.current = searchParams;
    pathnameRef.current = pathname;
  });

  // Return a stable string version to memoize dependencies
  const paramsString = useMemo(() => searchParams?.toString() ?? "", [searchParams]);

  // stable callbacks using refs
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
      const currentParams = searchParamsRef.current?.toString() ?? "";
      const newParams = new URLSearchParams(currentParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      const search = newParams.toString();
      // Always stay on the current page (e.g. /vendors or a /[location] page)
      // so applying a filter never bounces the user to a different route.
      const targetPath = pathnameRef.current;
      const newUrl = search ? `${targetPath}?${search}` : targetPath;
      router.push(newUrl, { scroll: false });
    },
    [router]
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setParams({ [key]: value });
    },
    [setParams]
  );

  const setArrayParam = useCallback(
    (key: string, values: string[] | null) => {
      const currentParams = searchParamsRef.current?.toString() ?? "";
      const newParams = new URLSearchParams(currentParams);
      newParams.delete(key);
      if (values && values.length > 0) {
        values.forEach(value => newParams.append(key, value));
      }
      const search = newParams.toString();
      const targetPath = pathnameRef.current;
      const newUrl = search ? `${targetPath}?${search}` : targetPath;
      router.push(newUrl, { scroll: false });
    },
    [router]
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
