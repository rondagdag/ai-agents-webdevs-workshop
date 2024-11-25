
import { initChatModel } from "langchain/chat_models/universal";

// export const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });
// export const model = await initChatModel("gpt-4", {
//   modelProvider: "azure_openai",
//   temperature: 0,
// });
// export const model = await initChatModel("gpt-4o", {
//   modelProvider: "openai",
//   temperature: 0,
// });
export const model : any = await initChatModel(undefined, {
  modelProvider: "groq",
  temperature: 0,
});
