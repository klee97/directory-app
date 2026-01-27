import { createContext, useContext } from "react";
import { useURLFilters } from "@/hooks/useURLFilters";

const URLFiltersContext = createContext<ReturnType<typeof useURLFilters> | null>(null);

export const URLFiltersProvider = ({
  children,
  preservePathname = false,
}: {
  children: React.ReactNode;
  preservePathname?: boolean;
}) => {
  const value = useURLFilters(preservePathname);
  return <URLFiltersContext.Provider value={value}>{children}</URLFiltersContext.Provider>;
};

export const useURLFiltersContext = () => {
  const ctx = useContext(URLFiltersContext);
  if (!ctx) throw new Error("useURLFiltersContext must be used inside URLFiltersProvider");
  return ctx;
};
