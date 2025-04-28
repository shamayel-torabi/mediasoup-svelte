import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

// export const load: PageServerLoad = async ({ cookies }) => {
//   const email = cookies.get("sessionid");
//   if(email){
//     redirect(302, '/')
//   }
// };

export const actions = {
  default: async ({ cookies, request }) => {
    const data = await request.formData();
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    if(email === 'shamayel.torabi@gmail.com' && password === 'sham'){
      cookies.set('sessionid', email , { path: '/' });
      redirect(303, '/'); 
    }
    
    return {error: 'رایانامه یا گذرواژه اشتباه است!'}
  }
} satisfies Actions;
