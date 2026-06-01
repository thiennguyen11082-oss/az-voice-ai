import { supabase } from "@/app/lib/supabase";

export default async function Home() {
  const { count: totalCalls } = await supabase
    .from("calls")
    .select("*", { count: "exact", head: true });

  const { count: missedCalls } = await supabase
    .from("missed_calls")
    .select("*", { count: "exact", head: true });

  const { count: voiceMessages } = await supabase
    .from("voice_messages")
    .select("*", { count: "exact", head: true });

  const { count: websiteVisitors } = await supabase
    .from("website_visitors")
    .select("*", { count: "exact", head: true });

  const { data: recentCalls } = await supabase
    .from("calls")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <section className="p-8 text-gray-900">
      <h2 className="text-4xl font-bold mb-2">
        Dashboard
      </h2>

      <p className="text-gray-500 mb-10">
        AI Business Receptionist Overview
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Total Calls
          </p>

          <h2 className="text-4xl font-bold">
            {totalCalls || 0}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Missed Calls
          </p>

          <h2 className="text-4xl font-bold text-red-500">
            {missedCalls || 0}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Voice Messages
          </p>

          <h2 className="text-4xl font-bold text-blue-500">
            {voiceMessages || 0}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Website Visitors
          </p>

          <h2 className="text-4xl font-bold text-green-500">
            {websiteVisitors || 0}
          </h2>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          Recent Calls
        </h2>

        {recentCalls?.length === 0 && (
          <p className="text-gray-500">
            No recent calls found.
          </p>
        )}

        {recentCalls?.map((call) => (
          <div
            key={call.id}
            className="border rounded-xl p-4 mb-3"
          >
            <p className="font-semibold">
              {call.customer_name}
            </p>

            <p className="text-gray-500">
              {call.phone_number}
            </p>

            <p className="text-gray-500">
              {call.transcript}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}