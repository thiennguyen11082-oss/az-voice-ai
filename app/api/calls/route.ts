import { supabase } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("calls")
    .insert([
      {
        customer_name: body.customer_name,
        phone_number: body.phone_number,
        duration: body.duration,
        transcript: body.transcript,
      },
    ])
    .select();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    message: "Call saved successfully",
    call: data,
  });
}