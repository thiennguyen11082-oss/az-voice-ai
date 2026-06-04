import { supabase } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();

  const fromNumber = formData.get("From")?.toString();
  const toNumber = formData.get("To")?.toString();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("twilio_phone", toNumber)
    .single();

  if (!business) {
    return new Response(
      `
<Response>
  <Say>
    This phone number is not configured.
  </Say>
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
    },
  ]);

  const greeting =
    settings?.greeting_message ||
    `Thank you for calling ${business.business_name}. Please leave a message after the beep.`;

  const twiml = `
<Response>
  <Say voice="alice">
    ${greeting}
  </Say>

  <Record
    maxLength="60"
    action="https://islands-these-gather-group.trycloudflare.com/api/twilio/recording"
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