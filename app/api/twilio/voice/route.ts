import { supabase } from "@/app/lib/supabase";

const BASE_URL = "https://spoken-like-writing-amsterdam.trycloudflare.com";

export async function POST(request: Request) {
  const formData = await request.formData();

  const fromNumber = formData.get("From")?.toString();
  const toNumber = formData.get("To")?.toString();
  const callSid = formData.get("CallSid")?.toString();

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

  const { data: settings } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", business.id)
    .single();

  await supabase.from("calls").insert([
    {
      business_id: business.id,
      customer_name: "Phone Caller",
      phone_number: fromNumber,
      duration: "In Progress",
      transcript: "Call Started",
      call_sid: callSid,
      status: "in_progress",
    },
  ]);

  const greeting =
    settings?.greeting ||
    `Thank you for calling ${business.business_name}. How can I help you today?`;
  if (settings?.reception_mode === "voicemail") {
  const voicemailTwiml = `
<Response>
  <Say voice="alice">
    ${settings?.voicemail_greeting || greeting}
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
  const twiml = `
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

  return new Response(twiml, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}