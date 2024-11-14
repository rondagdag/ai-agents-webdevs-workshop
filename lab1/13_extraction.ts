import "dotenv/config";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { model } from "./model";

let personSchema = z
  .object({
    name: z.optional(z.string()).describe("The name of the person"),
    hair_color: z.optional(z.string())
      .describe("The color of the person's hair, if known."),
    height_in_meters: z.optional(z.string())
      .describe("Height measured in meters"),
  })
  .describe("Information about a person.");

const parser = StructuredOutputParser.fromZodSchema(personSchema);

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer the user query. Wrap the output in `json` tags\n{format_instructions}",
  ],
  ["human", "{query}"],
]);

const partialedPrompt = await prompt.partial({
  format_instructions: parser.getFormatInstructions(),
});

const query = "Who is Dumbledore?";

const promptValue = await partialedPrompt.invoke({ query });

console.log(promptValue.toChatMessages());

const chain = partialedPrompt.pipe(model).pipe(parser);

const res = await chain.invoke({ query });
console.log(res)