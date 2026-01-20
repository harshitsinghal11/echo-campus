'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useUserEmail() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    }

    load();
  }, []);

  return email;
}