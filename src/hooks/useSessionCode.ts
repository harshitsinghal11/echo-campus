// hooks/useSessionCode.ts
import { useEffect, useState } from 'react';

export function useSessionCode() {
  const [sessionCode, setSessionCode] = useState<string | null>(null);

  useEffect(() => {
    const code = sessionStorage.getItem('userSessionCode');
    setSessionCode(code);
  }, []);

  return sessionCode;
}

