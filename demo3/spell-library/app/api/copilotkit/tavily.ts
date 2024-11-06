// Import the OpenAI library
import OpenAI from "openai";

// Define an asynchronous function named `scrape` that takes a search query string as an argument
export async function scrape(query: string) {
  // Send a POST request to the specified API endpoint with the search query and other parameters
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST", // HTTP method
    headers: {
      "Content-Type": "application/json", // Specify the request content type as JSON
    },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY, // API key from environment variables
      query, // The search query passed to the function
      search_depth: "basic", // Search depth parameter
      include_answer: true, // Include the answer in the response
      include_images: false, // Do not include images in the response
      include_raw_content: false, // Do not include raw content in the response
      max_results: 20, // Limit the number of results to 20
    }),
  });

  // Parse the JSON response from the API
  const responseJson = await response.json();

  // Instantiate the OpenAI class
  const openai = new OpenAI();

  // Use the OpenAI API to create a completion based on the JSON response
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system", // Set the role of the message to system
        content: `Summarize the following JSON to answer the research query \`"${query}"\`: ${JSON.stringify(
          responseJson
        )} in plain English.`, // Provide the JSON response to be summarized
      },
    ],
    model: process.env.OPENAI_MODEL || "gpt-4", // Specify the OpenAI model, defaulting to GPT-4 if not set in environment variables
  });

  // Return the content of the first message choice from the completion response
  return completion.choices[0].message.content;
}