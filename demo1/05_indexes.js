
import "dotenv/config";


import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

// import { OllamaEmbeddings } from "@langchain/ollama";
// const embeddings = new OllamaEmbeddings({
//   model: "nomic-embed-text", // Default value
// });

import { AzureOpenAIEmbeddings } from "@langchain/openai";
const embeddings = new AzureOpenAIEmbeddings();

const loader = new TextLoader("./texts/J. K. Rowling - Harry Potter 1 - Sorcerer's Stone.txt");

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 50,
});

const documents = await splitter.splitDocuments(docs);
console.log(documents);


const vectorstore = await FaissStore.fromDocuments(documents, embeddings);
await vectorstore.save("./");
