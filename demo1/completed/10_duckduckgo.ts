import "dotenv/config";
import { WebBrowser } from "langchain/tools/webbrowser";
import { initChatModel } from "langchain/chat_models/universal";

import { OllamaEmbeddings } from "@langchain/ollama";
import { AzureOpenAIEmbeddings, AzureChatOpenAI } from "@langchain/openai";

import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";



export async function run() {

    // const embeddings = new OllamaEmbeddings({
    //     model: "nomic-embed-text", // Default value
    // });
    // const model = await initChatModel("llama3.2", {
    //     modelProvider: "ollama",
    //     temperature: 0,
    // });

    const tool = new DuckDuckGoSearch({ maxResults: 1 });

    const result = await tool.invoke("what is the current weather in singapore?");
    console.log(result);
}

run();