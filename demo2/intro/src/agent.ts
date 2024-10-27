import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// const llm = new ChatOpenAI({
//   model: "gpt-4o",
//   temperature: 0,
// });

import { initChatModel } from "langchain/chat_models/universal";

// const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });

const model = await initChatModel("gpt-4", {
  modelProvider: "azure_openai",
  temperature: 0,
});

// const model = await initChatModel("gpt-4", {
//   modelProvider: "openai",
//   temperature: 0,
// });

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
    // LLM did not call any tools, or it's not an AI message, so we should end.
    return END;
  }
  return "tools";
};

/**
 * MessagesAnnotation is a pre-built state annotation imported from @langchain/langgraph.
 * It is the same as the following annotation:
 *
 * ```typescript
 * const MessagesAnnotation = Annotation.Root({
 *   messages: Annotation<BaseMessage[]>({
 *     reducer: messagesStateReducer,
 *     default: () => [systemMessage],
 *   }),
 * });
 * ```
 */
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END]);

export const graph = workflow.compile({
  // The LangGraph Studio/Cloud API will automatically add a checkpointer
  // only uncomment if running locally
  //checkpointer: new MemorySaver(),
});

// Now it's time to use!
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
