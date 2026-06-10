"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openTranscriptId, setOpenTranscriptId] = useState<string | null>(null);

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

  function parseSupabaseTime(createdAt: string) {
    if (!createdAt) return null;

    // Supabase timestamps are UTC.
    // If the timestamp does not include timezone info, force it to UTC.
    const hasTimezone =
      createdAt.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(createdAt);

    const utcTime = hasTimezone
      ? createdAt
      : createdAt.replace(" ", "T") + "Z";

    return new Date(utcTime);
  }

  function formatCallTime(createdAt: string) {
    const date = parseSupabaseTime(createdAt);

    if (!date) return "No time available";

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getLocalDateValue(createdAt: string) {
    const date = parseSupabaseTime(createdAt);

    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const filteredCalls = calls.filter((call) => {
    const searchText = `
      ${call.customer_name || ""}
      ${call.phone_number || ""}
      ${call.summary || ""}
      ${call.transcript || ""}
      ${call.status || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const callDate = getLocalDateValue(call.created_at);

    const matchesStartDate = startDate ? callDate >= startDate : true;
    const matchesEndDate = endDate ? callDate <= endDate : true;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  function toggleTranscript(callId: string) {
    if (openTranscriptId === callId) {
      setOpenTranscriptId(null);
    } else {
      setOpenTranscriptId(callId);
    }
  }

  async function toggleReviewed(call: any) {
    const newReviewedValue = !call.reviewed;

    const { error } = await authClient
      .from("calls")
      .update({
        reviewed: newReviewedValue,
      })
      .eq("id", call.id);

    if (error) {
      console.error("Error updating reviewed status:", error);
      return;
    }

    setCalls((currentCalls) =>
      currentCalls.map((item) =>
        item.id === call.id
          ? {
              ...item,
              reviewed: newReviewedValue,
            }
          : item
      )
    );
  }

  async function updateCallStatus(call: any, newStatus: string) {
    let newDuration = call.duration;

    if (newStatus === "completed") {
      newDuration = "Completed";
    }

    if (newStatus === "in_progress") {
      newDuration = "Needs Follow Up";
    }

    if (newStatus === "missed") {
      newDuration = "Missed";
    }

    const { error } = await authClient
      .from("calls")
      .update({
        status: newStatus,
        duration: newDuration,
      })
      .eq("id", call.id);

    if (error) {
      console.error("Error updating call status:", error);
      return;
    }

    setCalls((currentCalls) =>
      currentCalls.map((item) =>
        item.id === call.id
          ? {
              ...item,
              status: newStatus,
              duration: newDuration,
            }
          : item
      )
    );
  }

  function getStatusDropdownClass(status: string) {
    if (status === "completed") {
      return "bg-green-500 text-white border-green-500";
    }

    if (status === "missed") {
      return "bg-red-500 text-white border-red-500";
    }

    return "bg-yellow-400 text-black border-yellow-400";
  }

  function clearFilters() {
    setSearch("");
    setStartDate("");
    setEndDate("");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Calls</h1>

      <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-3">
        <input
          placeholder="Search by name, phone number, summary, or transcript..."
          className="bg-white border rounded-xl p-4 lg:col-span-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Start Date
        </label>
        <input
          type="date"
          className="w-full bg-white border rounded-xl p-4"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          End Date
        </label>
        <input
          type="date"
          className="w-full bg-white border rounded-xl p-4"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      </div>

      {(search || startDate || endDate) && (
        <button
          onClick={clearFilters}
          className="mb-6 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl"
        >
          Clear Filters
        </button>
      )}

      <div className="bg-white rounded-2xl shadow p-6">
        {filteredCalls.length === 0 && (
          <p className="text-gray-500">No calls found.</p>
        )}

        {filteredCalls.map((call) => {
          const isTranscriptOpen = openTranscriptId === call.id;
          const currentStatus = call.status || "in_progress";

          return (
            <div key={call.id} className="border rounded-xl p-4 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold">
                      {call.customer_name || "Phone Caller"}
                    </p>

                    <select
                      value={currentStatus}
                      onChange={(e) => updateCallStatus(call, e.target.value)}
                      className={`rounded-full px-3 py-1 text-xs font-bold border cursor-pointer ${getStatusDropdownClass(
                        currentStatus
                      )}`}
                    >
                      <option value="completed">COMPLETED</option>
                      <option value="in_progress">IN PROGRESS</option>
                      <option value="missed">MISSED</option>
                    </select>
                  </div>

                  <p className="text-gray-500 mt-1">
                    Phone: {call.phone_number || "No phone number"}
                  </p>

                  <p className="text-gray-500">
                    Call Time: {formatCallTime(call.created_at)}
                  </p>
                </div>

                <button
                  onClick={() => toggleReviewed(call)}
                  className="text-2xl w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-100"
                  title={call.reviewed ? "Reviewed" : "Mark as reviewed"}
                >
                  {call.reviewed ? "✅" : "○"}
                </button>
              </div>

              <div className="mt-4 bg-gray-50 border rounded-xl p-4">
                <p className="font-semibold mb-1">Summary</p>
                <p className="text-gray-700">
                  {call.summary || "No summary yet."}
                </p>
              </div>

              {call.transcript && (
                <button
                  onClick={() => toggleTranscript(call.id)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl"
                >
                  {isTranscriptOpen
                    ? "Hide Full Transcript"
                    : "View Full Transcript"}
                </button>
              )}

              {isTranscriptOpen && (
                <div className="mt-4 bg-gray-900 text-white rounded-xl p-4 whitespace-pre-wrap">
                  <p className="font-semibold mb-2">Full Transcript</p>
                  <p>{call.transcript}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}