export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">

      <h1 className="text-4xl font-bold mb-6">
        Voice Messages
      </h1>

      <div className="bg-white rounded-2xl shadow p-6">

        <div className="border rounded-xl p-4 mb-4">
          <p className="font-semibold">
            Mike Wilson
          </p>

          <p className="text-gray-500 mt-2">
            "Hi, I want to know your business hours and pricing."
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="font-semibold">
            Amanda Lee
          </p>

          <p className="text-gray-500 mt-2">
            "Please call me back regarding website setup."
          </p>
        </div>

      </div>

    </main>
  );
}