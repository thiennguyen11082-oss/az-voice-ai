import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-black text-white p-6 min-h-screen">

      <h1 className="text-3xl font-bold mb-10">
        NextGenAI
      </h1>

      <nav className="flex flex-col gap-3">

        <Link
          href="/"
          className="bg-white text-black rounded-xl px-4 py-3 font-medium"
        >
          Dashboard
        </Link>

        <Link
          href="/calls"
          className="px-4 py-3 rounded-xl hover:bg-gray-800 transition"
        >
          Calls
        </Link>

        <Link
          href="/messages"
          className="px-4 py-3 rounded-xl hover:bg-gray-800 transition"
        >
          Voice Messages
        </Link>

        <Link
          href="/missed"
          className="px-4 py-3 rounded-xl hover:bg-gray-800 transition"
        >
          Missed Calls
        </Link>

        <Link
          href="/analytics"
          className="px-4 py-3 rounded-xl hover:bg-gray-800 transition"
        >
          Website Analytics
        </Link>

        <Link
          href="/settings"
          className="px-4 py-3 rounded-xl hover:bg-gray-800 transition"
        >
          Settings
        </Link>

      </nav>

    </aside>
  );
}