import "dotenv/config";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";

import { initChatModel } from "langchain/chat_models/universal";

// const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });

const model = await initChatModel("gpt-4", {
  modelProvider: "azure_openai",
  temperature: 0,
});


let reviewPromptTemplate = PromptTemplate.fromTemplate(
  `You ordered {book_name} and your experience was {experience}. Write a review: `
)

const reviewChain = reviewPromptTemplate.pipe(model).pipe(new StringOutputParser());

let commentPromptTemplate = PromptTemplate.fromTemplate(
  `Given the book review: {review}, write a follow-up comment: `
)

const commentChain = RunnableSequence.from([
  {
    review: reviewChain
  },
  commentPromptTemplate,
  model,
  new StringOutputParser(),
]);

const summaryPromptTemplate = PromptTemplate.fromTemplate(
  `Summarise the review in one short sentence: \n\n {review}

  Summary: `
)

const summaryChain = RunnableSequence.from([
  {
    review: commentChain
  },
  summaryPromptTemplate,
  model,
  new StringOutputParser(),
]);

const translationPromptTemplate = PromptTemplate.fromTemplate(
  `Translate the summary to {language}: \n\n {summary}`
)

const translationChain = RunnableSequence.from([
  {
    summary: summaryChain,
    language: (input) => input.language,
  },
  translationPromptTemplate,
  model,
  new StringOutputParser(),
]);

const result = await translationChain.invoke({
  book_name: "Harry Potter And The Half-Blood Prince",
  experience: "It is the best!",
  language: "Filipino"});
console.log(result);
