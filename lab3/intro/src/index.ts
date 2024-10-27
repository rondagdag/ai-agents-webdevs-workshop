
import { HumanMessage } from '@langchain/core/messages';
import express, { Request, Response } from "express";
import { gettingStartedGraph } from './01_gettingStarted.js'
import { helloWorldGraph } from "./02_helloWorldGraph.js";
import { jokeOrFactGraph } from "./03_jokeOrFactGraph.js";
import { agentWithToolingGraph } from './04_agentWithTooling.js'
import { agentWithDynamicToolsGraph } from './05_agentWithDynamicTools.js'


// Create an Express application
const app = express();

// Specify the port number for the server
const port: number = 3008;

app.get("/01", async (_req: Request, res: Response) => {
  // Execute the graph!
  // Use the agent

  const result = await gettingStartedGraph.invoke({
    messages: [new HumanMessage("what is 1+3?")],
  });

  const output = result.messages[result.messages.length - 1].content;
  console.log("\n=====START======");
  console.log("Result: ", output);
  console.log("\n=====END======");

  res.send(output);
});

app.get("/02", async (_req: Request, res: Response) => {
  // Execute the graph!
  const result = await helloWorldGraph.invoke({
    name: "Bot",
    isHuman: false,
  });

  console.log("\n=====START======");
  console.log("Graph result: ", result);
  console.log("\n=====END======");

  res.send(result);
});

app.get("/03", async (_req: Request, res: Response) => {
  // Execute the graph with a fact!
  const factResult = await jokeOrFactGraph.invoke({
    userInput: "i want a fact",
  });

  // Execute the graph with a joke!
  const jokeResult = await jokeOrFactGraph.invoke({
    userInput: "i want a joke",
  });

  console.log("\n=====START======\n");

  console.log("Fact result: ", factResult.responseMsg);

  console.log("Joke result: ", jokeResult.responseMsg);

  console.log("\n=====END======\n");

  res.send({ 
    fact: factResult.responseMsg,
    joke: jokeResult.responseMsg
  });
});

app.get("/04", async (_req: Request, res: Response) => {
  // Use the agent
  const finalState = await agentWithToolingGraph.invoke(
    { messages: [new HumanMessage('What is the weather in SF')] },
    { configurable: { thread_id: '42' } }
  )
  console.log(finalState.messages[finalState.messages.length - 1].content)
  res.send(finalState.messages[finalState.messages.length - 1].content);

  // const finalState = await agentWithToolingGraph.invoke(
  //   { messages: [new HumanMessage("what is the weather in Singapore?")] },
  //   { configurable: { thread_id: '42' } });
  // console.log(finalState.messages[finalState.messages.length - 1].content);
  // const nextState = await agentWithToolingGraph.invoke({
  //   // Including the messages from the previous run gives the LLM context.
  //   // This way it knows we're asking about the weather in NY
  //   messages: [...finalState.messages, new HumanMessage("what about Dallas, TX?")],
  // });
  // console.log(nextState.messages[nextState.messages.length - 1].content);

});

app.get("/04", async (_req: Request, res: Response) => {

  // Use the agent
  const finalState = await agentWithToolingGraph.invoke({
    messages: [new HumanMessage("what is the weather in Singapore?")],
  });
  const result = finalState.messages[finalState.messages.length - 1].content;
  console.log(result);
  res.send(result);
});

app.get("/05", async (_req: Request, res: Response) => {
  const msg = _req.query["msg"] as string;
  //Use the agent
  const finalState = await agentWithDynamicToolsGraph.invoke({
    messages: [new HumanMessage(msg)],
  });
  const result = finalState.messages[finalState.messages.length - 1].content;
  console.log(result);
  res.send(result);
});

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});
