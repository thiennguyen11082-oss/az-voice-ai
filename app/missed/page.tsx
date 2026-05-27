export default function MissedPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">

      <h1 className="text-4xl font-bold mb-6">
        Missed Calls
      </h1>

      <div className="bg-white rounded-2xl shadow p-6">

        <div className="border rounded-xl p-4 mb-4">
          <p className="font-semibold">
            Daniel Brown
          </p>

          <p className="text-gray-500">
            Missed at 10:42 AM
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="font-semibold">
            Emily Clark
          </p>

          <p className="text-gray-500">
            Missed at 2:15 PM
          </p>
        </div>

      </div>

    </main>
  );
}