/**
 * @filePath app/copilotkit/route.ts
 */
import {
    CopilotRuntime,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { getLangChainAzureOpenAIAdapter } from "./adapter";

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    //serviceAdapter: await getLangChainOpenAIAdapter(),
    //serviceAdapter: await getOpenAIAdapter(),
    //serviceAdapter: await getLangChainOllamaAdapter(),
    serviceAdapter: await getLangChainAzureOpenAIAdapter(),
    //serviceAdapter: await getAzureOpenAIAdapter(),
    endpoint: req.nextUrl.pathname,
  });

  return handleRequest(req);
};