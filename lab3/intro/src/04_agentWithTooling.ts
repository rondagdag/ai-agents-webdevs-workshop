import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { AIMessage, AIMessageChunk, HumanMessage } from '@langchain/core/messages'
import {
  Annotation,
  END,
  MemorySaver,
  START,
  StateGraphArgs,
} from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";

const tools = [new TavilySearchResults({ maxResults: 1 })]
const toolNode = new ToolNode(tools)

const model = new ChatOpenAI({ temperature: 0 }).bindTools(tools)

// define the function that detemines whether to continue or not
function shouldContinue(state: typeof MessagesAnnotation.State): 'tools' | typeof END {
  const { messages } = state
  const lastMessage = messages[messages.length - 1] as AIMessage
  if (lastMessage.tool_calls) {
    return 'tools'
  }
  return END
}

interface CallModelI {
  messages: AIMessageChunk[]
}

// define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State): Promise<CallModelI> {
  const response = await model.invoke(state.messages)
  // we return a list because this will get added to the existing list
  return { messages: [response] }
}

// define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent')

//initialize memory to persist state between graph runs
const checkpointer = new MemorySaver()

// compile into a langchain runnable
export const agentWithToolingGraph = workflow.compile({ checkpointer })

agentWithToolingGraph.name = "Agent With Tooling";
