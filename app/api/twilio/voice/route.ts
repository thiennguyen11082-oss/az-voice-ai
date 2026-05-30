import { supabase } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();

  const phoneNumber = formData.get("From")?.toString();

  await supabase
    .from("calls")
    .insert([
      {
        customer_name: "Phone Caller",
        phone_number: phoneNumber,
        duration: "In progress",
        transcript: "Call started",
      },
    ]);

  const twiml = `
<Response>
  <Say voice="alice">
    Hello. Thank you for calling NextGen AI.
    Please leave a message after the beep.
  </Say>

  <Record
    maxLength="60"
    transcribe="true"
    transcribeCallback="https://lay-prairie-tuesday-boot.trycloudflare.com/api/twilio/recording"
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