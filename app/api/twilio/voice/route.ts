import { supabase } from "@/app/lib/supabase";

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
  <Say>This phone number is not configured.</Say>
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
    `Thank you for calling ${business.business_name}. Please leave a message after the beep.`;

  const twiml = `
<Response>
  <Gather
  input="speech"
  action="https://quad-twist-converted-canberra.trycloudflare.com/api/twilio/ai"
  method="POST"
  speechTimeout="auto"
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
  action="https://quad-twist-converted-canberra.trycloudflare.com/api/twilio/recording"
  method="POST"
/>

  <Say>
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