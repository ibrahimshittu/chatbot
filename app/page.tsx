import HomePage from "@/components/pages/home-page";
import { getChats } from "@/helper/actions";

export default async function Home() {
  const chats = await getChats();

  console.log(chats);
  return (
    <div>
      <HomePage chats={chats} />
    </div>
  );
}
