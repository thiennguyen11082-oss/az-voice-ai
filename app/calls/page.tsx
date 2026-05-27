export default function CallsPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">

      <h1 className="text-4xl font-bold mb-6">
        Calls
      </h1>

      <div className="bg-white rounded-2xl shadow p-6">

        <div className="border rounded-xl p-4 mb-4">
          <p className="font-semibold">
            John Smith
          </p>

          <p className="text-gray-500">
            Duration: 3m 24s
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="font-semibold">
            Sarah Johnson
          </p>

          <p className="text-gray-500">
            Duration: 1m 12s
          </p>
        </div>

      </div>

    </main>
  );
}