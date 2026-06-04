export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recordingUrl = searchParams.get("url");

  if (!recordingUrl) {
    return new Response("Missing recording URL", { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;

  const audioResponse = await fetch(`${recordingUrl}.mp3`, {
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
    },
  });

  const audioBuffer = await audioResponse.arrayBuffer();

  return new Response(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}