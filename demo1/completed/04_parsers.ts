
import "dotenv/config";


import { StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";

const parser = new StringOutputParser();

import { initChatModel } from "langchain/chat_models/universal";

// const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 1
// });

const model = await initChatModel("gpt-4", {
  modelProvider: "azure_openai",
  temperature: 0,
});

const stream = await model.pipe(parser).stream("Who wrote the 'Harry Potter' series book?");

for await (const chunk of stream) {
  console.log(chunk);
}


