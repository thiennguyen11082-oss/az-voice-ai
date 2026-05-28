import { supabase } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("website_visitors")
    .insert([
      {
        page: body.page,
        visitor_ip: body.visitor_ip,
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
    message: "Visitor saved successfully",
    visitor: data,
  });
}