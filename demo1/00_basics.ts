import "dotenv/config";

import { AzureOpenAI } from "openai";

const endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
const apiKey = process.env["AZURE_OPENAI_API_KEY"];
const apiVersion = process.env["AZURE_OPENAI_API_VERSION"];
const deployment = process.env["AZURE_OPENAI_API_DEPLOYMENT_NAME"]; // This must match your deployment name

const openai = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });

async function chat(input) {
  const messages = [{ role: "user", content: input }];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
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
