import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ cookies }) => {
  const email = cookies.get("sessionid");
  if (!email) {
    redirect(307, '/login');
  }
};
