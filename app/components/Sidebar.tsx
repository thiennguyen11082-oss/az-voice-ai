"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/app/lib/auth";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: "▣",
  },
  {
    href: "/calls",
    label: "Calls",
    icon: "☏",
  },
  {
    href: "/messages",
    label: "Voice Messages",
    icon: "☷",
  },
  {
    href: "/missed",
    label: "Missed Calls",
    icon: "☊",
  },
  {
    href: "/analytics",
    label: "Website Analytics",
    icon: "◔",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "⚙",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-black/70 border-r border-cyan-300/20 text-white px-3 py-5 backdrop-blur-md">
      <div className="mb-7 flex justify-center">
        <Link href="/" className="block">
          <Image
            src="/images/aloai-logo-new.png"
            alt="AloAI Logo"
            width={190}
            height={95}
            priority
            className="object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.9)]"
          />
        </Link>
      </div>

      <nav className="flex flex-col gap-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-full px-4 py-3 font-black transition shadow-lg
                ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-300 via-teal-400 to-cyan-500 text-slate-700"
                    : "bg-gradient-to-r from-cyan-300 to-blue-700 text-slate-700 hover:from-cyan-200 hover:to-blue-500"
                }
              `}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/35 text-lg text-cyan-950">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-35 flex flex-col items-start gap-3">
        <Link
          href="/help"
          className="w-28 rounded-full bg-white/90 px-3 py-1.5 text-center text-base font-semibold text-slate-700 shadow-md hover:bg-white"
        >
          Helps
        </Link>

        <Link
          href="/account"
          className="w-28 rounded-full bg-white/90 px-3 py-1.5 text-center text-base font-semibold text-slate-700 shadow-md hover:bg-white"
        >
          Accounts
        </Link>

        <button
          onClick={async () => {
            await authClient.auth.signOut();
            window.location.href = "/login";
          }}
          className="w-28 rounded-full bg-white/90 px-3 py-1.5 text-center text-base font-semibold text-slate-700 shadow-md hover:bg-red-100"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}