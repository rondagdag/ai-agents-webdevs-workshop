
import "dotenv/config";


import { initChatModel } from "langchain/chat_models/universal";
//#region model
import { model } from "model.js"

//#endregion


//#region Set up the tool
import { tool } from "@langchain/core/tools";
import { StateGraph, START, Annotation, END, messagesStateReducer, MessagesAnnotation } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";

const search = tool((_) => {
  return "It's sunny in Singapore, but you better look out if you're a Gemini 😈.";
}, {
  name: "search",
  description: "Call to surf the web.",
  schema: z.string(),
})

const tools = [search]
const toolNode = new ToolNode<typeof MessagesAnnotation.State>(tools)
//#endregion

//#region Set up the nodes and edges
const askHumanTool = tool((_) => {
  return "The human said XYZ";
}, {
  name: "askHuman",
  description: "Ask the human for input.",
  schema: z.string(),
});


const modelWithTools = model.bindTools([...tools, askHumanTool])

//Define nodes and conditional edges

// Define the function that determines whether to continue or not
function shouldContinue(state: typeof MessagesAnnotation.State): "action" | "askHuman" | typeof END {
  const lastMessage = state.messages[state.messages.length - 1];
  const castLastMessage = lastMessage as AIMessage;
  // If there is no function call, then we finish
  if (castLastMessage && !castLastMessage.tool_calls?.length) {
    return END;
  }
  // If tool call is askHuman, we return that node
  // You could also add logic here to let some system know that there's something that requires Human input
  // For example, send a slack message, etc
  if (castLastMessage.tool_calls?.[0]?.name === "askHuman") {
    console.log("--- ASKING HUMAN ---")
    return "askHuman";
  }
  // Otherwise if it isn't, we continue with the action node
  return "action";
}


// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State): Promise<Partial<typeof MessagesAnnotation.State>> {
  const messages = state.messages;
  const response = await modelWithTools.invoke(messages);
  // We return an object with a messages property, because this will get added to the existing list
  return { messages: [response] };
}


// We define a fake node to ask the human
function askHuman(state: typeof MessagesAnnotation.State): Partial<typeof MessagesAnnotation.State> {
  return state;
}

//#endregion

//#region Define a new graph
const messagesWorkflow = new StateGraph(MessagesAnnotation)
  // Define the two nodes we will cycle between
  .addNode("agent", callModel)
  .addNode("action", toolNode)
  .addNode("askHuman", askHuman)
  // We now add a conditional edge
  .addConditionalEdges(
    // First, we define the start node. We use `agent`.
    // This means these are the edges taken after the `agent` node is called.
    "agent",
    // Next, we pass in the function that will determine which node is called next.
    shouldContinue
  )
  // We now add a normal edge from `action` to `agent`.
  // This means that after `action` is called, `agent` node is called next.
  .addEdge("action", "agent")
  // After we get back the human response, we go back to the agent
  .addEdge("askHuman", "agent")
  // Set the entrypoint as `agent`
  // This means that this node is the first one called
  .addEdge(START, "agent");


// Setup memory
const messagesMemory = new MemorySaver();
//#endregion

//#region Finally, we compile it!
// This compiles it into a LangChain Runnable,
// meaning you can use it as you would any other runnable
export const waitUserInputGraph = messagesWorkflow.compile({
    checkpointer: messagesMemory,
    interruptBefore: ["askHuman"]
});

waitUserInputGraph.name = "09 waitUserInput";
//#endregion

//#region draw graph
import { saveGraphAsImage } from "drawGraph.js"
await saveGraphAsImage(waitUserInputGraph)
//#endregion