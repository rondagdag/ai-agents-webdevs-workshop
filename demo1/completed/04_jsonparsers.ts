
import "dotenv/config";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { initChatModel } from "langchain/chat_models/universal";

// const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 1
// });

const model = await initChatModel("gpt-4", {
  modelProvider: "azure_openai",
  temperature: 1,
});

// A query and format instructions used to prompt a language model.
const jokeQuery = "Tell me a Harry Potter joke.";
const formatInstructions =
  "Respond with a valid JSON object, containing two fields: 'setup' and 'punchline'.";

// Set up a parser + inject instructions into the prompt template.
const parser = new JsonOutputParser();

const prompt = ChatPromptTemplate.fromTemplate(
  "Answer the user query.\n{format_instructions}\n{query}\n"
);

const partialedPrompt = await prompt.partial({
  format_instructions: formatInstructions,
});

const chain = partialedPrompt.pipe(model).pipe(parser);

const res = await chain.invoke({ query: jokeQuery });
console.log(res);