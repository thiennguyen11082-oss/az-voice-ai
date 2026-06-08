import OpenAI from "openai";
import { supabase } from "@/app/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BASE_URL = "https://spoken-like-writing-amsterdam.trycloudflare.com";

export async function POST(request: Request) {
  const formData = await request.formData();

  const speechResult = formData.get("SpeechResult")?.toString() || "";
  const callSid = formData.get("CallSid")?.toString();
  const toNumber = formData.get("To")?.toString();
  const lowerSpeech = speechResult.toLowerCase();

  const { data: currentCall } = await supabase
    .from("calls")
    .select("transcript")
    .eq("call_sid", callSid)
    .single();

  const oldTranscript = currentCall?.transcript || "Call Started";

  if (
    lowerSpeech.includes("no") ||
    lowerSpeech.includes("no thanks") ||
    lowerSpeech.includes("nothing else") ||
    lowerSpeech.includes("that's all") ||
    lowerSpeech.includes("that is all") ||
    lowerSpeech.includes("bye")
  ) {
    const finalTranscript = `${oldTranscript}

Customer: ${speechResult || "No response"}

AI: Thank you for calling. Have a great day.`;

    await supabase
      .from("calls")
      .update({
        status: "completed",
        duration: "Completed",
        transcript: finalTranscript,
      })
      .eq("call_sid", callSid);

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

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("twilio_phone", toNumber)
    .single();

  if (!business) {
    return new Response(
      `<Response><Say voice="alice">Business not found.</Say></Response>`,
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

  const updatedTranscriptBeforeAI = `${oldTranscript}

Customer: ${speechResult || "No response"}`;

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

Rules:
- Answer briefly.
- Sound like a real receptionist.
- Do not make up prices or services.
- If you do not know, ask for their name and phone number so the business can call back.
- End every answer with: "Would you like help with anything else?"
    `,
  });

  const reply = aiResponse.output_text;

  const updatedTranscriptAfterAI = `${updatedTranscriptBeforeAI}

AI: ${reply}`;

  await supabase
    .from("calls")
    .update({
      transcript: updatedTranscriptAfterAI,
    })
    .eq("call_sid", callSid);
    
  const twiml = `
<Response>
  <Say voice="alice">${reply}</Say>

  <Gather
    input="speech"
    action="${BASE_URL}/api/twilio/ai"
    method="POST"
    speechTimeout="2"
    timeout="6"
    language="en-US"
  >
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