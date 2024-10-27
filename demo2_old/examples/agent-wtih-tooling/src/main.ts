import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { AIMessageChunk, HumanMessage } from '@langchain/core/messages'
import {
  END,
  MemorySaver,
  START,
  StateGraph,
  StateGraphArgs,
} from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'

// Define the AgentState interface
interface AgentState {
  messages: HumanMessage[]
}

// Define the graph state
const graphState: StateGraphArgs<AgentState>['channels'] = {
  messages: {
    value: (x: HumanMessage[], y: HumanMessage[]) => x.concat(y),
    default: () => [],
  },
}

const tools = [new TavilySearchResults({ maxResults: 1 })]
const toolNode = new ToolNode<AgentState>(tools)

const model = new ChatOpenAI({ temperature: 0 }).bindTools(tools)

// define the function that detemines whether to continue or not
function shouldContinue(state: AgentState): 'tools' | typeof END {
  const { messages } = state
  const lastMessage = messages[messages.length - 1]
  if (lastMessage.additional_kwargs?.tool_calls) {
    return 'tools'
  }
  return END
}

interface CallModelI {
  messages: AIMessageChunk[]
}

// define the function that calls the model
async function callModel(state: AgentState): Promise<CallModelI> {
  const { messages } = state
  const response = await model.invoke(messages)
  // we return a list because this will get added to the existing list
  return { messages: [response] }
}

// define a new graph
const workflow = new StateGraph<AgentState>({ channels: graphState })
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent')

//initialize memory to persist state between graph runs
const checkpointer = new MemorySaver()

// compile into a langchain runnable
const app = workflow.compile({ checkpointer })

async function main() {
  const finalState = await app.invoke(
    { messages: [new HumanMessage('What is the weather in SF')] },
    { configurable: { thread_id: '42' } }
  )
  console.log(finalState.messages[finalState.messages.length - 1].content)
}

// run main
main()
