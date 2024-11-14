
import "dotenv/config";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { model } from "./model";

type Person = {
  name: string;
  height: number;
};

type People = {
  people: Person[];
};

const formatInstructions = `Respond only in valid JSON. The JSON object you return should match the following schema:
{{ people: [{{ name: "string", "height": "number" }}] }}

Where people is an array of objects, each with a name and height_in_meters field.
`;

// Set up a parser
const parser = new JsonOutputParser<People>();

// Prompt
const prompt = await ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer the user query. Wrap the output in `json` tags\n{format_instructions}",
  ],
  ["human", "{query}"],
]).partial({
  format_instructions: formatInstructions,
});


const query = "Anna is 23 years old and she is 6 feet tall";

console.log((await prompt.format({ query })).toString());

const chain = prompt.pipe(model).pipe(parser);

console.log(await chain.invoke({ query }));