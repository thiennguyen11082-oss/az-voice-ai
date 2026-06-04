"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const publicPages = ["/login", "/signup"];
      const currentPath = window.location.pathname;

      if (publicPages.includes(currentPath)) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await authClient.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return <p className="p-8 text-gray-900">Checking login...</p>;
  }

  return <>{children}</>;
}