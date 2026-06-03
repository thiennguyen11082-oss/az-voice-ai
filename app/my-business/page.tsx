"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";

export default function MyBusinessPage() {
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    async function loadBusiness() {
      const {
        data: { user },
      } = await authClient.auth.getUser();

      if (!user) return;

      const { data: link } = await authClient
        .from("user_businesses")
        .select("business_id")
        .eq("user_id", user.id)
        .single();

      if (!link) return;

      const { data: business } = await authClient
        .from("businesses")
        .select("*")
        .eq("id", link.business_id)
        .single();

      setBusiness(business);
    }

    loadBusiness();
  }, []);

  return (
    <main className="p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">My Business</h1>

      {business ? (
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="font-semibold">{business.business_name}</p>
          <p className="text-gray-500">{business.business_phone}</p>
        </div>
      ) : (
        <p>Loading business...</p>
      )}
    </main>
  );
}