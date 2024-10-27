import "dotenv/config";
import { WebBrowser } from "langchain/tools/webbrowser";
import { initChatModel } from "langchain/chat_models/universal";

import { OllamaEmbeddings } from "@langchain/ollama";
import { AzureOpenAIEmbeddings, AzureChatOpenAI } from "@langchain/openai";



export async function run() {

    // const embeddings = new OllamaEmbeddings({
    //     model: "nomic-embed-text", // Default value
    // });
    // const model = await initChatModel("llama3.2", {
    //     modelProvider: "ollama",
    //     temperature: 0,
    // });

    const embeddings = new AzureOpenAIEmbeddings();
    const model = await initChatModel("gpt-4", {
        modelProvider: "azure_openai",
        temperature: 0,
    });

  const browser = new WebBrowser({ model, embeddings });

  const result = await browser.invoke(
    `"https://www.britannica.com/topic/Harry-Potter","who is harry potter"`
  );

  console.log(result);
}

run();