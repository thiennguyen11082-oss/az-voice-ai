"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function MissedPage() {
  const [missedCalls, setMissedCalls] = useState<any[]>([]);

  useEffect(() => {
    async function loadMissedCalls() {
      const businessId = await getCurrentBusinessId();

      if (!businessId) return;

      const { data } = await authClient
        .from("missed_calls")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setMissedCalls(data || []);
    }

    loadMissedCalls();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Missed Calls</h1>

      <div className="bg-white rounded-2xl shadow p-6">
        {missedCalls.length === 0 && (
          <p className="text-gray-500">No missed calls found yet.</p>
        )}

        {missedCalls.map((call) => (
          <div key={call.id} className="border rounded-xl p-4 mb-4">
            <p className="font-semibold">
              {call.customer_name || "Unknown caller"}
            </p>

            <p className="text-gray-500">
              Phone: {call.phone_number || "No phone number"}
            </p>

            <p className="text-gray-500">
              Missed at: {call.missed_time || "Unknown time"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}