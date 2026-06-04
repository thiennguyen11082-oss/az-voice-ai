"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCalls() {
      const businessId = await getCurrentBusinessId();

      if (!businessId) return;

      const { data } = await authClient
        .from("calls")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setCalls(data || []);
    }

    loadCalls();
  }, []);

  const filteredCalls = calls.filter((call) => {
    const text = `
      ${call.customer_name}
      ${call.phone_number}
      ${call.transcript}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Calls</h1>

      <input
        placeholder="Search by name, phone number, or transcript..."
        className="w-full bg-white border rounded-xl p-4 mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-2xl shadow p-6">
        {filteredCalls.length === 0 && (
          <p className="text-gray-500">No calls found.</p>
        )}

        {filteredCalls.map((call) => (
          <div key={call.id} className="border rounded-xl p-4 mb-4">
            <p className="font-semibold">
              {call.customer_name || "Unknown caller"}
            </p>

            <p className="text-gray-500">
              Phone: {call.phone_number || "No phone number"}
            </p>

            <p className="text-gray-500">
              Duration: {call.duration || "N/A"}
            </p>

            <p className="text-gray-500 mt-2">
              {call.transcript || "No transcript yet."}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}