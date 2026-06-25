"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function Home() {
  const [businessPlan, setBusinessPlan] = useState("starter");
  const [totalCalls, setTotalCalls] = useState(0);
  const [completedCalls, setCompletedCalls] = useState(0);
  const [inProgressCalls, setInProgressCalls] = useState(0);
  const [missedCalls, setMissedCalls] = useState(0);
  const [voiceMessages, setVoiceMessages] = useState(0);
  const [reviewedCalls, setReviewedCalls] = useState(0);
  const [notReviewedCalls, setNotReviewedCalls] = useState(0);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const businessId = await getCurrentBusinessId();

      if (!businessId) return;

      const { data: businessData } = await authClient
        .from("businesses")
        .select("plan")
        .eq("id", businessId)
        .single();

      const { count: callsCount } = await authClient
        .from("calls")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: completedCount } = await authClient
        .from("calls")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("status", "completed");

      const { count: inProgressCount } = await authClient
        .from("calls")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("status", "in_progress");

      const { count: missedCount } = await authClient
        .from("calls")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("status", "missed");

      const { count: messagesCount } = await authClient
        .from("voice_messages")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      const { count: reviewedCount } = await authClient
        .from("calls")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("reviewed", true);

      const { count: notReviewedCount } = await authClient
        .from("calls")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("reviewed", false);

      const { data: recent } = await authClient
        .from("calls")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5);

      setBusinessPlan(businessData?.plan || "starter");
      setTotalCalls(callsCount || 0);
      setCompletedCalls(completedCount || 0);
      setInProgressCalls(inProgressCount || 0);
      setMissedCalls(missedCount || 0);
      setVoiceMessages(messagesCount || 0);
      setReviewedCalls(reviewedCount || 0);
      setNotReviewedCalls(notReviewedCount || 0);
      setRecentCalls(recent || []);
    }

    loadDashboard();
  }, []);

  function formatCallTime(dateValue: string) {
    if (!dateValue) return "No date";

    const date = new Date(dateValue);

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getStatusLabel(status: string) {
    if (status === "completed") return "COMPLETED";
    if (status === "missed") return "MISSED";
    return "NEEDS FOLLOW UP";
  }

  function getStatusColor(status: string) {
    if (status === "completed") return "text-lime-300";
    if (status === "missed") return "text-red-400";
    return "text-yellow-300";
  }

  function getPlanLabel(plan: string) {
    if (plan === "pro") return "PRO";
    if (plan === "business") return "BUSINESS";
    return "STARTER";
  }

  return (
    <section className="min-h-screen px-5 py-5 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-5xl font-black tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          Dashboard
        </h1>

        <p className="text-2xl text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          AI Business Receptionist Overview
        </p>
      </div>

      <div className="grid grid-cols-4 gap-x-12 gap-y-5">
        <div className="rounded-[28px] border border-white/30 bg-yellow-700/35 px-8 py-4 text-center shadow-2xl backdrop-blur-md">
          <p className="mb-2 text-xl font-semibold text-white">Current Plan</p>

          <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-green-400">
            {getPlanLabel(businessPlan)}
          </h2>
        </div>

        <div className="rounded-[28px] border border-white/40 bg-white/80 px-8 py-4 text-center text-black shadow-2xl backdrop-blur-md">
          <p className="mb-2 text-xl font-semibold">Total Calls</p>

          <h2 className="text-5xl font-black">{totalCalls}</h2>
        </div>

        <div className="rounded-[28px] border border-white/40 bg-white/80 px-8 py-4 text-center text-black shadow-2xl backdrop-blur-md">
          <p className="mb-2 text-xl font-semibold">Reviewed</p>

          <h2 className="text-5xl font-black text-green-600">
            {reviewedCalls}
          </h2>
        </div>

        <div className="rounded-[28px] border border-white/40 bg-white/80 px-8 py-4 text-center text-black shadow-2xl backdrop-blur-md">
          <p className="mb-2 text-xl font-semibold">Not Reviewed</p>

          <h2 className="text-5xl font-black text-red-500">
            {notReviewedCalls}
          </h2>
        </div>

        <div className="rounded-[28px] border border-white/40 bg-white/80 px-8 py-4 text-center text-black shadow-2xl backdrop-blur-md">
          <p className="mb-2 text-xl font-semibold">Completed Calls</p>

          <h2 className="text-5xl font-black text-green-600">
            {completedCalls}
          </h2>
        </div>

        <div className="rounded-[28px] border border-white/40 bg-white/80 px-8 py-4 text-center text-black shadow-2xl backdrop-blur-md">
          <p className="mb-2 text-xl font-semibold">Needs Follow Up</p>

          <h2 className="text-5xl font-black text-yellow-600">
            {inProgressCalls}
          </h2>
        </div>

        <div className="rounded-[28px] border border-white/40 bg-white/80 px-8 py-4 text-center text-black shadow-2xl backdrop-blur-md">
          <p className="mb-2 text-xl font-semibold">Missed Calls</p>

          <h2 className="text-5xl font-black text-red-500">
            {missedCalls}
          </h2>
        </div>

        <div className="rounded-[28px] border border-white/40 bg-white/80 px-8 py-4 text-center text-black shadow-2xl backdrop-blur-md">
          <p className="mb-2 text-xl font-semibold">Voice Messages</p>

          <h2 className="text-5xl font-black text-blue-600">
            {voiceMessages}
          </h2>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-16">
        <Link
          href="/calls"
          className="rounded-full border-4 border-black bg-blue-100/95 px-6 py-3 text-center text-xl font-semibold text-black shadow-lg hover:bg-cyan-200"
        >
          View Calls
        </Link>

        <Link
          href="/messages"
          className="rounded-full border-4 border-black bg-blue-100/95 px-6 py-3 text-center text-xl font-semibold text-black shadow-lg hover:bg-cyan-200"
        >
          View Voice Messages
        </Link>

        <Link
          href="/missed"
          className="rounded-full border-4 border-black bg-blue-100/95 px-6 py-3 text-center text-xl font-semibold text-black shadow-lg hover:bg-cyan-200"
        >
          View Missed Calls
        </Link>

        <Link
          href="/settings"
          className="rounded-full border-4 border-black bg-blue-100/95 px-6 py-3 text-center text-xl font-semibold text-black shadow-lg hover:bg-cyan-200"
        >
          Go to Settings
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-4xl font-semibold text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          Recent Calls
        </h2>

        {recentCalls.length === 0 && (
          <div className="rounded-[28px] border-4 border-black bg-white/65 p-6 text-black backdrop-blur-md">
            No recent calls found.
          </div>
        )}

        <div className="space-y-3">
          {recentCalls.map((call) => (
            <div
              key={call.id}
              className="relative rounded-[28px] border-4 border-black bg-white/65 px-7 py-4 text-black shadow-2xl backdrop-blur-md"
            >
              <div className="pr-48">
                <p className="font-semibold">
                  {call.customer_name || "Phone Caller"}
                </p>

                <p>{call.phone_number || "No phone number"}</p>

                <p>{formatCallTime(call.created_at)}</p>

                <p className="mt-1">
                  {call.summary || call.transcript || "No summary available."}
                </p>

                <p
                  className={`mt-3 text-2xl font-black tracking-widest ${
                    call.reviewed ? "text-lime-300" : "text-orange-500"
                  }`}
                >
                  {call.reviewed ? "REVIEWED" : "NOT REVIEWED"}
                </p>
              </div>

              <p
                className={`absolute right-8 top-5 text-2xl font-black tracking-widest ${getStatusColor(
                  call.status
                )}`}
              >
                {getStatusLabel(call.status)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}