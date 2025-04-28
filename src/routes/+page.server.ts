// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ request }) => {
    const frmData = await request.formData();
    const roomName = frmData.get("room");
    const userName = frmData.get("username");
    //console.log({roomName, username})


    redirect(303, `/room?roomName=${roomName}&userName=${userName}`)

    // if (roomId && username) {
    //   redirect(308, '/room')
    // }
  },
} satisfies Actions;
