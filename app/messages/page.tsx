"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reviewFilter, setReviewFilter] = useState("all");

  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadMessages() {
      const businessId = await getCurrentBusinessId();

      if (!businessId) return;

      const { data } = await authClient
        .from("voice_messages")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setMessages(data || []);
    }

    loadMessages();
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

  function formatMessageTime(createdAt: string) {
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

  const filteredMessages = messages.filter((message) => {
    const searchText = `
      ${message.customer_name || ""}
      ${message.phone_number || ""}
      ${message.message || ""}
      ${message.transcript || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const messageDate = getLocalDateValue(message.created_at);

    const matchesStartDate = startDate ? messageDate >= startDate : true;
    const matchesEndDate = endDate ? messageDate <= endDate : true;

    const matchesReview =
      reviewFilter === "all"
        ? true
        : reviewFilter === "reviewed"
        ? message.reviewed === true
        : message.reviewed !== true;

    return matchesSearch && matchesStartDate && matchesEndDate && matchesReview;
  });

  function toggleSelectMode() {
    setSelectMode(!selectMode);
    setSelectedMessageIds([]);
  }

  function exitSelectMode() {
    setSelectedMessageIds([]);
    setSelectMode(false);
  }

  function toggleSelectedMessage(messageId: string) {
    if (selectedMessageIds.includes(messageId)) {
      setSelectedMessageIds((currentIds) =>
        currentIds.filter((id) => id !== messageId)
      );
    } else {
      setSelectedMessageIds((currentIds) => [...currentIds, messageId]);
    }
  }

  function selectAllVisibleMessages() {
    const visibleMessageIds = filteredMessages.map((message) => message.id);
    setSelectedMessageIds(visibleMessageIds);
  }

  function clearSelectedMessages() {
    setSelectedMessageIds([]);
  }

  async function toggleReviewed(message: any) {
    const newReviewedValue = !message.reviewed;

    const { error } = await authClient
      .from("voice_messages")
      .update({
        reviewed: newReviewedValue,
      })
      .eq("id", message.id);

    if (error) {
      console.error("Error updating reviewed status:", error);
      return;
    }

    setMessages((currentMessages) =>
      currentMessages.map((item) =>
        item.id === message.id
          ? {
              ...item,
              reviewed: newReviewedValue,
            }
          : item
      )
    );
  }

  async function bulkUpdateReviewed(newReviewedValue: boolean) {
    if (selectedMessageIds.length === 0) return;

    const { error } = await authClient
      .from("voice_messages")
      .update({
        reviewed: newReviewedValue,
      })
      .in("id", selectedMessageIds);

    if (error) {
      console.error("Error bulk updating reviewed:", error);
      return;
    }

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        selectedMessageIds.includes(message.id)
          ? {
              ...message,
              reviewed: newReviewedValue,
            }
          : message
      )
    );

    exitSelectMode();
  }

  async function bulkDeleteMessages() {
    if (selectedMessageIds.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedMessageIds.length} selected voice message(s)? This cannot be undone.`
    );

    if (!confirmed) return;

    const { error } = await authClient
      .from("voice_messages")
      .delete()
      .in("id", selectedMessageIds);

    if (error) {
      console.error("Error deleting voice messages:", error);
      return;
    }

    setMessages((currentMessages) =>
      currentMessages.filter(
        (message) => !selectedMessageIds.includes(message.id)
      )
    );

    exitSelectMode();
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
    setReviewFilter("all");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold">Voice Messages</h1>

        <div className="flex items-center gap-2">
          {selectMode && (
            <button
              onClick={selectAllVisibleMessages}
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
          placeholder="Search by name, phone number, or message..."
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

      {(search || startDate || endDate || reviewFilter !== "all") && (
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
              Selected: {selectedMessageIds.length}
            </p>

            <button
              onClick={clearSelectedMessages}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl text-sm font-medium"
            >
              Clear Selected
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
              onClick={bulkDeleteMessages}
              className="bg-black hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-medium"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6">
        {filteredMessages.length === 0 && (
          <p className="text-gray-500">No voice messages found.</p>
        )}

        {filteredMessages.map((message) => {
          const isSelected = selectedMessageIds.includes(message.id);

          return (
            <div key={message.id} className="border rounded-xl p-4 mb-4">
              <div className="flex items-start gap-4">
                {selectMode && (
                  <button
                    onClick={() => toggleSelectedMessage(message.id)}
                    className={
                      isSelected
                        ? "mt-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold"
                        : "mt-1 w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:border-blue-500"
                    }
                    title={isSelected ? "Selected" : "Select message"}
                  >
                    {isSelected ? "✓" : ""}
                  </button>
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {message.customer_name || "Unknown caller"}
                      </p>

                      <p className="text-gray-500 mt-1">
                        Phone: {message.phone_number || "No phone number"}
                      </p>

                      <p className="text-gray-500">
                        Message Time: {formatMessageTime(message.created_at)}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleReviewed(message)}
                      className="text-2xl w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-100"
                      title={message.reviewed ? "Reviewed" : "Mark as reviewed"}
                    >
                      {message.reviewed ? "✅" : "○"}
                    </button>
                  </div>

                  <div className="mt-4 bg-gray-50 border rounded-xl p-4">
                    <p className="font-semibold mb-1">Message</p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {message.message ||
                        message.transcript ||
                        "No message available."}
                    </p>
                  </div>

                  {message.recording_url && (
                    <audio controls className="mt-4 w-full">
                      <source
                        src={`/api/twilio/audio?url=${encodeURIComponent(
                          message.recording_url
                        )}`}
                        type="audio/mpeg"
                      />
                      Your browser does not support the audio element.
                    </audio>
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