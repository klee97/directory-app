import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { sanitizeFilterBoolean, sanitizeFilterValues } from "@/lib/directory/sanitizeFilterParams";

export function useURLFilters() {
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

  const getBooleanParam = useCallback(
    (key: string) => sanitizeFilterBoolean(searchParams?.get(key)),
    [searchParams]
  );

  // Case-insensitively matches raw param values against a known-valid list
  // Use sanitized params wherever the value drives UI state (checkboxes, chips) or filtering
  // logic, rather than treating the URL as inherently trustworthy.
  const getSanitizedParam = useCallback(
    (key: string, validValues: string[]) => {
      const raw = searchParams?.get(key);
      if (raw == null) return null;
      const [sanitized] = sanitizeFilterValues([raw], validValues);
      return sanitized ?? null;
    },
    [searchParams]
  );

  const getSanitizedArrayParam = useCallback(
    (key: string, validValues: string[]) => {
      const raw = searchParams?.getAll(key) ?? [];
      return sanitizeFilterValues(raw, validValues);
    },
    [searchParams]
  );

  // Shared helper: update the URL via the native History API instead of
  // router.push/replace. Next.js patches window.history so useSearchParams()
  // still picks this up reactively, but it skips the App Router's
  // navigation pipeline entirely — which is what was silently no-op'ing on
  // search-param-only navigations on statically rendered routes.
  const pushUrl = useCallback((newParams: URLSearchParams) => {
    if (typeof window === 'undefined') return;
    const search = newParams.toString();
    const targetPath = pathnameRef.current;
    const newUrl = search ? `${targetPath}?${search}` : targetPath;
    window.history.pushState(null, '', newUrl);
  }, []);

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
      pushUrl(newParams);
    },
    [pushUrl]
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
      pushUrl(newParams);
    },
    [pushUrl]
  );

  return {
    searchParams,
    paramsString,
    getParam,
    getAllParams,
    getSanitizedParam,
    getSanitizedArrayParam,
    getBooleanParam,
    setParam,
    setParams,
    setArrayParam
  };
}