import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
  const roomId = url.searchParams.get("roomId");
  const userName = url.searchParams.get("userName");
  return { roomId, userName };
};
