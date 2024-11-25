
// code here

import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
END,
  MemorySaver,
MessagesAnnotation,
START,
StateGraph,
} from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import { model } from "model.js"


const webSearchTool = new TavilySearchResults({
  maxResults: 4,
});
const tools = [webSearchTool];

const toolNode = new ToolNode(tools as any);

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;

  const llmWithTools = model.bindTools(tools);
  const result = await llmWithTools.invoke(messages);
  return { messages: [result] };

};

const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;

  const lastMessage = messages[messages.length - 1];
  if (
     lastMessage._getType() !== "ai" ||
     !(lastMessage as AIMessage).tool_calls?.length
  ) {
     return END;
  }
  return "tools";
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END]);

export const graph = workflow.compile({
  // Uncomment if running locally
  checkpointer: new MemorySaver(),
});
graph.name = "graph";


import { saveGraphAsImage } from "drawGraph.js"
await saveGraphAsImage(graph)


const agentFinalState = await graph.invoke(
  { messages: [new HumanMessage("what is the current weather in sf")] },
  { configurable: { thread_id: "42" } },
);

console.log(
  agentFinalState.messages[agentFinalState.messages.length - 1].content,
);

const agentNextState = await graph.invoke(
  { messages: [new HumanMessage("what about ny")] },
  { configurable: { thread_id: "42" } },
);

console.log(
  agentNextState.messages[agentNextState.messages.length - 1].content,
);