import OpenAI from "openai";
import { supabase } from "@/app/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const formData = await request.formData();

  const speechResult = formData.get("SpeechResult")?.toString();
  const lowerSpeech = speechResult?.toLowerCase() || "";

if (
  lowerSpeech.includes("no") ||
  lowerSpeech.includes("no thanks") ||
  lowerSpeech.includes("nothing else") ||
  lowerSpeech.includes("that's all")
) {
    await supabase
  .from("calls")
  .update({
    status: "completed",
    duration: "Completed",
    transcript: "AI receptionist call completed.",
  })
  .eq("call_sid", formData.get("CallSid")?.toString());
  return new Response(
    `
<Response>
  <Say voice="alice">Thank you for calling. Have a great day.</Say>
</Response>
`,
    {
      headers: {
        "Content-Type": "text/xml",
      },
    }
  );
}
  const toNumber = formData.get("To")?.toString();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("twilio_phone", toNumber)
    .single();

  if (!business) {
    return new Response(
      `<Response><Say>Business not found.</Say></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  const { data: settings } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", business.id)
    .single();

  const aiResponse = await openai.responses.create({
    model: "gpt-5-mini",
    input: `
You are a helpful AI receptionist for this business.

Business name: ${settings?.business_name || business.business_name}
Business phone: ${settings?.business_phone || ""}
Business hours: ${settings?.business_hours || ""}
Services: ${settings?.services || ""}
FAQs: ${settings?.faqs || ""}

Customer said:
${speechResult || "No response"}

Answer briefly like a real receptionist.
End by asking: "Would you like help with anything else?"
    `,
  });

  const reply = aiResponse.output_text;

  const twiml = `
<Response>
  <Say voice="alice">${reply}</Say>
  <Gather input="speech" action="/api/twilio/ai" method="POST" speechTimeout="auto">
    <Say voice="alice">You can ask another question now.</Say>
  </Gather>
  <Say voice="alice">Thank you for calling. Goodbye.</Say>
</Response>
`;

  return new Response(twiml, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}