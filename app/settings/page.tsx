import { supabase } from "@/app/lib/supabase";
import { revalidatePath } from "next/cache";

async function saveSettings(formData: FormData) {
  "use server";

  const id = formData.get("id");

  await supabase
    .from("business_settings")
    .update({
      business_name: formData.get("business_name"),
      business_phone: formData.get("business_phone"),
      greeting: formData.get("greeting"),
      business_hours: formData.get("business_hours"),
      services: formData.get("services"),
      faqs: formData.get("faqs"),
    })
    .eq("id", id);

  revalidatePath("/settings");
}

export default async function SettingsPage() {
  const { data: settings } = await supabase
    .from("business_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  const current = settings?.[0];

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Business Settings</h1>

      <form
        action={saveSettings}
        className="bg-white rounded-2xl shadow p-6 space-y-6"
      >
        <input type="hidden" name="id" value={current?.id || ""} />

        <div>
          <label className="block mb-2 font-semibold">Business Name</label>
          <input
            name="business_name"
            className="w-full border rounded-xl p-3"
            defaultValue={current?.business_name || ""}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Business Phone</label>
          <input
            name="business_phone"
            className="w-full border rounded-xl p-3"
            defaultValue={current?.business_phone || ""}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">AI Greeting</label>
          <textarea
            name="greeting"
            className="w-full border rounded-xl p-3"
            defaultValue={current?.greeting || ""}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Business Hours</label>
          <textarea
            name="business_hours"
            className="w-full border rounded-xl p-3"
            defaultValue={current?.business_hours || ""}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Services</label>
          <textarea
            name="services"
            className="w-full border rounded-xl p-3"
            defaultValue={current?.services || ""}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">FAQs</label>
          <textarea
            name="faqs"
            className="w-full border rounded-xl p-3"
            defaultValue={current?.faqs || ""}
          />
        </div>

        <button className="bg-black text-white rounded-xl px-6 py-3">
          Save Settings
        </button>
      </form>
    </main>
  );
}