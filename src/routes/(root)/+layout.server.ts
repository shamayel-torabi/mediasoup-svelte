import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { users } from "$lib/users";

export const load: LayoutServerLoad = ({ cookies }) => {
  const email = cookies.get("sessionid");
  if (!email) {
    redirect(301, "/login");
  }

  const user = users.find((u) => u.email === email);

  return { user };
};
