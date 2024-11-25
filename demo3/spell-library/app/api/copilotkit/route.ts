/* eslint-disable @typescript-eslint/no-explicit-any */
// Import necessary modules and functions
import {
    CopilotRuntime,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from "@copilotkit/runtime";
import { Action } from "@copilotkit/shared";
import { NextRequest } from "next/server";
import { scrape } from "./tavily"; // Import the previously defined scrape function
import { getAzureOpenAIAdapter, getLangChainAzureOpenAIAdapter, getLangChainGithubOpenAIAdapter, getLangChainOllamaAdapter, getLangChainOllamaPhi35Adapter, getLangChainOpenAIAdapter } from "./adapter"
//Define a scraping action with its name, description, parameters, and handler function
const scrapingAction: Action<any> = {
  name: "scrapeContent", // Name of the action
  description: "Call this function to scrape content from a url in a query.", // Description of the action
  parameters: [
    {
      name: "query", // Name of the parameter
      type: "string", // Type of the parameter
      description:
        "The query for scraping content. 5 characters or longer. Might be multiple words", // Description of the parameter
    },
  ],
  // Handler function to execute when the action is called
  handler: async ({ query }) => {
    console.log("Scraping query: ", query); // Log the query to the console
    const result = await scrape(query); // Call the scrape function with the query and await the result
    console.log("Scraping result: ", result); // Log the result to the console
    return result; // Return the result
  },
};

export const POST = async (req: NextRequest) => {
  const actions: Action<any>[] = []; // Initialize an empty array to store actions
  // Check if the TAVILY_API_KEY environment variable is set
  if (process.env["TAVILY_API_KEY"]) {
    actions.push(scrapingAction); // Add the scraping action to the actions array
  }

  const runtime = new CopilotRuntime({
    actions: actions,
  });
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    //serviceAdapter: await getLangChainOpenAIAdapter(),
    //serviceAdapter: await getOpenAIAdapter(),
    //serviceAdapter: await getLangChainOllamaAdapter(),
    //serviceAdapter: await getLangChainAzureOpenAIAdapter(),
    //serviceAdapter: await getLangChainOllamaPhi35Adapter(),
    serviceAdapter: await getAzureOpenAIAdapter(),
    //serviceAdapter: await getLangChainGithubOpenAIAdapter(),
    endpoint: req.nextUrl.pathname,
  });
  
  return handleRequest(req);
};