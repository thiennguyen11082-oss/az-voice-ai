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
      return "bg-gradient-to-r from-cyan-300 via-teal-400 to-cyan-500 text-slate-800 shadow-[0_0_14px_rgba(45,212,191,0.75)]";
    }

    return "bg-white/80 text-slate-800 hover:bg-cyan-100";
  }

  function clearFilters() {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setReviewFilter("all");
  }

  return (
    <main className="min-h-screen text-white">
      <div className="bg-black/45 px-5 py-5 backdrop-blur-sm">
        <h1 className="text-5xl font-black tracking-wide text-cyan-50 drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]">
          Voice Messages
        </h1>
      </div>

      <div className="bg-cyan-300/70 px-5 py-4 text-black backdrop-blur-md">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
          <input
            placeholder="Search by name, phone number, or message,..."
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

            {(search || startDate || endDate || reviewFilter !== "all") && (
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
                onClick={selectAllVisibleMessages}
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
                Selected: {selectedMessageIds.length}
              </p>

              <button
                onClick={clearSelectedMessages}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold hover:bg-gray-100"
              >
                Clear Selected
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
                onClick={bulkDeleteMessages}
                className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {filteredMessages.length === 0 && (
          <div className="rounded-[28px] border-4 border-black bg-white/65 p-6 text-black backdrop-blur-md">
            No voice messages found.
          </div>
        )}

        <div className="space-y-4">
          {filteredMessages.map((message) => {
            const isSelected = selectedMessageIds.includes(message.id);

            return (
              <div
                key={message.id}
                className="rounded-[28px] border-4 border-black bg-cyan-100/70 p-6 text-black shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  {selectMode && (
                    <button
                      onClick={() => toggleSelectedMessage(message.id)}
                      className={
                        isSelected
                          ? "mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-black text-white"
                          : "mt-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-black bg-white hover:bg-cyan-100"
                      }
                      title={isSelected ? "Selected" : "Select message"}
                    >
                      {isSelected ? "✓" : ""}
                    </button>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-2xl font-black">
                          {message.customer_name || "Unknown Caller"}
                        </p>

                        <p className="text-lg">
                          Phone: {message.phone_number || "No phone number"}
                        </p>

                        <p className="text-lg">
                          Message Time: {formatMessageTime(message.created_at)}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleReviewed(message)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-black bg-white/70 text-2xl hover:bg-cyan-100"
                        title={message.reviewed ? "Reviewed" : "Mark as reviewed"}
                      >
                        {message.reviewed ? "✅" : "○"}
                      </button>
                    </div>

                    <div className="mt-4 rounded-[24px] border-4 border-black bg-white/95 p-5">
                      <p className="mb-1 text-xl font-black">Message</p>

                      <p className="whitespace-pre-wrap text-lg">
                        {message.message ||
                          message.transcript ||
                          "No message available."}
                      </p>
                    </div>

                    {message.reviewed ? (
                      <p className="mt-4 text-2xl font-black tracking-widest text-lime-300">
                        REVIEWED
                      </p>
                    ) : (
                      <p className="mt-4 text-2xl font-black tracking-widest text-orange-500">
                        NOT REVIEWED
                      </p>
                    )}

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
      </div>
    </main>
  );
}