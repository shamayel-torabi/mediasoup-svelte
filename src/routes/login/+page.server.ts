import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { users } from "$lib/users";

export const load: PageServerLoad = async ({ cookies }) => {
  const sessionid = cookies.get("sessionid");
  if (sessionid) {
    throw redirect(301, "/");
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

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      cookies.set("sessionid", email, {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
      throw redirect(301, "/");
    }
    
    incorrect = true;

    return fail(400, { email, emailMissing, passwordMissing, incorrect });
  },
} satisfies Actions;
