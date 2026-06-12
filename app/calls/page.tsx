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
      return "bg-green-500 text-white border-green-500";
    }

    if (status === "missed") {
      return "bg-red-500 text-white border-red-500";
    }

    return "bg-yellow-400 text-black border-yellow-400";
  }

  function getStatusFilterButtonClass(filterName: string) {
    if (statusFilter === filterName) {
      return "bg-black text-white";
    }

    return "bg-white text-gray-700 border hover:bg-gray-100";
  }

  function getReviewFilterButtonClass(filterName: string) {
    if (reviewFilter === filterName) {
      return "bg-black text-white";
    }

    return "bg-white text-gray-700 border hover:bg-gray-100";
  }

  function clearFilters() {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setReviewFilter("all");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold">Calls</h1>

        <div className="flex items-center gap-2">
          {selectMode && (
            <button
              onClick={selectAllVisibleCalls}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium"
            >
              Select All
            </button>
          )}

          <button
            onClick={toggleSelectMode}
            className={
              selectMode
                ? "bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl font-medium"
                : "bg-white border hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-xl font-medium"
            }
          >
            {selectMode ? "Exit Select" : "Select"}
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 lg:grid-cols-4 gap-3">
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

      <div className="mb-3">
        <p className="text-sm font-semibold text-gray-600 mb-2">Status</p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusFilterButtonClass(
              "all"
            )}`}
          >
            All
          </button>

          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusFilterButtonClass(
              "completed"
            )}`}
          >
            Completed
          </button>

          <button
            onClick={() => setStatusFilter("in_progress")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusFilterButtonClass(
              "in_progress"
            )}`}
          >
            In Progress
          </button>

          <button
            onClick={() => setStatusFilter("missed")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusFilterButtonClass(
              "missed"
            )}`}
          >
            Missed
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-600 mb-2">Review</p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setReviewFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${getReviewFilterButtonClass(
              "all"
            )}`}
          >
            All
          </button>

          <button
            onClick={() => setReviewFilter("reviewed")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${getReviewFilterButtonClass(
              "reviewed"
            )}`}
          >
            Reviewed
          </button>

          <button
            onClick={() => setReviewFilter("not_reviewed")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${getReviewFilterButtonClass(
              "not_reviewed"
            )}`}
          >
            Not Reviewed
          </button>
        </div>
      </div>

      {(search ||
        startDate ||
        endDate ||
        statusFilter !== "all" ||
        reviewFilter !== "all") && (
        <button
          onClick={clearFilters}
          className="mb-6 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl"
        >
          Clear Filters
        </button>
      )}

      {selectMode && (
        <div className="mb-6 bg-white border rounded-2xl shadow p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold mr-2">
              Selected: {selectedCallIds.length}
            </p>

            <button
              onClick={clearSelectedCalls}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl text-sm font-medium"
            >
              Clear Selected
            </button>

            <button
              onClick={() => bulkUpdateStatus("completed")}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-medium"
            >
              Mark Completed
            </button>

            <button
              onClick={() => bulkUpdateStatus("in_progress")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-xl text-sm font-medium"
            >
              Mark In Progress
            </button>

            <button
              onClick={() => bulkUpdateStatus("missed")}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-medium"
            >
              Mark Missed
            </button>

            <button
              onClick={() => bulkUpdateReviewed(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-medium"
            >
              Mark Reviewed
            </button>

            <button
              onClick={() => bulkUpdateReviewed(false)}
              className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-xl text-sm font-medium"
            >
              Mark Not Reviewed
            </button>

            <button
              onClick={bulkDeleteCalls}
              className="bg-black hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-medium"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6">
        {filteredCalls.length === 0 && (
          <p className="text-gray-500">No calls found.</p>
        )}

        {filteredCalls.map((call) => {
          const isTranscriptOpen = openTranscriptId === call.id;
          const currentStatus = call.status || "in_progress";
          const isSelected = selectedCallIds.includes(call.id);

          return (
            <div key={call.id} className="border rounded-xl p-4 mb-4">
              <div className="flex items-start gap-4">
                {selectMode && (
                  <button
                    onClick={() => toggleSelectedCall(call.id)}
                    className={
                      isSelected
                        ? "mt-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold"
                        : "mt-1 w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:border-blue-500"
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
                        <p className="font-semibold">
                          {call.customer_name || "Phone Caller"}
                        </p>

                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            updateCallStatus(call, e.target.value)
                          }
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
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}