import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from '@copilotkit/runtime';
  import OpenAI from 'openai/index.mjs';
  import { NextRequest } from 'next/server';
  import { getGroqAdapter, getLangChainAzureOpenAIAdapter, getLangChainOllamaAdapter } from "./adapter"

  const runtime = new CopilotRuntime();
   
  export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      //serviceAdapter: await getLangChainOpenAIAdapter(),
      //serviceAdapter: await getOpenAIAdapter(),
      //serviceAdapter: await getLangChainOllamaAdapter(),
      //serviceAdapter: await getLangChainAzureOpenAIAdapter(),
      //serviceAdapter: await getAzureOpenAIAdapter(),
      serviceAdapter: await getGroqAdapter(),
      //serviceAdapter: await getLangChainOllamaAdapter(),
      endpoint: req.nextUrl.pathname,
    });
   
    return handleRequest(req);
  };