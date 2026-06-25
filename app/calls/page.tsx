"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [openTranscriptId, setOpenTranscriptId] = useState<string | null>(null);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedCallIds, setSelectedCallIds] = useState<string[]>([]);

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

    const matchesStatus =
      statusFilter === "all" ? true : call.status === statusFilter;

    const matchesReview =
      reviewFilter === "all"
        ? true
        : reviewFilter === "reviewed"
        ? call.reviewed === true
        : call.reviewed !== true;

    return (
      matchesSearch &&
      matchesStartDate &&
      matchesEndDate &&
      matchesStatus &&
      matchesReview
    );
  });

  function toggleTranscript(callId: string) {
    if (openTranscriptId === callId) {
      setOpenTranscriptId(null);
    } else {
      setOpenTranscriptId(callId);
    }
  }

  function toggleSelectMode() {
    setSelectMode(!selectMode);
    setSelectedCallIds([]);
  }

  function exitSelectMode() {
    setSelectedCallIds([]);
    setSelectMode(false);
  }

  function toggleSelectedCall(callId: string) {
    if (selectedCallIds.includes(callId)) {
      setSelectedCallIds((currentIds) =>
        currentIds.filter((id) => id !== callId)
      );
    } else {
      setSelectedCallIds((currentIds) => [...currentIds, callId]);
    }
  }

  function selectAllVisibleCalls() {
    const visibleCallIds = filteredCalls.map((call) => call.id);
    setSelectedCallIds(visibleCallIds);
  }

  function clearSelectedCalls() {
    setSelectedCallIds([]);
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

  async function bulkUpdateStatus(newStatus: string) {
    if (selectedCallIds.length === 0) return;

    let newDuration = "";

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
      .in("id", selectedCallIds);

    if (error) {
      console.error("Error bulk updating status:", error);
      return;
    }

    setCalls((currentCalls) =>
      currentCalls.map((call) =>
        selectedCallIds.includes(call.id)
          ? {
              ...call,
              status: newStatus,
              duration: newDuration,
            }
          : call
      )
    );

    exitSelectMode();
  }

  async function bulkUpdateReviewed(newReviewedValue: boolean) {
    if (selectedCallIds.length === 0) return;

    const { error } = await authClient
      .from("calls")
      .update({
        reviewed: newReviewedValue,
      })
      .in("id", selectedCallIds);

    if (error) {
      console.error("Error bulk updating reviewed:", error);
      return;
    }

    setCalls((currentCalls) =>
      currentCalls.map((call) =>
        selectedCallIds.includes(call.id)
          ? {
              ...call,
              reviewed: newReviewedValue,
            }
          : call
      )
    );

    exitSelectMode();
  }

  async function bulkDeleteCalls() {
    if (selectedCallIds.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedCallIds.length} selected call(s)? This cannot be undone.`
    );

    if (!confirmed) return;

    const { error } = await authClient
      .from("calls")
      .delete()
      .in("id", selectedCallIds);

    if (error) {
      console.error("Error deleting calls:", error);
      return;
    }

    setCalls((currentCalls) =>
      currentCalls.filter((call) => !selectedCallIds.includes(call.id))
    );

    exitSelectMode();
  }

  function getStatusDropdownClass(status: string) {
    if (status === "completed") {
      return "bg-green-500 text-black border-black";
    }

    if (status === "missed") {
      return "bg-red-500 text-black border-black";
    }

    return "bg-yellow-500 text-black border-black";
  }

  function getStatusFilterButtonClass(filterName: string) {
    if (statusFilter === filterName) {
      return "bg-gradient-to-r from-cyan-300 via-teal-400 to-cyan-500 text-slate-800 shadow-[0_0_14px_rgba(45,212,191,0.75)]";
    }

    return "bg-white/80 text-slate-800 hover:bg-cyan-100";
  }

  function getReviewFilterButtonClass(filterName: string) {
    if (reviewFilter === filterName) {
      return "bg-gradient-to-r from-cyan-300 via-teal-400 to-cyan-500 text-slate-800 shadow-[0_0_14px_rgba(45,212,191,0.75)]";
    }

    return "bg-white/80 text-slate-800 hover:bg-cyan-100";
  }

  function clearFilters() {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setReviewFilter("all");
  }

  return (
    <main className="min-h-screen text-white">
      <div className="bg-black/45 px-5 py-5 backdrop-blur-sm">
        <h1 className="text-5xl font-black tracking-wide text-cyan-50 drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]">
          Calls
        </h1>
      </div>

      <div className="bg-cyan-300/70 px-5 py-4 text-black backdrop-blur-md">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
          <input
            placeholder="Search by name, phone number, summary or transcript,..."
            className="rounded-full border-4 border-black bg-white/55 px-5 py-3 text-lg outline-none placeholder:text-slate-700 lg:col-span-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div>
            <label className="mb-1 block text-base font-bold text-white drop-shadow">
              Start Date
            </label>

            <input
              type="date"
              className="w-full rounded-full border-4 border-slate-700 bg-white/60 px-4 py-2 text-black outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-base font-bold text-white drop-shadow">
              End Date
            </label>

            <input
              type="date"
              className="w-full rounded-full border-4 border-slate-700 bg-white/60 px-4 py-2 text-black outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-3xl font-semibold text-black">Status</p>

          <div className="flex flex-wrap gap-5">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-8 py-2 text-xl font-medium transition ${getStatusFilterButtonClass(
                "all"
              )}`}
            >
              All
            </button>

            <button
              onClick={() => setStatusFilter("completed")}
              className={`rounded-full px-8 py-2 text-xl font-medium transition ${getStatusFilterButtonClass(
                "completed"
              )}`}
            >
              Completed
            </button>

            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`rounded-full px-8 py-2 text-xl font-medium transition ${getStatusFilterButtonClass(
                "in_progress"
              )}`}
            >
              In Progress
            </button>

            <button
              onClick={() => setStatusFilter("missed")}
              className={`rounded-full px-8 py-2 text-xl font-medium transition ${getStatusFilterButtonClass(
                "missed"
              )}`}
            >
              Missed
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-3xl font-semibold text-black">Reviewed</p>

          <div className="flex flex-wrap gap-5">
            <button
              onClick={() => setReviewFilter("all")}
              className={`rounded-full px-8 py-2 text-xl font-medium transition ${getReviewFilterButtonClass(
                "all"
              )}`}
            >
              All
            </button>

            <button
              onClick={() => setReviewFilter("reviewed")}
              className={`rounded-full px-8 py-2 text-xl font-medium transition ${getReviewFilterButtonClass(
                "reviewed"
              )}`}
            >
              Reviewed
            </button>

            <button
              onClick={() => setReviewFilter("not_reviewed")}
              className={`rounded-full px-8 py-2 text-xl font-medium transition ${getReviewFilterButtonClass(
                "not_reviewed"
              )}`}
            >
              Not Reviewed
            </button>

            {(search ||
              startDate ||
              endDate ||
              statusFilter !== "all" ||
              reviewFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="rounded-full bg-black px-6 py-2 text-lg font-semibold text-white hover:bg-slate-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="mb-4 flex justify-end">
          <div className="flex items-center gap-2">
            {selectMode && (
              <button
                onClick={selectAllVisibleCalls}
                className="rounded-full border-2 border-black bg-blue-100/95 px-5 py-2 font-semibold text-black shadow-lg hover:bg-cyan-200"
              >
                Select All
              </button>
            )}

            <button
              onClick={toggleSelectMode}
              className="rounded-full border-2 border-black bg-blue-100/95 px-5 py-2 font-semibold text-black shadow-lg hover:bg-cyan-200"
            >
              {selectMode ? "Exit Select" : "Select"}
            </button>
          </div>
        </div>

        {selectMode && (
          <div className="mb-4 rounded-[26px] border-4 border-black bg-white/70 p-4 text-black shadow-2xl backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-2 font-bold">
                Selected: {selectedCallIds.length}
              </p>

              <button
                onClick={clearSelectedCalls}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold hover:bg-gray-100"
              >
                Clear Selected
              </button>

              <button
                onClick={() => bulkUpdateStatus("completed")}
                className="rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-black hover:bg-green-600"
              >
                Mark Completed
              </button>

              <button
                onClick={() => bulkUpdateStatus("in_progress")}
                className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-500"
              >
                Mark In Progress
              </button>

              <button
                onClick={() => bulkUpdateStatus("missed")}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-black hover:bg-red-600"
              >
                Mark Missed
              </button>

              <button
                onClick={() => bulkUpdateReviewed(true)}
                className="rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
              >
                Mark Reviewed
              </button>

              <button
                onClick={() => bulkUpdateReviewed(false)}
                className="rounded-full bg-slate-700 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
              >
                Mark Not Reviewed
              </button>

              <button
                onClick={bulkDeleteCalls}
                className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {filteredCalls.length === 0 && (
          <div className="rounded-[28px] border-4 border-black bg-white/65 p-6 text-black backdrop-blur-md">
            No calls found.
          </div>
        )}

        <div className="space-y-4">
          {filteredCalls.map((call) => {
            const isTranscriptOpen = openTranscriptId === call.id;
            const currentStatus = call.status || "in_progress";
            const isSelected = selectedCallIds.includes(call.id);

            return (
              <div
                key={call.id}
                className="rounded-[28px] border-4 border-black bg-cyan-100/70 p-6 text-black shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  {selectMode && (
                    <button
                      onClick={() => toggleSelectedCall(call.id)}
                      className={
                        isSelected
                          ? "mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-black text-white"
                          : "mt-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-black bg-white hover:bg-cyan-100"
                      }
                      title={isSelected ? "Selected" : "Select call"}
                    >
                      {isSelected ? "✓" : ""}
                    </button>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-2xl font-black">
                            {call.customer_name || "Phone Caller"}
                          </p>

                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              updateCallStatus(call, e.target.value)
                            }
                            className={`rounded-full border-2 px-5 py-1 text-sm font-black uppercase outline-none cursor-pointer ${getStatusDropdownClass(
                              currentStatus
                            )}`}
                          >
                            <option value="completed">Completed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="missed">Missed</option>
                          </select>
                        </div>

                        <p className="text-lg">
                          Phone: {call.phone_number || "No phone number"}
                        </p>

                        <p className="text-lg">
                          Call Time: {formatCallTime(call.created_at)}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleReviewed(call)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-black bg-white/70 text-2xl hover:bg-cyan-100"
                        title={call.reviewed ? "Reviewed" : "Mark as reviewed"}
                      >
                        {call.reviewed ? "✅" : "○"}
                      </button>
                    </div>

                    <div className="mt-4 rounded-[24px] border-4 border-black bg-white/95 p-5">
                      <p className="mb-1 text-xl font-black">Summary</p>

                      <p className="text-lg">
                        {call.summary || "No summary yet."}
                      </p>
                    </div>

                    {call.transcript && (
                      <button
                        onClick={() => toggleTranscript(call.id)}
                        className="mt-4 rounded-full bg-blue-500 px-7 py-2 text-xl font-semibold text-blue-950 shadow-lg hover:bg-blue-400"
                      >
                        {isTranscriptOpen
                          ? "Hide Full Transcript"
                          : "View Full Transcript"}
                      </button>
                    )}

                    {isTranscriptOpen && (
                      <div className="mt-4 whitespace-pre-wrap rounded-[24px] border-4 border-black bg-black/85 p-5 text-white">
                        <p className="mb-2 text-xl font-black">
                          Full Transcript
                        </p>

                        <p>{call.transcript}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}