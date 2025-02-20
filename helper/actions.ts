"use server";
// export const sendMessage = async (
//   input: string,
//   model: string = "gpt-3.5-turbo"
// ) => {
//   try {
//     const response = await fetch("/api/chat", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ input, model }),
//     });

//     const data = await response.json();

//     return data.response;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const starMessage = async (id: number, star: boolean = true) => {
//   try {
//     const response = await fetch("/api/chat/star", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ id, star }),
//     });

//     const data = await response.json();

//     return data;
//   } catch (error) {
//     console.error(error);
//   }
// };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const getChats = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch chats");
    return res.json();
  } catch (error) {
    console.error("Fetch Chat Error:", error);
    return [];
  }
};

export const getStarredChats = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/star`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch starred chats");
    return res.json();
  } catch (error) {
    console.error("Fetch Starred Chats Error:", error);
    return [];
  }
};

export const sendMessage = async (input: string, model: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, model }),
    });

    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  } catch (error) {
    console.error("Send Message Error:", error);
    return null;
  }
};

export const starMessage = async (chatId: string) => {
  try {
    await fetch(`${BASE_URL}/api/star`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId }),
    });
  } catch (error) {
    console.error("Star Message Error:", error);
  }
};

export const unstarMessage = async (chatId: string) => {
  try {
    await fetch(`${BASE_URL}/api/star`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId }),
    });
  } catch (error) {
    console.error("Unstar Message Error:", error);
  }
};
