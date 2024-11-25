/**
 * @filePath app/copilotkit/route.ts
 */
import {
    CopilotRuntime,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { getAzureOpenAIAdapter, getGroqAdapter, getLangChainAzureOpenAIAdapter, getLangChainGithubOpenAIAdapter, getLangChainOllamaAdapter, getLangChainOllamaPhi35Adapter, getLangChainOpenAIAdapter, getOpenAIAdapter } from "./adapter";

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    //serviceAdapter: await getLangChainOpenAIAdapter(),
    //serviceAdapter: await getOpenAIAdapter(),
    //serviceAdapter: await getLangChainOllamaAdapter(),
    //serviceAdapter: await getLangChainAzureOpenAIAdapter(),
    //serviceAdapter: await getLangChainOllamaPhi35Adapter(),
    serviceAdapter: await getGroqAdapter(),
    //serviceAdapter: await getAzureOpenAIAdapter(),
    //serviceAdapter: await getLangChainGithubOpenAIAdapter(),
    endpoint: req.nextUrl.pathname,
  });

  return handleRequest(req);
};