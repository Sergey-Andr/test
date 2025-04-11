// api/chatgpt.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { text } = req.body;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: text }],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.statusText}`);
      }

      const data = await response.json();

      res.status(200).json({
        message: data.choices[0].message.content, // Достаем сообщение из ответа OpenAI
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    // Если не POST-запрос, возвращаем ошибку
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
