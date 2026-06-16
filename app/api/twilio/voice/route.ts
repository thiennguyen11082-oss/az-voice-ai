import { supabase } from "@/app/lib/supabase";

const BASE_URL = "https://institute-families-expand-touched.trycloudflare.com";

export async function POST(request: Request) {
  const formData = await request.formData();

  const fromNumber = formData.get("From")?.toString();
  const toNumber = formData.get("To")?.toString();
  const callSid = formData.get("CallSid")?.toString();

  // 1. Find the business by Twilio phone number
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("twilio_phone", toNumber)
    .single();

  if (!business) {
    return new Response(
      `
<Response>
  <Say voice="alice">This phone number is not configured.</Say>
</Response>
`,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
  }

  // 2. Load business settings
  const { data: settings } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", business.id)
    .single();

  const businessPlan = business.plan || "starter";
  const isStarterPlan = businessPlan === "starter";

  // 3. Decide real reception mode based on plan
  // Starter is always voicemail only, even if database says AI.
  const receptionMode = isStarterPlan
    ? "voicemail"
    : settings?.reception_mode || "ai";

  // 4. Save call as in progress first
  await supabase.from("calls").insert([
    {
      business_id: business.id,
      customer_name: "Phone Caller",
      phone_number: fromNumber,
      duration: "In Progress",
      transcript: "Call Started",
      call_sid: callSid,
      status: "in_progress",
      reviewed: false,
    },
  ]);

  // 5. Set default greetings
  const greeting =
    settings?.greeting ||
    `Thank you for calling ${business.business_name}. How can I help you today?`;

  const voicemailGreeting =
    settings?.voicemail_greeting ||
    `Thank you for calling ${business.business_name}. Please leave a message after the beep.`;

  // 6. Voicemail-only mode
  if (receptionMode === "voicemail") {
    const voicemailTwiml = `
<Response>
  <Say voice="alice">
    ${voicemailGreeting}
  </Say>

  <Record
    maxLength="60"
    action="${BASE_URL}/api/twilio/recording"
    method="POST"
  />

  <Say voice="alice">
    Thank you. Goodbye.
  </Say>
</Response>
`;

    return new Response(voicemailTwiml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }

  // 7. AI receptionist mode
  const aiTwiml = `
<Response>
  <Gather
    input="speech"
    action="${BASE_URL}/api/twilio/ai"
    method="POST"
    speechTimeout="2"
    timeout="6"
    language="en-US"
  >
    <Say voice="alice">
      ${greeting}
    </Say>
  </Gather>

  <Say voice="alice">
    I did not hear anything. Please leave a message after the beep.
  </Say>

  <Record
    maxLength="60"
    action="${BASE_URL}/api/twilio/recording"
    method="POST"
  />

  <Say voice="alice">
    Thank you. Goodbye.
  </Say>
</Response>
`;

  return new Response(aiTwiml, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}