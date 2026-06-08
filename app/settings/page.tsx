"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth";
import { getCurrentBusinessId } from "@/app/lib/getBusiness";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      const businessId = await getCurrentBusinessId();

      if (!businessId) return;

      const { data } = await authClient
        .from("business_settings")
        .select("*")
        .eq("business_id", businessId)
        .single();

      setSettings(data);
    }

    loadSettings();
  }, []);

  async function saveSettings() {
    if (!settings) return;

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
        reception_mode: settings.reception_mode,
      })
      .eq("business_id", settings.business_id);

    alert("Settings saved.");
  }

  if (!settings) {
    return <main className="p-8 text-gray-900">Loading settings...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Business Settings</h1>

      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
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
            className="w-full border rounded-xl p-3"
            value={settings.reception_mode || "ai"}
            onChange={(e) =>
              setSettings({ ...settings, reception_mode: e.target.value })
            }
          >
            <option value="ai">AI Receptionist</option>
            <option value="voicemail">Voicemail Only</option>
          </select>
        </div>      
        <div>
          <label className="block mb-2 font-semibold">AI Greeting</label>
          <textarea
            className="w-full border rounded-xl p-3"
            value={settings.greeting || ""}
            onChange={(e) =>
              setSettings({ ...settings, greeting: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Voicemail Greeting
          </label>

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
            className="w-full border rounded-xl p-3"
            value={settings.business_hours || ""}
            onChange={(e) =>
              setSettings({ ...settings, business_hours: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Services</label>
          <textarea
            className="w-full border rounded-xl p-3"
            value={settings.services || ""}
            onChange={(e) =>
              setSettings({ ...settings, services: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">FAQs</label>
          <textarea
            className="w-full border rounded-xl p-3"
            value={settings.faqs || ""}
            onChange={(e) =>
              setSettings({ ...settings, faqs: e.target.value })
            }
          />
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