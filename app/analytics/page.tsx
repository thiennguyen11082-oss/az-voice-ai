export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">

      <h1 className="text-4xl font-bold mb-6">
        Website Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">
            Visitors Today
          </p>

          <h2 className="text-4xl font-bold mt-2">
            284
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">
            Weekly Visitors
          </p>

          <h2 className="text-4xl font-bold mt-2">
            1,842
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">
            Monthly Visitors
          </p>

          <h2 className="text-4xl font-bold mt-2">
            8,923
          </h2>
        </div>

      </div>

    </main>
  );
}