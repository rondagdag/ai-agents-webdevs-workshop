
import "dotenv/config";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { ChatOpenAI } from "@langchain/openai";
const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

// Define your desired data structure. Only used for typing the parser output.
interface Joke {
  setup: string;
  punchline: string;
}

// A query and format instructions used to prompt a language model.
const jokeQuery = "Tell me a joke.";
const formatInstructions =
  "Respond with a valid JSON object, containing two fields: 'setup' and 'punchline'.";

// Set up a parser + inject instructions into the prompt template.
const parser = new JsonOutputParser<Joke>();

const prompt = ChatPromptTemplate.fromTemplate(
  "Answer the user query.\n{format_instructions}\n{query}\n"
);

const partialedPrompt = await prompt.partial({
  format_instructions: formatInstructions,
});

const chain = partialedPrompt.pipe(model).pipe(parser);

const res = await chain.invoke({ query: jokeQuery });
console.log(res);