"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await authClient.auth.getUser();

      setUser(user);
    }

    loadUser();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-6">
        User Profile
      </h1>

      {user ? (
        <div>
          <p>Email: {user.email}</p>
          <p>User ID: {user.id}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
}