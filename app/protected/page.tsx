"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await authClient.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return <p className="p-8">Checking login...</p>;
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">
        Protected Page
      </h1>
    </main>
  );
}