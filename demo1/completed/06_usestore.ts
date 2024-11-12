import "dotenv/config";

import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { formatDocumentsAsString } from "langchain/util/document";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { embeddings } from "./embeddings";
import { model } from "./model";

// import { initChatModel } from "langchain/chat_models/universal";

// // import { OllamaEmbeddings } from "@langchain/ollama";
// // const embeddings = new OllamaEmbeddings({
// //   model: "nomic-embed-text", // Default value
// // });
// // const model = await initChatModel("llama3.2", {
// //   modelProvider: "ollama",
// //   temperature: 0,
// // });

// import { AzureOpenAIEmbeddings, AzureChatOpenAI } from "@langchain/openai";
// const embeddings = new AzureOpenAIEmbeddings();
// const model = await initChatModel("gpt-4", {
//   modelProvider: "azure_openai",
//   temperature: 0,
// });



// const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });


const vectorStore = await FaissStore.load("./", embeddings);

const retriever = vectorStore.asRetriever();


const prompt =
  PromptTemplate.fromTemplate(`Answer the question based only on the following context:
{context}

Question: {question}`);


const chain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  prompt,
  model,
  new StringOutputParser(),
]);

let res = await chain.invoke("What is the Sorcerer's Stone?");
console.log(res);

res = await chain.invoke("Who is Norbert?");
console.log(res);
