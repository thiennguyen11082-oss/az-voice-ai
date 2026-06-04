import { authClient } from "@/app/lib/auth";

export async function getCurrentBusinessId() {
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: link } = await authClient
    .from("user_businesses")
    .select("business_id")
    .eq("user_id", user.id)
    .single();

  return link?.business_id || null;
}