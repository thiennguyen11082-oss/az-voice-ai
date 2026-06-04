import { supabase } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();

  const fromNumber = formData.get("From")?.toString();
  const toNumber = formData.get("To")?.toString();
  const recordingUrl = formData.get("RecordingUrl")?.toString();
  const transcriptionText = formData.get("TranscriptionText")?.toString();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("twilio_phone", toNumber)
    .single();

  if (!business) {
    return new Response("Business not found", { status: 404 });
  }

  await supabase.from("voice_messages").insert([
    {
      business_id: business.id,
      customer_name: "Phone Caller",
      phone_number: fromNumber,
      message:
        transcriptionText ||
        "Voice message received. Transcript not ready yet.",
      recording_url: recordingUrl,
    },
  ]);

  return new Response("OK");
}