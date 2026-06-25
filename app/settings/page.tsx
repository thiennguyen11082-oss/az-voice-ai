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
    return (
      <main className="min-h-screen p-8 text-white">
        <div className="rounded-[28px] border-4 border-black bg-cyan-100/70 p-6 text-black shadow-2xl backdrop-blur-md">
          Loading settings...
        </div>
      </main>
    );
  }

  const isStarterPlan = business.plan === "starter";
  const isProPlan = business.plan === "pro";
  const isBusinessPlan = business.plan === "business";

  function getPlanLabel() {
    if (isProPlan) return "PRO";
    if (isBusinessPlan) return "BUSINESS";
    return "STARTER";
  }

  function getPlanTextColor() {
    if (isProPlan) return "text-green-600";
    if (isBusinessPlan) return "text-blue-600";
    return "text-orange-500";
  }

  function inputClass(disabled = false) {
    return `w-full rounded-[22px] border-4 border-black bg-white/80 px-5 py-3 text-lg text-black outline-none backdrop-blur-md placeholder:text-slate-600 ${
      disabled ? "cursor-not-allowed opacity-60" : ""
    }`;
  }

  function textareaClass(disabled = false) {
    return `min-h-28 w-full rounded-[22px] border-4 border-black bg-white/80 px-5 py-3 text-lg text-black outline-none backdrop-blur-md placeholder:text-slate-600 ${
      disabled ? "cursor-not-allowed opacity-60" : ""
    }`;
  }

  return (
    <main className="min-h-screen text-white">
      <div className="bg-black/45 px-5 py-5 backdrop-blur-sm">
        <h1 className="text-5xl font-black tracking-wide text-cyan-50 drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]">
          Business Settings
        </h1>
      </div>

      <div className="px-5 py-5">
        <div className="mb-5 rounded-[28px] border-4 border-black bg-cyan-100/70 p-6 text-black shadow-2xl backdrop-blur-md">
          <p className="text-2xl font-black">Current Plan</p>

          <h2
            className={`mt-2 text-5xl font-black tracking-widest ${getPlanTextColor()}`}
          >
            {getPlanLabel()}
          </h2>

          {isStarterPlan && (
            <p className="mt-3 text-lg font-semibold text-orange-600">
              Starter plan is voicemail-only. Upgrade to Pro to use AI
              Receptionist.
            </p>
          )}

          {isProPlan && (
            <p className="mt-3 text-lg font-semibold text-green-600">
              Pro plan includes AI Receptionist.
            </p>
          )}

          {isBusinessPlan && (
            <p className="mt-3 text-lg font-semibold text-blue-600">
              Business plan will include menu system, appointment booking, call
              forwarding, and SMS notifications.
            </p>
          )}
        </div>

        <div className="rounded-[28px] border-4 border-black bg-cyan-300/70 p-6 text-black shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-2xl font-black">
                Business Name
              </label>

              <input
                className={inputClass()}
                value={settings.business_name || ""}
                onChange={(e) =>
                  setSettings({ ...settings, business_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-2xl font-black">
                Business Phone
              </label>

              <input
                className={inputClass()}
                value={settings.business_phone || ""}
                onChange={(e) =>
                  setSettings({ ...settings, business_phone: e.target.value })
                }
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-2xl font-black">
                Reception Mode
              </label>

              <select
                className={inputClass(isStarterPlan)}
                value={
                  isStarterPlan ? "voicemail" : settings.reception_mode || "ai"
                }
                disabled={isStarterPlan}
                onChange={(e) =>
                  setSettings({ ...settings, reception_mode: e.target.value })
                }
              >
                {!isStarterPlan && (
                  <option value="ai">AI Receptionist</option>
                )}
                <option value="voicemail">Voicemail Only</option>
              </select>

              {isStarterPlan && (
                <p className="mt-2 text-lg font-semibold text-slate-700">
                  AI Receptionist is locked on Starter plan.
                </p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-2xl font-black">
                AI Greeting
              </label>

              <textarea
                className={textareaClass(isStarterPlan)}
                disabled={isStarterPlan}
                value={settings.greeting || ""}
                onChange={(e) =>
                  setSettings({ ...settings, greeting: e.target.value })
                }
              />

              {isStarterPlan && (
                <p className="mt-2 text-lg font-semibold text-slate-700">
                  AI Greeting is available on Pro plan.
                </p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-2xl font-black">
                Voicemail Greeting
              </label>

              <textarea
                className={textareaClass()}
                value={settings.voicemail_greeting || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    voicemail_greeting: e.target.value,
                  })
                }
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-2xl font-black">
                Business Hours
              </label>

              <textarea
                className={textareaClass(isStarterPlan)}
                disabled={isStarterPlan}
                value={settings.business_hours || ""}
                onChange={(e) =>
                  setSettings({ ...settings, business_hours: e.target.value })
                }
              />

              {isStarterPlan && (
                <p className="mt-2 text-lg font-semibold text-slate-700">
                  Business Hours for AI answers are available on Pro plan.
                </p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-2xl font-black">
                Services
              </label>

              <textarea
                className={textareaClass(isStarterPlan)}
                disabled={isStarterPlan}
                value={settings.services || ""}
                onChange={(e) =>
                  setSettings({ ...settings, services: e.target.value })
                }
              />

              {isStarterPlan && (
                <p className="mt-2 text-lg font-semibold text-slate-700">
                  Services for AI answers are available on Pro plan.
                </p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-2xl font-black">FAQs</label>

              <textarea
                className={textareaClass(isStarterPlan)}
                disabled={isStarterPlan}
                value={settings.faqs || ""}
                onChange={(e) =>
                  setSettings({ ...settings, faqs: e.target.value })
                }
              />

              {isStarterPlan && (
                <p className="mt-2 text-lg font-semibold text-slate-700">
                  FAQs for AI answers are available on Pro plan.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSettings}
              className="rounded-full border-4 border-black bg-blue-100/95 px-8 py-3 text-xl font-black text-black shadow-lg hover:bg-cyan-200"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}