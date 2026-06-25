import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import RequireAuth from "@/app/components/RequireAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AloAI",
  description: "AI Business Receptionist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-white">
        <div
          className="min-h-screen bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('/images/dashboard-bg.png')",
          }}
        >
          <div className="min-h-screen bg-black/35 backdrop-blur-[1px]">
            <div className="flex min-h-screen">
              <Sidebar />

              <main className="flex-1 min-w-0">
                <RequireAuth>{children}</RequireAuth>
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}