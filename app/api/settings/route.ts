import { supabase } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("business_settings")
    .insert([
      {
        business_name: body.business_name,
        business_phone: body.business_phone,
        greeting: body.greeting,
        business_hours: body.business_hours,
        services: body.services,
        faqs: body.faqs,
      },
    ])
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    message: "Settings saved successfully",
    settings: data,
  });
}