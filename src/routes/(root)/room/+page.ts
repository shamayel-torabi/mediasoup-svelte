import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
  const searchParams = new URLSearchParams(url.searchParams);
  const roomId = searchParams.get("roomId");
  const userName = searchParams.get("userName");
  return { roomId, userName }
};
