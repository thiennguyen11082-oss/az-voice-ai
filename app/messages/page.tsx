"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);

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

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Voice Messages</h1>

      <div className="bg-white rounded-2xl shadow p-6">
        {messages.length === 0 && (
          <p className="text-gray-500">No voice messages found yet.</p>
        )}

        {messages.map((message) => (
          <div key={message.id} className="border rounded-xl p-4 mb-4">
            <p className="font-semibold">
              {message.customer_name || "Unknown caller"}
            </p>

            <p className="text-gray-500">
              Phone: {message.phone_number || "No phone number"}
            </p>

            <p className="text-gray-500 mt-2">
              {message.message || "No message"}
            </p>

            {message.recording_url && (
              <audio controls className="mt-4 w-full">
                <source
                  src={`/api/twilio/audio?url=${encodeURIComponent(message.recording_url)}`}
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}