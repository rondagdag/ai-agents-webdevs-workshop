import { AzureOpenAIEmbeddings } from "@langchain/openai";

// must download the model from https://huggingface.co/ollama/nomic-embed-text
// run ollama pull nomic-embed-text

// import { OllamaEmbeddings } from "@langchain/ollama";
// const embeddings = new OllamaEmbeddings({
//   model: "nomic-embed-text", // Default value
// });

// import { OpenAIEmbeddings } from "@langchain/openai";
// export const embeddings = new OpenAIEmbeddings();

// export const embeddings = new AzureOpenAIEmbeddings();

// import { OpenAIEmbeddings } from "@langchain/openai";
// export const embeddings = new OpenAIEmbeddings({
//     model: "text-embedding-3-small",
//   });

import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

export const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "nomic-ai/nomic-embed-text-v1.5",
});
  