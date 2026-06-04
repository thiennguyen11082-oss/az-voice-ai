"use client";

import { useState } from "react";
import { authClient } from "@/app/lib/auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  async function handleSignup() {
    const { data, error } = await authClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      alert("Account created, but user not found.");
      return;
    }

    const { data: business } = await authClient
      .from("businesses")
      .insert([
        {
          business_name: businessName,
          business_phone: businessPhone,
        },
      ])
      .select()
      .single();

    if (!business) {
      alert("Business creation failed.");
      return;
    }

    await authClient.from("user_businesses").insert([
      {
        user_id: user.id,
        business_id: business.id,
      },
    ]);

    await authClient.from("business_settings").insert([
      {
        business_id: business.id,
        business_name: businessName,
        business_phone: businessPhone,
        greeting: `Thank you for calling ${businessName}. How can I help you today?`,
        business_hours: "",
        services: "",
        faqs: "",
      },
    ]);

    alert("Account and business created successfully.");
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">
          Sign Up
        </h1>

        <input
          type="text"
          placeholder="Business Name"
          className="w-full border rounded-xl p-3 mb-4"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Business Phone"
          className="w-full border rounded-xl p-3 mb-4"
          value={businessPhone}
          onChange={(e) => setBusinessPhone(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-xl p-3 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-xl p-3 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full bg-black text-white rounded-xl p-3"
        >
          Create Account
        </button>
      </div>
    </main>
  );
}