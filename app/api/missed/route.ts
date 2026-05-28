import { supabase } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("missed_calls")
    .insert([
      {
        customer_name: body.customer_name,
        phone_number: body.phone_number,
        missed_time: body.missed_time,
      },
    ])
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    message: "Missed call saved successfully",
    missed_call: data,
  });
}