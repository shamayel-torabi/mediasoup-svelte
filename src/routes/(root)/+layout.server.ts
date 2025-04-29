import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ cookies }) => {
  const sessionid = cookies.get("sessionid");
  if (!sessionid) {
    redirect(301, '/login');
  }

  return {user : sessionid}
};
