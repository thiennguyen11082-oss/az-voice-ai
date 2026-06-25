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

  function formatVisitorTime(createdAt: string) {
    if (!createdAt) return "No time available";

    const date = new Date(createdAt);

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const uniquePages = new Set(
    visitors.map((visitor) => visitor.page || "Unknown page")
  ).size;

  const uniqueIps = new Set(
    visitors.map((visitor) => visitor.visitor_ip || "Unknown IP")
  ).size;

  return (
    <main className="min-h-screen text-white">
      <div className="bg-black/45 px-5 py-5 backdrop-blur-sm">
        <h1 className="text-5xl font-black tracking-wide text-cyan-50 drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]">
          Website Analytics
        </h1>
      </div>

      <div className="px-5 py-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-[28px] border-4 border-black bg-cyan-100/70 p-6 text-center text-black shadow-2xl backdrop-blur-md">
            <p className="mb-2 text-2xl font-black">Total Visitors</p>

            <h2 className="text-6xl font-black text-blue-600">
              {visitors.length}
            </h2>
          </div>

          <div className="rounded-[28px] border-4 border-black bg-cyan-100/70 p-6 text-center text-black shadow-2xl backdrop-blur-md">
            <p className="mb-2 text-2xl font-black">Pages Visited</p>

            <h2 className="text-6xl font-black text-green-600">
              {uniquePages}
            </h2>
          </div>

          <div className="rounded-[28px] border-4 border-black bg-cyan-100/70 p-6 text-center text-black shadow-2xl backdrop-blur-md">
            <p className="mb-2 text-2xl font-black">Unique IPs</p>

            <h2 className="text-6xl font-black text-orange-500">
              {uniqueIps}
            </h2>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border-4 border-black bg-cyan-300/70 p-6 text-black shadow-2xl backdrop-blur-md">
          <h2 className="mb-5 text-3xl font-black">Visitor Activity</h2>

          {visitors.length === 0 && (
            <div className="rounded-[24px] border-4 border-black bg-white/75 p-5 text-black">
              No website visitors found yet.
            </div>
          )}

          <div className="space-y-4">
            {visitors.map((visitor) => (
              <div
                key={visitor.id}
                className="rounded-[24px] border-4 border-black bg-white/80 p-5 text-black shadow-xl backdrop-blur-md"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-2xl font-black">
                      Page: {visitor.page || "Unknown page"}
                    </p>

                    <p className="mt-1 text-lg">
                      IP: {visitor.visitor_ip || "Unknown IP"}
                    </p>

                    <p className="text-lg">
                      Time: {formatVisitorTime(visitor.created_at)}
                    </p>
                  </div>

                  <span className="rounded-full border-2 border-black bg-gradient-to-r from-cyan-300 via-teal-400 to-cyan-500 px-5 py-2 text-sm font-black uppercase text-slate-800">
                    Visitor
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}