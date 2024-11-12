import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from '@copilotkit/runtime';
  import OpenAI from 'openai/index.mjs';
  import { NextRequest } from 'next/server';
  import { getGroqAdapter, getLangChainAzureOpenAIAdapter, getLangChainOllamaAdapter } from "./adapter"

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const runtime = new CopilotRuntime();
   
  export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      //serviceAdapter: await getLangChainOpenAIAdapter(),
      //serviceAdapter: await getOpenAIAdapter(),
      //serviceAdapter: await getLangChainOllamaAdapter(),
      //serviceAdapter: await getLangChainAzureOpenAIAdapter(),
      //serviceAdapter: await getAzureOpenAIAdapter(),
      serviceAdapter: await getLangChainOllamaAdapter(),
      endpoint: req.nextUrl.pathname,
    });
   
    return handleRequest(req);
  };