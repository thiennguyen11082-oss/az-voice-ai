export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">

      <h1 className="text-4xl font-bold mb-6">
        Settings
      </h1>

      <div className="bg-white rounded-2xl shadow p-6">

        <div className="mb-6">
          <label className="block mb-2 font-semibold">
            Business Name
          </label>

          <input
            className="w-full border rounded-xl p-3"
            placeholder="AZ Voice AI"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Business Phone
          </label>

          <input
            className="w-full border rounded-xl p-3"
            placeholder="+1 623 999 6330"
          />
        </div>

      </div>

    </main>
  );
}