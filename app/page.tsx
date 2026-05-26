export default function AIBusinessCallAssistant() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">AZ Voice AI</h1>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition">
            Start Free Trial
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Never Miss Another Customer Call
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            AI answers missed calls, responds to texts, books appointments,
            and follows up with customers automatically.
          </p>

          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg hover:bg-blue-700 transition">
              Get Started
            </button>

            <button className="border border-gray-300 px-6 py-3 rounded-2xl text-lg hover:bg-gray-100 transition">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Demo Dashboard */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Live Dashboard</h3>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              AI Online
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <p className="text-sm text-gray-500">Calls Answered</p>
              <h4 className="text-3xl font-bold">42</h4>
            </div>

            <div className="bg-red-50 p-4 rounded-2xl">
              <p className="text-sm text-gray-500">Missed Calls Saved</p>
              <h4 className="text-3xl font-bold">18</h4>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded-2xl p-4">
              <div className="flex justify-between mb-2">
                <p className="font-semibold">John Martinez</p>
                <p className="text-sm text-gray-500">2 min ago</p>
              </div>
              <p className="text-gray-600 text-sm">
                AI booked estimate for roofing repair.
              </p>
            </div>

            <div className="border rounded-2xl p-4">
              <div className="flex justify-between mb-2">
                <p className="font-semibold">Sarah Nguyen</p>
                <p className="text-sm text-gray-500">11 min ago</p>
              </div>
              <p className="text-gray-600 text-sm">
                AI responded to missed call and scheduled nail appointment.
              </p>
            </div>

            <div className="border rounded-2xl p-4">
              <div className="flex justify-between mb-2">
                <p className="font-semibold">Mike Johnson</p>
                <p className="text-sm text-gray-500">20 min ago</p>
              </div>
              <p className="text-gray-600 text-sm">
                Customer asked for towing quote via text.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-14">
            Features Built For Local Businesses
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-3xl border">
              <h4 className="text-2xl font-semibold mb-4">AI Phone Answering</h4>
              <p className="text-gray-600">
                AI answers customer calls 24/7 and collects customer details.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-3xl border">
              <h4 className="text-2xl font-semibold mb-4">Missed Call Recovery</h4>
              <p className="text-gray-600">
                Automatically text missed callers so businesses never lose leads.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-3xl border">
              <h4 className="text-2xl font-semibold mb-4">Smart Text Replies</h4>
              <p className="text-gray-600">
                AI replies to customer questions and books appointments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold mb-10">Simple Pricing</h3>

          <div className="bg-white rounded-3xl shadow-xl p-10 border inline-block">
            <p className="text-gray-500 mb-2">Starter Plan</p>
            <h4 className="text-6xl font-bold mb-4">$49<span className="text-2xl">/mo</span></h4>

            <ul className="space-y-3 text-left mb-8">
              <li>✔ AI call answering</li>
              <li>✔ Missed call text-back</li>
              <li>✔ Appointment booking</li>
              <li>✔ Customer dashboard</li>
            </ul>

            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl text-lg hover:bg-blue-700 transition">
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 text-center">
        <p>© 2026 AZ Voice AI — Built for Local Businesses</p>
      </footer>
    </div>
  );
}
