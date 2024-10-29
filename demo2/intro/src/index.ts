
import { HumanMessage } from '@langchain/core/messages';
import { ToolMessage } from "@langchain/core/messages";

import express, { Request, Response } from "express";
import { gettingStartedGraph } from './01_gettingStarted.js'
import { helloCrewmatesGraph } from "./02_helloCrewmatesGraph.js";
import { jokeOrFactGraph } from "./03_jokeOrFactGraph.js";
import { reflectionGraph } from './04_reflection.js'
import { agentWithToolingGraph } from './05_agentWithTooling.js'
import { agentWithDynamicToolsGraph } from './06_agentWithDynamicTools.js'
import { simulationGraph } from './07_simulationEvaluation.js';
import { Log, subgraph } from './08_subgraph.js';
import { waitUserInputGraph } from '09_waitUserInput.js';
import { ragGraph } from '10_rag.js';
import { newsGraph } from '11_newsGraph.js';


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

app.get("/09-init", async (_req: Request, res: Response) => {

  // Input
  const inputs = new HumanMessage("Use the search tool to ask the user where they are, then look up the weather there");

  // Thread
  const config2 = { configurable: { thread_id: "userinput-1" }, streamMode: "values" as const };

  for await (const event of await waitUserInputGraph.stream({
    messages: [inputs]
  }, config2)) {
    const recentMsg = event.messages[event.messages.length - 1];
    console.log(`================================ ${recentMsg._getType()} Message (1) =================================`)
    console.log(recentMsg.content);
  }
  const next = (await waitUserInputGraph.getState(config2)).next;
  console.log("next: ", next)
  res.send(next);
});

app.get("/09-respond", async (_req: Request, res: Response) => {

  const config2 = { configurable: { thread_id: "userinput-1" }, streamMode: "values" as const };

  const currentState = await waitUserInputGraph.getState(config2);

  const toolCallId = currentState.values.messages[currentState.values.messages.length - 1].tool_calls[0].id;

  // We now create the tool call with the id and the response we want
  const toolMessage = new ToolMessage({
    tool_call_id: toolCallId,
    content: "singapore"
  });

  console.log("next before update state: ", (await waitUserInputGraph.getState(config2)).next)

  // We now update the state
  // Notice that we are also specifying `asNode: "askHuman"`
  // This will apply this update as this node,
  // which will make it so that afterwards it continues as normal
  await waitUserInputGraph.updateState(config2, { messages: [toolMessage] }, "askHuman");

  // We can check the state
  // We can see that the state currently has the `agent` node next
  // This is based on how we define our graph,
  // where after the `askHuman` node goes (which we just triggered)
  // there is an edge to the `agent` node
  console.log("next AFTER update state: ", (await waitUserInputGraph.getState(config2)).next)
  // await messagesApp.getState(config)

  let lastMessage = "";
  for await (const event of await waitUserInputGraph.stream(null, config2)) {
    //console.log(event)
    const recentMsg = event.messages[event.messages.length - 1];
    console.log(`================================ ${recentMsg._getType()} Message (1) =================================`)
    if (recentMsg._getType() === "tool") {
      console.log({
        name: recentMsg.name,
        content: recentMsg.content
      })
      lastMessage = recentMsg.content
    } else if (recentMsg._getType() === "ai") {
      console.log(recentMsg.content)
      lastMessage = recentMsg.content
    }
  }
  res.send(lastMessage);
});


app.get("/10", async (_req: Request, res: Response) => {
  const question = _req.query["question"] as string;
  const inputs = {
    messages: [
      new HumanMessage(
        question,
      ),
    ],
  };

  const result = await ragGraph.invoke(inputs);
  console.dir(result, { depth: null });
  res.send(result);
});

app.get("/11", async (_req: Request, res: Response) => {
  const topic = _req.query["topic"] as string;
  const inputs = {
    topic
};
  const result = await newsGraph.invoke(inputs);
  console.dir(result, { depth: null });
  res.send(result);
});

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});
