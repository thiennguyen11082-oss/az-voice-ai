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
    return new Response("Business not found", { status: 404 });
  }

  await supabase.from("missed_calls").insert([
    {
      business_id: business.id,
      customer_name: "Unknown Caller",
      phone_number: fromNumber,
      reason: "Caller hung up before leaving voicemail",
    },
  ]);

  const twiml = `
<Response>
  <Say>Thank you for calling. Goodbye.</Say>
</Response>
`;

  return new Response(twiml, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}