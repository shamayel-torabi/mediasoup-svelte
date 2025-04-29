import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
  const sessionid = cookies.get("sessionid");
  if (sessionid) {
    redirect(303, "/");
  }
};

export const actions = {
  default: async ({ cookies, request }) => {
    const data = await request.formData();
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    let emailMissing = false;
    let passwordMissing = false;
    let incorrect = false;

    if (!email) {
      emailMissing = true;
    }

    if (!password) {
      passwordMissing = true;
    }

    if(!password || !email){
      return fail(400, { email, emailMissing, passwordMissing, incorrect });
    }

    if (email === "shamayel.torabi@gmail.com" && password === "sham") {
      cookies.set("sessionid", email, { path: "/" });
      redirect(303, "/");
    }
    
    incorrect = true;

    return fail(400, { email, emailMissing, passwordMissing, incorrect });
  },
} satisfies Actions;
