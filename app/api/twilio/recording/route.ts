import { supabase } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();

  const phoneNumber = formData.get("From")?.toString();
  const transcriptionText = formData.get("TranscriptionText")?.toString();
  const recordingUrl = formData.get("RecordingUrl")?.toString();

  const { data, error } = await supabase
    .from("voice_messages")
    .insert([
      {
        customer_name: "Phone Caller",
        phone_number: phoneNumber,
        message: transcriptionText || recordingUrl || "Voice message received",
      },
    ])
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    message: "Recording saved successfully",
    voice_message: data,
  });
}