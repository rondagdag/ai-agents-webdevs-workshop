import {
  HumanMessage,
  AIMessage,
  AIMessageChunk,
} from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph'
import { MemorySaver } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { TavilySearchResults } from '@langchain/community/tools/tavily_search'

// Define the state interface
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

// Define the tools for the agent to use

const searchTool = new DynamicStructuredTool({
  name: 'search',
  description: 'Call to surf the web.',
  schema: z.object({
    query: z.string().describe('The query to use in your search.'),
  }),
  func: async ({ query }: { query: string }) => {
    // This is a placeholder for the actual implementation
    if (
      query.toLowerCase().includes('sf') ||
      query.toLowerCase().includes('san francisco')
    ) {
      return "It's 60 degrees and foggy."
    }
    return "It's 90 degrees and sunny."
  },
})

const tools = [new TavilySearchResults({ maxResults: 1 })]
const toolNode = new ToolNode<AgentState>(tools)

// calling the Anthropic model will not work when there is a tool bound
// to it. See this issue for more details: https://github.com/langchain-ai/langgraphjs/issues/253#issuecomment-2223712378
const model = new ChatAnthropic({
  model: 'claude-3-sonnet-20240229',
  temperature: 0,
  streaming: true,
}).bindTools(tools)
// const model = new ChatOpenAI({
//   model: 'gpt-4o',
//   temperature: 0,
//   streaming: true,
// }).bindTools(tools)

// Define the function that determines whether to continue or not
function shouldContinue(state: AgentState): 'tools' | typeof END {
  const messages = state.messages
  const lastMessage = messages[messages.length - 1] as AIMessage

  // If the LLM makes a tool call, then we route to the "tools" node
  // if (lastMessage.additional_kwargs.tool_calls) {
  if (lastMessage.tool_calls?.length) {
    return 'tools'
  }
  // Otherwise, we stop (reply to the user)
  return END
}

// Define the function that calls the model
async function callModel(state: AgentState) {
  const messages = state.messages
  const response = await model.invoke(messages)

  // We return a list, because this will get added to the existing list
  return { messages: [response] }
}

// Define a new graph
const workflow = new StateGraph<AgentState>({ channels: graphState })
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent')

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver()

// Finally, we compile it!
// This compiles it into a LangChain Runnable.
// Note that we're (optionally) passing the memory when compiling the graph
const app = workflow.compile({ checkpointer })

async function main() {
  let config = { configurable: { thread_id: 'conversation-num-1' } }
  let inputs = { messages: [new HumanMessage('Hello. My name is Joe')] }
  for await (const event of await app.streamEvents(inputs, {
    ...config,
    streamMode: 'values',
    version: 'v2',
  })) {
    console.log('event', event.event)
    if (event.event === 'on_chat_model_stream') {
      let msg = event.data?.chunk as AIMessageChunk
      if (msg.tool_call_chunks && msg.tool_call_chunks.length > 0) {
        console.log(msg.tool_call_chunks)
      } else {
        console.log(msg.content)
      }
    }
  }
}

main()
