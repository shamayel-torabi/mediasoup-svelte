import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url}) => {
  const roomId = url.searchParams.get("roomId");
  return { roomId };
};
