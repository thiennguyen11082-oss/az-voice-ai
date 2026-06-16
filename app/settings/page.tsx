"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      const businessId = await getCurrentBusinessId();

      if (!businessId) return;

      const { data: businessData } = await authClient
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      setBusiness(businessData);

      const { data: settingsData } = await authClient
        .from("business_settings")
        .select("*")
        .eq("business_id", businessId)
        .single();

      if (businessData?.plan === "starter") {
        setSettings({
          ...settingsData,
          reception_mode: "voicemail",
        });
      } else {
        setSettings(settingsData);
      }
    }

    loadSettings();
  }, []);

  async function saveSettings() {
    if (!settings) return;

    const isStarterPlan = business?.plan === "starter";

    await authClient
      .from("business_settings")
      .update({
        business_name: settings.business_name,
        business_phone: settings.business_phone,
        greeting: settings.greeting,
        voicemail_greeting: settings.voicemail_greeting,
        business_hours: settings.business_hours,
        services: settings.services,
        faqs: settings.faqs,
        reception_mode: isStarterPlan ? "voicemail" : settings.reception_mode,
      })
      .eq("business_id", settings.business_id);

    alert("Settings saved.");
  }

  if (!settings || !business) {
    return <main className="p-8 text-gray-900">Loading settings...</main>;
  }

  const isStarterPlan = business.plan === "starter";
  const isProPlan = business.plan === "pro";
  const isBusinessPlan = business.plan === "business";

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Business Settings</h1>

      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <div className="bg-gray-50 border rounded-xl p-4">
          <p className="font-semibold">Current Plan</p>

          <p className="text-gray-600 capitalize">
            {business.plan || "starter"}
          </p>

          {isStarterPlan && (
            <p className="text-sm text-orange-600 mt-2">
              Starter plan is voicemail-only. Upgrade to Pro to use AI Receptionist.
            </p>
          )}

          {isProPlan && (
            <p className="text-sm text-green-600 mt-2">
              Pro plan includes AI Receptionist.
            </p>
          )}

          {isBusinessPlan && (
            <p className="text-sm text-blue-600 mt-2">
              Business plan will include menu system, appointment booking, call forwarding, and SMS notifications.
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-semibold">Business Name</label>
          <input
            className="w-full border rounded-xl p-3"
            value={settings.business_name || ""}
            onChange={(e) =>
              setSettings({ ...settings, business_name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Business Phone</label>
          <input
            className="w-full border rounded-xl p-3"
            value={settings.business_phone || ""}
            onChange={(e) =>
              setSettings({ ...settings, business_phone: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Reception Mode</label>

          <select
            className={`w-full border rounded-xl p-3 ${
              isStarterPlan ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
            }`}
            value={isStarterPlan ? "voicemail" : settings.reception_mode || "ai"}
            disabled={isStarterPlan}
            onChange={(e) =>
              setSettings({ ...settings, reception_mode: e.target.value })
            }
          >
            {!isStarterPlan && <option value="ai">AI Receptionist</option>}
            <option value="voicemail">Voicemail Only</option>
          </select>

          {isStarterPlan && (
            <p className="text-sm text-gray-500 mt-2">
              AI Receptionist is locked on Starter plan.
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-semibold">AI Greeting</label>
          <textarea
            className={`w-full border rounded-xl p-3 ${
              isStarterPlan ? "bg-gray-100 text-gray-500" : ""
            }`}
            disabled={isStarterPlan}
            value={settings.greeting || ""}
            onChange={(e) =>
              setSettings({ ...settings, greeting: e.target.value })
            }
          />

          {isStarterPlan && (
            <p className="text-sm text-gray-500 mt-2">
              AI Greeting is available on Pro plan.
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-semibold">Voicemail Greeting</label>

          <textarea
            className="w-full border rounded-xl p-3"
            value={settings.voicemail_greeting || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                voicemail_greeting: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Business Hours</label>
          <textarea
            className={`w-full border rounded-xl p-3 ${
              isStarterPlan ? "bg-gray-100 text-gray-500" : ""
            }`}
            disabled={isStarterPlan}
            value={settings.business_hours || ""}
            onChange={(e) =>
              setSettings({ ...settings, business_hours: e.target.value })
            }
          />

          {isStarterPlan && (
            <p className="text-sm text-gray-500 mt-2">
              Business Hours for AI answers are available on Pro plan.
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-semibold">Services</label>
          <textarea
            className={`w-full border rounded-xl p-3 ${
              isStarterPlan ? "bg-gray-100 text-gray-500" : ""
            }`}
            disabled={isStarterPlan}
            value={settings.services || ""}
            onChange={(e) =>
              setSettings({ ...settings, services: e.target.value })
            }
          />

          {isStarterPlan && (
            <p className="text-sm text-gray-500 mt-2">
              Services for AI answers are available on Pro plan.
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-semibold">FAQs</label>
          <textarea
            className={`w-full border rounded-xl p-3 ${
              isStarterPlan ? "bg-gray-100 text-gray-500" : ""
            }`}
            disabled={isStarterPlan}
            value={settings.faqs || ""}
            onChange={(e) =>
              setSettings({ ...settings, faqs: e.target.value })
            }
          />

          {isStarterPlan && (
            <p className="text-sm text-gray-500 mt-2">
              FAQs for AI answers are available on Pro plan.
            </p>
          )}
        </div>

        <button
          onClick={saveSettings}
          className="bg-black text-white rounded-xl px-6 py-3"
        >
          Save Settings
        </button>
      </div>
    </main>
  );
}