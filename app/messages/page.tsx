import { supabase } from "@/app/lib/supabase";

export default async function MessagesPage() {
  const { data: messages, error } = await supabase
    .from("voice_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-8 text-red-500">
        Error loading voice messages.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">

      <h1 className="text-4xl font-bold mb-6">
        Voice Messages
      </h1>

      <div className="bg-white rounded-2xl shadow p-6">

        {messages?.length === 0 && (
          <p className="text-gray-500">
            No voice messages found yet.
          </p>
        )}

        {messages?.map((message) => (
          <div
            key={message.id}
            className="border rounded-xl p-4 mb-4"
          >
            <p className="font-semibold">
              {message.customer_name || "Unknown caller"}
            </p>

            <p className="text-gray-500">
              Phone: {message.phone_number || "No phone number"}
            </p>

            <p className="text-gray-500 mt-2">
              {message.message || "No message"}
            </p>
          </div>
        ))}

      </div>

    </main>
  );
}