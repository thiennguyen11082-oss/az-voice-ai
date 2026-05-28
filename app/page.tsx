import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">

      {/* Sidebar */}
      

      {/* Main Content */}
      <section className="flex-1 p-8">

        <h2 className="text-4xl font-bold mb-2">
          Dashboard
        </h2>

        <p className="text-gray-500 mb-10">
          AI Business Receptionist Overview
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 mb-2">
              Total Calls
            </p>

            <h2 className="text-4xl font-bold">
              124
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 mb-2">
              Missed Calls
            </p>

            <h2 className="text-4xl font-bold text-red-500">
              9
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 mb-2">
              Voice Messages
            </p>

            <h2 className="text-4xl font-bold text-blue-500">
              31
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 mb-2">
              Website Visitors
            </p>

            <h2 className="text-4xl font-bold text-green-500">
              1,284
            </h2>
          </div>

        </div>

        {/* Recent Calls */}
        <div className="bg-white rounded-2xl shadow p-6 mt-10">

          <h2 className="text-2xl font-bold mb-6">
            Recent Calls
          </h2>

          <div className="space-y-4">

            <div className="border rounded-xl p-4">
              <p className="font-semibold">
                John Smith
              </p>

              <p className="text-gray-500">
                Asked about website pricing.
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="font-semibold">
                Sarah Johnson
              </p>

              <p className="text-gray-500">
                Missed call — voicemail converted to text.
              </p>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}