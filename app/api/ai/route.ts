import OpenAI from "openai";
import { supabase } from "@/app/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  const businessId = Number(
    new URL(request.url).searchParams.get("businessId")
    );

  const { data: settings } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", businessId)
    .single();

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: `
You are a professional AI receptionist.

Business Name:
${settings?.business_name || "Unknown Business"}

Business Phone:
${settings?.business_phone || "Unknown"}

Greeting:
${settings?.greeting || ""}

Business Hours:
${settings?.business_hours || ""}

Services:
${settings?.services || ""}

FAQs:
${settings?.faqs || ""}

Customer question:
Do you take walk-ins?

Answer like a helpful receptionist.
    `,
  });

  return Response.json({
    reply: response.output_text,
  });
}