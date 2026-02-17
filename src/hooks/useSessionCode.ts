// hooks/useSessionCode.ts
import { useMemo } from "react";

export function useSessionCode() {
  return useMemo(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("userSessionCode");
  }, []);
}
