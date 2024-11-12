import "dotenv/config";
import { WebBrowser } from "langchain/tools/webbrowser";
import { initChatModel } from "langchain/chat_models/universal";


import { embeddings } from "./embeddings";
import { model } from "./model";

export async function run() {

  const browser = new WebBrowser({ model, embeddings });

  const result = await browser.invoke(
    `"https://www.britannica.com/topic/Harry-Potter","who is harry potter"`
  );

  console.log(result);
}

run();