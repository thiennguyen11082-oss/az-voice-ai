import OpenAI from "openai";
import { supabase } from "@/app/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BASE_URL = "https://institute-families-expand-touched.trycloudflare.com";

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function callerWantsToEnd(text: string) {
  const cleanText = text
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .trim();

  const endingPhrases = [
    "no",
    "no thanks",
    "no thank you",
    "nothing else",
    "that's all",
    "thats all",
    "that is all",
    "bye",
    "goodbye",
  ];

  return endingPhrases.some((phrase) => {
    return cleanText === phrase || cleanText.startsWith(phrase);
  });
}

function formatPhoneForSpeech(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return phone;

  return digits.split("").join(", ");
}

function makeNumbersSpeakable(text: string) {
  return text.replace(/\+?\d[\d\s().-]{6,}\d/g, (match) => {
    return formatPhoneForSpeech(match);
  });
}

async function createCallSummary(transcript: string) {
  const summaryResponse = await openai.responses.create({
    model: "gpt-5-mini",
    input: `
Create a short call summary for the business owner.

Rules:
- 1 to 2 sentences only.
- Mention what the caller wanted.
- Mention callback info if the caller gave name, phone, or service.
- Do not invent details.
- Keep it simple.

Call transcript:
${transcript}
`,
  });

  return (
    summaryResponse.output_text ||
    "Call completed. No clear summary available."
  );
}

