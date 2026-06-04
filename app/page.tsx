"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function Home() {
  const [totalCalls, setTotalCalls] = useState(0);
  const [missedCalls, setMissedCalls] = useState(0);
  const [voiceMessages, setVoiceMessages] = useState(0);
  const [websiteVisitors, setWebsiteVisitors] = useState(0);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const businessId = await getCurrentBusinessId();

      if (!businessId) return;

      const { count: callsCount } = await authClient
        .from("calls")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: missedCount } = await authClient
        .from("missed_calls")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: messagesCount } = await authClient
        .from("voice_messages")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: visitorsCount } = await authClient
        .from("website_visitors")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { data: recent } = await authClient
        .from("calls")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5);

      setTotalCalls(callsCount || 0);
      setMissedCalls(missedCount || 0);
      setVoiceMessages(messagesCount || 0);
      setWebsiteVisitors(visitorsCount || 0);
      setRecentCalls(recent || []);
    }

    loadDashboard();
  }, []);

  return (
    <section className="p-8 text-gray-900">
      <h2 className="text-4xl font-bold mb-2">
        Dashboard
      </h2>

      <p className="text-gray-500 mb-10">
        AI Business Receptionist Overview
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Total Calls
          </p>

          <h2 className="text-4xl font-bold">
            {totalCalls}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Missed Calls
          </p>

          <h2 className="text-4xl font-bold text-red-500">
            {missedCalls}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Voice Messages
          </p>

          <h2 className="text-4xl font-bold text-blue-500">
            {voiceMessages}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Website Visitors
          </p>

          <h2 className="text-4xl font-bold text-green-500">
            {websiteVisitors}
          </h2>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          Recent Calls
        </h2>

        {recentCalls.length === 0 && (
          <p className="text-gray-500">
            No recent calls found.
          </p>
        )}

        {recentCalls.map((call) => (
          <div
            key={call.id}
            className="border rounded-xl p-4 mb-3"
          >
            <p className="font-semibold">
              {call.customer_name}
            </p>

            <p className="text-gray-500">
              {call.phone_number}
            </p>

            <p className="text-gray-500">
              {call.transcript}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}