import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
  const email = cookies.get("sessionid");
  if(email){
    redirect(303, '/')
  }
};

export const actions = {
  default: async ({ cookies, request }) => {
    const data = await request.formData();
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    if (!email) {
			return fail(400, { email, emailMissing: true });
		}

    if (!password) {
			return fail(400, {email, passwordMissing: true });
		}   

    if(email === 'shamayel.torabi@gmail.com' && password === 'sham'){
      cookies.set('sessionid', email , { path: '/' });
      redirect(303, '/'); 
    }

    return fail(400, { email, incorrect: true });
  }
} satisfies Actions;
