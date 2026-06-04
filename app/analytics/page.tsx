"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function AnalyticsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);

  useEffect(() => {
    async function loadVisitors() {
      const businessId = await getCurrentBusinessId();

      if (!businessId) return;

      const { data } = await authClient
        .from("website_visitors")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setVisitors(data || []);
    }

    loadVisitors();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Website Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Total Visitors</p>

          <h2 className="text-4xl font-bold mt-2">
            {visitors.length}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        {visitors.length === 0 && (
          <p className="text-gray-500">No website visitors found yet.</p>
        )}

        {visitors.map((visitor) => (
          <div key={visitor.id} className="border rounded-xl p-4 mb-4">
            <p className="font-semibold">
              Page: {visitor.page || "Unknown page"}
            </p>

            <p className="text-gray-500">
              IP: {visitor.visitor_ip || "Unknown IP"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}