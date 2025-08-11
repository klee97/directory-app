import { createContext, useContext } from "react";
import { useURLFilters } from "@/hooks/useURLFilters";

const URLFiltersContext = createContext<ReturnType<typeof useURLFilters> | null>(null);

export const URLFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useURLFilters();
  return <URLFiltersContext.Provider value={value}>{children}</URLFiltersContext.Provider>;
};

export const useURLFiltersContext = () => {
  const ctx = useContext(URLFiltersContext);
  if (!ctx) throw new Error("useURLFiltersContext must be used inside URLFiltersProvider");
  return ctx;
};
