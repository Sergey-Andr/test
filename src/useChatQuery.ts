import OpenAI from "openai";

const openai = new OpenAI({
  //@ts-ignore
  apiKey: import.meta.env.VITE_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function useChatMutation(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
      store: true,
    });
    return completion.choices[0].message.content as string;
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
