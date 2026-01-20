'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MarketList from "@/components/marketplace/MarketplaceList";
import MarketCreateForm from "@/components/marketplace/MarketplaceForm";

export default function MarketplacePage() {
  const [userEmail, setUserEmail] = useState("");

  // Fetch email on client side
  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    }

    loadUser();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Market List - Takes 2 columns */}
        <div className="lg:col-span-2">
          <MarketList currentUserEmail={userEmail} />
        </div>

        {/* Create Form - Takes 1 column, sticky on large screens */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <MarketCreateForm />
          </div>
        </div>
      </div>
    </div>
  );
}
