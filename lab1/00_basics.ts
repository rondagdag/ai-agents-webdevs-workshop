import "dotenv/config";

import { OpenAI } from "openai";

const token = process.env["GITHUB_OPENAI_API_KEY"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

const openai = new OpenAI({ baseURL: endpoint, apiKey: token });

async function chat(input) {
  const messages = [{ role: "user", content: input }];

  const response = await openai.chat.completions.create({
    model: modelName,
    messages: messages,
    temperature: 0,
  });

  return response.choices[0].message;
}

const question = "Who wrote the 'Harry Potter' series book? What's the real name? Why choose that name?";

chat(question)
  .then((response) => console.log(response))
  .catch((error) => console.error(error));

const promptTemplate = `
  Be very funny when answering questions
  Question: {question}
  `;

const prompt = promptTemplate.replace("{question}", question);

chat(prompt)
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
