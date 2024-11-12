import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph} from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { StructuredTool } from "@langchain/core/tools";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

//#region "model"
import { model } from "model.js"
//#endregion

//#region tools
const webSearchTool = new TavilySearchResults({
  maxResults: 4,
});
const tools = [webSearchTool];

//const duckDuckGoTool = new DuckDuckGoSearch({ maxResults: 4 });
//const tools = [duckDuckGoTool];

const toolNode = new ToolNode(tools as any);
//#endregion

//#region model node
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;

  const llmWithTools = model.bindTools(tools);
  const result = await llmWithTools.invoke(messages);
  return { messages: [result] };
};
//#endregion

//#region should continue node
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
//#endregion

//#region define graph
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

export const agentWithToolingGraph = workflow.compile({
  // The LangGraph Studio/Cloud API will automatically add a checkpointer
  // only uncomment if running locally
  checkpointer: new MemorySaver(),
});

agentWithToolingGraph.name = "05 Agent With Tooling"
//#endregion

//#region draw graph
import { saveGraphAsImage } from "drawGraph.js"
await saveGraphAsImage(agentWithToolingGraph)
//#endregion