import { supabase } from "@/app/lib/supabase";

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";

  let query = supabase
  .from("calls")
  .select("*")
  .eq("business_id", 1)
  .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,phone_number.ilike.%${search}%,transcript.ilike.%${search}%`
    );
  }

  const { data: calls, error } = await query;

  if (error) {
    return <main className="p-8 text-red-500">Error loading calls.</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Calls</h1>

      <form className="mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name, phone number, or transcript..."
          className="w-full bg-white border rounded-xl p-4"
        />
      </form>

      <div className="bg-white rounded-2xl shadow p-6">
        {calls?.length === 0 && (
          <p className="text-gray-500">No calls found.</p>
        )}

        {calls?.map((call) => (
          <div key={call.id} className="border rounded-xl p-4 mb-4">
            <p className="font-semibold">
              {call.customer_name || "Unknown caller"}
            </p>

            <p className="text-gray-500">
              Phone: {call.phone_number || "No phone number"}
            </p>

            <p className="text-gray-500">
              Duration: {call.duration || "N/A"}
            </p>

            <p className="text-gray-500 mt-2">
              {call.transcript || "No transcript yet."}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}