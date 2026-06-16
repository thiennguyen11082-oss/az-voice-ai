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

  function getStatusBadgeClass(status: string) {
    if (status === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "missed") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  }

  function getStatusLabel(status: string) {
    if (status === "completed") return "Completed";
    if (status === "missed") return "Missed";
    return "Needs Follow Up";
  }

  function getPlanLabel(plan: string) {
    if (plan === "pro") return "Pro";
    if (plan === "business") return "Business";
    return "Starter";
  }

  function getPlanDescription(plan: string) {
    if (plan === "pro") {
      return "AI Receptionist enabled";
    }

    if (plan === "business") {
      return "Advanced features enabled";
    }

    return "Voicemail-only plan";
  }

  function getPlanColorClass(plan: string) {
    if (plan === "pro") {
      return "text-green-600";
    }

    if (plan === "business") {
      return "text-blue-600";
    }

    return "text-orange-500";
  }

  return (
    <section className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>

      <p className="text-gray-500 mb-10">
        AI Business Receptionist Overview
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">Current Plan</p>

          <h2
            className={`text-4xl font-bold capitalize ${getPlanColorClass(
              businessPlan
            )}`}
          >
            {getPlanLabel(businessPlan)}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {getPlanDescription(businessPlan)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">Total Calls</p>
          <h2 className="text-4xl font-bold">{totalCalls}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">Completed Calls</p>
          <h2 className="text-4xl font-bold text-green-600">
            {completedCalls}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">Needs Follow Up</p>
          <h2 className="text-4xl font-bold text-yellow-600">
            {inProgressCalls}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">Missed Calls</p>
          <h2 className="text-4xl font-bold text-red-500">{missedCalls}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">Voice Messages</p>
          <h2 className="text-4xl font-bold text-blue-500">
            {voiceMessages}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">Reviewed Calls</p>
          <h2 className="text-4xl font-bold text-green-600">
            {reviewedCalls}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">Not Reviewed</p>
          <h2 className="text-4xl font-bold text-orange-500">
            {notReviewedCalls}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 md:col-span-4">
          <p className="text-gray-500 mb-2">Action Needed</p>

          <h2 className="text-4xl font-bold text-purple-600">
            {inProgressCalls + missedCalls + notReviewedCalls}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Calls that may need owner attention.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/calls"
          className="bg-black text-white rounded-xl px-5 py-4 text-center font-semibold hover:bg-gray-800"
        >
          View Calls
        </Link>

        <Link
          href="/messages"
          className="bg-white border rounded-xl px-5 py-4 text-center font-semibold hover:bg-gray-50"
        >
          View Voice Messages
        </Link>

        <Link
          href="/missed"
          className="bg-white border rounded-xl px-5 py-4 text-center font-semibold hover:bg-gray-50"
        >
          View Missed Calls
        </Link>

        <Link
          href="/settings"
          className="bg-white border rounded-xl px-5 py-4 text-center font-semibold hover:bg-gray-50"
        >
          Go to Settings
        </Link>
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Calls</h2>

        {recentCalls.length === 0 && (
          <p className="text-gray-500">No recent calls found.</p>
        )}

        <div className="space-y-3">
          {recentCalls.map((call) => (
            <div key={call.id} className="border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {call.customer_name || "Phone Caller"}
                  </p>

                  <p className="text-gray-500">
                    {call.phone_number || "No phone number"}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    {formatCallTime(call.created_at)}
                  </p>
                </div>

                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(
                    call.status
                  )}`}
                >
                  {getStatusLabel(call.status)}
                </span>
              </div>

              <p className="text-gray-600 mt-3">
                {call.summary || call.transcript || "No summary available."}
              </p>

              <p className="text-sm mt-3">
                {call.reviewed ? (
                  <span className="text-green-600 font-semibold">
                    Reviewed
                  </span>
                ) : (
                  <span className="text-orange-500 font-semibold">
                    Not Reviewed
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}