import "dotenv/config";

import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { formatDocumentsAsString } from "langchain/util/document";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnableMap,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { embeddings } from "./embeddings";
import { model } from "./model";

const vectorStore = await FaissStore.load("./", embeddings);

const retriever = vectorStore.asRetriever();

const prompt =
  PromptTemplate.fromTemplate(`Answer the question based only on the following context:
{context}

Question: {question}`);


const ragChainWithSources = RunnableMap.from({
  // Return raw documents here for now since we want to return them at
  // the end - we'll format in the next step of the chain
  context: retriever,
  question: new RunnablePassthrough(),
}).assign({
  answer: RunnableSequence.from([
    (input) => {
      return {
        // Now we format the documents as strings for the prompt
        context: formatDocumentsAsString(input.context as any),
        question: input.question,
      };
    },
    prompt,
    model,
    new StringOutputParser(),
  ]),
});

const res = await ragChainWithSources.invoke("What is the Sorcerer's Stone?");
console.log(JSON.stringify(res, null, 1));
