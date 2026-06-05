import { supabase } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();

  const fromNumber = formData.get("From")?.toString();
  const toNumber = formData.get("To")?.toString();
  const callSid = formData.get("CallSid")?.toString();
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

  if (recordingUrl) {
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

    await supabase
      .from("calls")
      .update({
        status: "completed",
        duration: "Completed",
        transcript:
          transcriptionText || "Voice message received.",
      })
      .eq("call_sid", callSid);
  }

  return new Response("OK");
}