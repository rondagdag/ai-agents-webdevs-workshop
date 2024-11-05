/* eslint-disable @typescript-eslint/no-explicit-any */
// Import necessary modules and functions
import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from "@copilotkit/runtime";
  import { Action } from "@copilotkit/shared";
  import OpenAI from "openai";
  import { NextRequest } from "next/server";
   
  //import { scrape } from "./tavily"; // Import the previously defined scrape function
  
  // Define a scraping action with its name, description, parameters, and handler function
//   const scrapingAction: Action<any> = {
//     name: "scrapeContent", // Name of the action
//     description: "Call this function to scrape content from a url in a query.", // Description of the action
//     parameters: [
//       {
//         name: "query", // Name of the parameter
//         type: "string", // Type of the parameter
//         description:
//           "The query for scraping content. 5 characters or longer. Might be multiple words", // Description of the parameter
//       },
//     ],
//     // Handler function to execute when the action is called
//     handler: async ({ query }) => {
//       console.log("Scraping query: ", query); // Log the query to the console
//       const result = await scrape(query); // Call the scrape function with the query and await the result
//       console.log("Scraping result: ", result); // Log the result to the console
//       return result; // Return the result
//     },
//   };
  
  const openai = new OpenAI();
  const serviceAdapter = new OpenAIAdapter({ openai });
   
  export const POST = async (req: NextRequest) => {
    const actions: Action<any>[] = []; // Initialize an empty array to store actions
    // // Check if the TAVILY_API_KEY environment variable is set
    // if (process.env["TAVILY_API_KEY"]) {
    //   actions.push(scrapingAction); // Add the scraping action to the actions array
    // }
  
    const runtime = new CopilotRuntime({
      actions: actions,
    });
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: "/api/copilotkit",
    });
   
    return handleRequest(req);
  };  