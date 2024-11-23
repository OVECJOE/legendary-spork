import * as fs from "node:fs/promises";
import OpenAI from "openai";
import "dotenv/config";

export async function isPath2Dir(path) {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch (err) {
    return false;
  }
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function smartReplace(content, searchText, instruction) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a smart find and replace tool." /
            "You will be given a content, the search text, and possibly an instruction." /
            "You will then find and replace the search text based on the instruction." /
            "Ensure that, no matter the instruction, the content remains coherent, clear, and meaningful.",
        },
        {
          role: "user",
          content: `Here is the content you will be working on:\n${content}`,
        },
        { role: "assistant", content: "Cool! What is the search text?" },
        { role: "user", content: searchText },
        { role: "assistant", content: "Do you have an instruction?" },
        { role: "user", content: instruction || "No" },
      ],
    });

    return response.choices[0].message.content;
  } catch (err) {
    return false;
  }
}
