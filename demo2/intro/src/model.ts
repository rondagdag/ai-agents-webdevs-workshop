import { initChatModel, ChatModelProvider } from "langchain/chat_models/universal";

// export const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });
// export const model = await initChatModel("gpt-4", {
//   modelProvider: "azure_openai",
//   temperature: 0,
// });
// export const model = await initChatModel("gpt-4", {
//   modelProvider: "openai",
//   temperature: 0,
// });
// export const model = await initChatModel(undefined, {
//   modelProvider: "groq",
//   temperature: 0,
// });

export const model: any = await initChatModel("gpt-4", {
  modelProvider: "openai",
  apiKey: "GITHUB_OPENAI_API_KEY",
  temperature: 0,
  configuration: {
    baseURL: 'https://models.inference.ai.azure.com'
  }
});