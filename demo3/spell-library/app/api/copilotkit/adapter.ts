/* eslint-disable @typescript-eslint/no-explicit-any */

export async function getOpenAIAdapter() {
  const { OpenAIAdapter } = await import("@copilotkit/runtime");
  const { OpenAI } = await import("openai");
  //return new OpenAIAdapter();
  const openai = new OpenAI();
  return new OpenAIAdapter({ openai });
}

export async function getAzureOpenAIAdapter() {
  const { OpenAIAdapter } = await import("@copilotkit/runtime");
  const { AzureOpenAI } = await import("openai");
  const endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
  const apiKey = process.env["AZURE_OPENAI_API_KEY"];
  const apiVersion = process.env["AZURE_OPENAI_API_VERSION"];
  const deployment = process.env["AZURE_OPENAI_API_DEPLOYMENT_NAME"]; // This must match your deployment name
  const openai = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
  return new OpenAIAdapter({ openai });
}

export async function getLangChainOpenAIAdapter() {
  const { LangChainAdapter } = await import("@copilotkit/runtime");
  const { ChatOpenAI } = await import("@langchain/openai");
  return new LangChainAdapter({
    chainFn: async ({ messages, tools }) => {
      const model = new ChatOpenAI({
        modelName: "gpt-4",
        apiKey: process.env.OPENAI_API_KEY,
      }).bind(tools as any) as any;
      return model.stream(messages, { tools });
    },
  });
}

export async function getLangChainOllamaAdapter() {
  const { LangChainAdapter } = await import("@copilotkit/runtime");
  const { initChatModel } = await import("langchain/chat_models/universal");
  return new LangChainAdapter({
    chainFn: async ({ messages, tools }) => {
      const model = await initChatModel("llama3.2", {
        modelProvider: "ollama",
        temperature: 0,
      });
      return model.stream(messages, { tools });
    },
  });
}
export async function getLangChainAzureOpenAIAdapter() {
  const { LangChainAdapter } = await import("@copilotkit/runtime");
  const { initChatModel } = await import("langchain/chat_models/universal");
  return new LangChainAdapter({
    chainFn: async ({ messages, tools }) => {
      const model = await initChatModel("gpt-4", {
        modelProvider: "azure_openai",
        temperature: 0,
      });
      return model.stream(messages, { tools });
    },
  });
}
