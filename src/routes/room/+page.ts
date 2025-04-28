import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
  const searchParams = new URLSearchParams(url.searchParams);
  const roomName = searchParams.get("roomName");
  const userName = searchParams.get("userName");
  return { roomName, userName }
};
