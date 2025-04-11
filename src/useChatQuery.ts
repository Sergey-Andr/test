export async function useChatMutation(text: string): Promise<string> {
  try {
    const completion = await fetch("/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    if (!completion.ok) {
      throw new Error("Failed to get response from API");
    }

    const data = await completion.json();
    return data.message;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      console.log("Too many requests. Retrying...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return useChatMutation(text);
    } else {
      throw error;
    }
  }
}