function callerProvidedCallbackInfo(text: string) {
  const cleanText = text.toLowerCase();

  const hasName =
    cleanText.includes("my name is") ||
    cleanText.includes("this is") ||
    cleanText.includes("i am") ||
    cleanText.includes("i'm");

  const hasPhoneNumber = /\d{3,}/.test(cleanText);

  const hasReason =
    cleanText.includes("service") ||
    cleanText.includes("looking for") ||
    cleanText.includes("need") ||
    cleanText.includes("want") ||
    cleanText.includes("interested in") ||
    cleanText.includes("appointment") ||
    cleanText.includes("price") ||
    cleanText.includes("pricing");

  return hasName && (hasPhoneNumber || hasReason);
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const speechResult = formData.get("SpeechResult")?.toString() || "";
  const callSid = formData.get("CallSid")?.toString();
  const toNumber = formData.get("To")?.toString();

  const { data: currentCall } = await supabase
    .from("calls")
    .select("transcript")
    .eq("call_sid", callSid)
    .single();

  const oldTranscript = currentCall?.transcript || "Call Started";

  // 1. Find business by Twilio number
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("twilio_phone", toNumber)
    .single();

  if (!business) {
    return new Response(
      `<Response><Say voice="alice">Business not found.</Say><Hangup /></Response>`,
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
  const aiAllowed = businessPlan === "pro" || businessPlan === "business";

  // 3. Protect AI route from Starter plan
  if (!aiAllowed) {
    const voicemailGreeting =
      settings?.voicemail_greeting ||
      `Thank you for calling ${business.business_name}. Please leave a message after the beep.`;

    await supabase
      .from("calls")
      .update({
        status: "in_progress",
        duration: "Voicemail",
        transcript: `${oldTranscript}

System: AI route blocked because business is on Starter plan. Sent caller to voicemail.`,
      })
      .eq("call_sid", callSid);

    return new Response(
      `
<Response>
  <Say voice="alice">${escapeXml(voicemailGreeting)}</Say>

  <Record
    maxLength="60"
    action="${BASE_URL}/api/twilio/recording"
    method="POST"
  />

  <Say voice="alice">Thank you. Goodbye.</Say>
  <Hangup />
</Response>
`,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
  }

  // 4. If caller says nothing after AI already talked, complete the call
  if (!speechResult.trim()) {
    const finalTranscript = `${oldTranscript}

Customer: No response

AI: Thank you for calling. Goodbye.`;

    const summary = await createCallSummary(finalTranscript);

    await supabase
      .from("calls")
      .update({
        status: "completed",
        duration: "Completed",
        transcript: finalTranscript,
        summary: summary,
      })
      .eq("call_sid", callSid);

    return new Response(
      `
<Response>
  <Say voice="alice">Thank you for calling. Goodbye.</Say>
  <Hangup />
</Response>
`,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
  }

  // 5. End call if caller is done
  if (callerWantsToEnd(speechResult)) {
    const finalTranscript = `${oldTranscript}

Customer: ${speechResult}

AI: Thank you for calling. Have a great day.`;

    const summary = await createCallSummary(finalTranscript);

    await supabase
      .from("calls")
      .update({
        status: "completed",
        duration: "Completed",
        transcript: finalTranscript,
        summary: summary,
      })
      .eq("call_sid", callSid);

    return new Response(
      `
<Response>
  <Say voice="alice">Thank you for calling. Have a great day.</Say>
  <Hangup />
</Response>
`,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
  }

  // 6. If caller already gave callback info, confirm and continue
  if (callerProvidedCallbackInfo(speechResult)) {
    const updatedTranscript = `${oldTranscript}

Customer: ${speechResult}

AI: Thank you. I will pass this information to the business, and someone will check and call you back. Is there anything else I can help you with?`;

    await supabase
      .from("calls")
      .update({
        status: "in_progress",
        duration: "Needs Follow Up",
        transcript: updatedTranscript,
        reviewed: false,
      })
      .eq("call_sid", callSid);

    return new Response(
      `
<Response>
  <Gather
    input="speech"
    action="${BASE_URL}/api/twilio/ai"
    method="POST"
    speechTimeout="3"
    timeout="10"
    actionOnEmptyResult="true"
    language="en-US"
  >
    <Say voice="alice">
      Thank you. I will pass this information to the business, and someone will check and call you back. Is there anything else I can help you with?
    </Say>
  </Gather>

  <Say voice="alice">Thank you for calling. Goodbye.</Say>
  <Hangup />
</Response>
`,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
  }

  const businessPhoneForSpeech = formatPhoneForSpeech(
    settings?.business_phone || ""
  );

  const updatedTranscriptBeforeAI = `${oldTranscript}

Customer: ${speechResult}`;

  // 7. AI receptionist rules
  const aiResponse = await openai.responses.create({
    model: "gpt-5-mini",
    input: `
You are an AI receptionist for ${settings?.business_name || business.business_name}.

Your job:
- Answer customer questions using ONLY the business information below.
- Keep every answer short, simple, and natural.
- Do not repeat yourself.
- Do not make up prices, services, policies, availability, or details.
- If the customer asks about a price and the price is not clearly listed, do not guess.
- If you are unsure, say you are not sure and ask for the caller's name, phone number, and reason for calling so the business can call them back.
- If you ask for callback information, stop there. Do not also ask "anything else?"
- If the customer gives their name, phone number, or reason for calling, thank them and say someone will call them back.
- If the customer asks for something outside the business information, collect callback information.
- Sound like a real receptionist, not a robot.
- Do not say the same sentence again and again.
- Do not end every response the exact same way.
- If you say the business phone number, say it digit by digit.
- Use this spoken phone format when needed: ${businessPhoneForSpeech}

Business information:
Business name: ${settings?.business_name || business.business_name}
Business phone: ${settings?.business_phone || "Not provided"}
Business phone spoken format: ${businessPhoneForSpeech || "Not provided"}
Business hours: ${settings?.business_hours || "Not provided"}
Services: ${settings?.services || "Not provided"}
FAQs: ${settings?.faqs || "Not provided"}

Customer said:
${speechResult}

Reply with only what the receptionist should say.
`,
  });

  const reply =
    aiResponse.output_text ||
    "I am not sure about that. May I get your name, phone number, and reason for calling so someone can call you back?";

  const updatedTranscriptAfterAI = `${updatedTranscriptBeforeAI}

AI: ${reply}`;

  // 8. Save transcript
  await supabase
    .from("calls")
    .update({
      transcript: updatedTranscriptAfterAI,
    })
    .eq("call_sid", callSid);

  const spokenReply = makeNumbersSpeakable(reply);

  // 9. Listen again
  const twiml = `
<Response>
  <Gather
    input="speech"
    action="${BASE_URL}/api/twilio/ai"
    method="POST"
    speechTimeout="3"
    timeout="10"
    actionOnEmptyResult="true"
    language="en-US"
  >
    <Say voice="alice">${escapeXml(spokenReply)}</Say>
  </Gather>

  <Say voice="alice">Thank you for calling. Goodbye.</Say>
  <Hangup />
</Response>
`;

  return new Response(twiml, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}