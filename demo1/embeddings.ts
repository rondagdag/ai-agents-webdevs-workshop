import { AzureOpenAIEmbeddings } from "@langchain/openai";

// import { OllamaEmbeddings } from "@langchain/ollama";
// const embeddings = new OllamaEmbeddings({
//   model: "nomic-embed-text", // Default value
// });

// import { OpenAIEmbeddings } from "@langchain/openai";
// export const embeddings = new OpenAIEmbeddings();

// export const embeddings = new AzureOpenAIEmbeddings();

import { OpenAIEmbeddings } from "@langchain/openai";
export const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
  });
