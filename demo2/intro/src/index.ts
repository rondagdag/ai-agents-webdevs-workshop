
import { HumanMessage } from '@langchain/core/messages';
import express, { Request, Response } from "express";
import { gettingStartedGraph } from './01_gettingStarted.js'
import { helloCrewmatesGraph } from "./02_helloCrewmatesGraph.js";
import { jokeOrFactGraph } from "./03_jokeOrFactGraph.js";
import { reflectionGraph } from './04_reflection.js'
import { agentWithToolingGraph } from './05_agentWithTooling.js'
import { agentWithDynamicToolsGraph } from './06_agentWithDynamicTools.js'
import { simulationGraph } from './07_simulationEvaluation.js';
import { Log, subgraph } from './08_subgraph.js';


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
  const result = await helloCrewmatesGraph.invoke({
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
  // Execute the graph!

  const agentFinalState = await reflectionGraph.invoke(
    { messages: [new HumanMessage("Generate an essay on the topicality of The Little Prince and its message in modern life")] },
  );
  
  agentFinalState.messages.forEach((message, index) => {
    console.log(`Message ${index + 1}: ${message.content}`);
  });

  res.send(agentFinalState.messages[agentFinalState.messages.length - 1].content);

});

app.get("/05", async (_req: Request, res: Response) => {
  // Use the agent
  const agentFinalState = await agentWithToolingGraph.invoke(
    { messages: [new HumanMessage("who is harry potter?")] },
    { configurable: { thread_id: "conversation-num-1" } },
  );
  
  agentFinalState.messages.forEach((message, index) => {
    console.log(`Message ${index + 1}: ${message.content}`);
  });

  res.send(agentFinalState.messages[agentFinalState.messages.length - 1].content);

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

app.get("/06", async (_req: Request, res: Response) => {

  const msg = _req.query["msg"] as string;
  //Use the agent
  const agentFinalState = await agentWithDynamicToolsGraph.invoke(
    { messages: [new HumanMessage(msg)], }
  );
    
  agentFinalState.messages.forEach((message, index) => {
    console.log(`Message ${index + 1}: ${message.content}`);
  });

  res.send(agentFinalState.messages[agentFinalState.messages.length - 1].content);
});

app.get("/07", async (_req: Request, res: Response) => {
  const task = _req.query["msg"] as string;
  //Use the agent
  const finalState = await simulationGraph.invoke({ task });
  const result = finalState;
  console.log(result);
  res.send(result);
});

app.get("/08", async (_req: Request, res: Response) => {
    // Dummy logs
    const dummyLogs: Log[] = [
    {
      "type": "log",
      "id": "1",
      "task": "Swipe Card",
      "status": "Complete",
      "details": "Successfully swiped the card in admin.",
      timestamp: new Date("2024-10-27T12:35:00Z")
    },
    {
      "type": "log",
      "id": "2",
      "task": "Fix Wiring",
      "status": "Incomplete",
      "details": "Wiring panel opened in Electrical; color mismatch found.",
      timestamp: new Date("2024-10-27T12:37:00Z"),
      "feedback": "Make sure to match all wires correctly."
    },
    {
      "type": "log",
      "id": "3",
      "task": "Empty Garbage",
      "status": "Complete",
      "details": "Garbage emptied in Cafeteria chute.",
      timestamp: new Date("2024-10-27T12:40:00Z")
    },
    {
      "type": "log",
      "id": "4",
      "task": "Fuel Engines",
      "status": "In Progress",
      "details": "Fuel retrieved; heading to Upper Engine.",
      timestamp: new Date("2024-10-27T12:45:00Z")
    },
    {
      "type": "log",
      "id": "5",
      "task": "Align Engine Output",
      "status": "Incomplete",
      "details": "Alignment needed in Lower Engine.",
      "timestamp": new Date("2024-10-27T12:48:00Z"),
      "feedback": "Use controls to align engines perfectly."
    }
];
    const result = await subgraph.invoke({ rawLogs: dummyLogs });
    console.dir(result, { depth: null });
    res.send(result);
});



// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});
