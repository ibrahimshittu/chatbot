import StarredPage from "@/components/pages/starred-page";
import { getStarredChats } from "../actions";

export default async function Starred() {
  const starredMessages = await getStarredChats();

  console.log(starredMessages);

  return (
    <div>
      <StarredPage messages={starredMessages} />
    </div>
  );
}
