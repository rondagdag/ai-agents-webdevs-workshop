import {
  AIMessage,
  AIMessageChunk,
  BaseMessage,
  MessageContent,
} from '@langchain/core/messages'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'
import { Runnable, RunnableConfig } from '@langchain/core/runnables'
import { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import { ChatGenerationChunk } from '@langchain/core/outputs'
import { StreamEvent } from '@langchain/core/tracers/log_stream'

interface IState {
  messages: BaseMessage[]
}
// this defines the agent state
const graphState: StateGraphArgs<IState>['channels'] = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [] as BaseMessage[],
  },
}

const searchTool = new DynamicStructuredTool({
  name: 'search',
  description:
    'Use to surf the web, fetch current information, check the weather, and retrieve other information.',
  schema: z.object({
    query: z.string().describe('The query to use in your search.'),
  }),
  func: async ({ query }: { query: string }) => {
    // This is a placeholder for the actual implementation
    return 'Cold, with a low of 3℃'
  },
})

const model = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0,
  streaming: true,
})
let boundModel: Runnable<
  BaseLanguageModelInput,
  AIMessageChunk,
  RunnableConfig
> | null = null

// function to route message. Either to END node or to the tools node
const routeMessage = (state: IState) => {
  const { messages } = state
  const lastMessage = messages[messages.length - 1] as AIMessage
  // If no tools are called, we can finish (respond to the user)
  if (!lastMessage?.tool_calls?.length) {
    console.log('returning END')
    return 'finish'
  }
  // Otherwise if there is, we continue and call the tools
  console.log('returning tools')
  return 'tools'
}

interface CallModelI {
  messages: AIMessageChunk[]
}

const callModel = async (
  state: IState,
  config?: RunnableConfig
): Promise<CallModelI> => {
  const { messages } = state
  // console.log('messages', messages)
  const streamOut = await boundModel?.stream(messages, config)
  let finalMessage: AIMessageChunk | null = null
  if (!streamOut) {
    return { messages: [] }
  }
  for await (const chunk of streamOut) {
    if (finalMessage === null) {
      finalMessage = chunk
    } else {
      finalMessage = finalMessage.concat(chunk)
    }
  }
  return { messages: finalMessage ? [finalMessage] : [] }
}

// await searchTool.invoke({ query: "What's the weather like?" })
const tools = [searchTool]
const toolNode = new ToolNode<{ messages: BaseMessage[] }>(tools)
boundModel = model.bindTools(tools)

const workflow = new StateGraph<IState>({
  channels: graphState,
})
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeMessage, { finish: END, tools: 'tools' })
  .addEdge('tools', 'agent')

const agent = workflow.compile()

interface ConfigI {
  configurable: {
    thread_id: string
  }
}

interface GenerateMessagesInputI {
  messages: string[][]
}

async function* generateMessages(
  messages: GenerateMessagesInputI,
  config: ConfigI
): AsyncGenerator<MessageContent> {
  for await (const event of await agent.streamEvents(messages, {
    ...config,
    streamMode: 'values',
    version: 'v2',
  })) {
    const eventName = event.event
    switch (eventName) {
      case 'on_chat_model_stream': {
        let msg = event.data?.chunk as AIMessageChunk
        if (msg.tool_call_chunks && msg.tool_call_chunks.length > 0) {
          // console.log(msg.tool_call_chunks)
        } else {
          yield msg.content
        }
        break
      }
      case 'on_tool_start': {
        console.log('tool start', event.name)
        break
      }
      case 'on_tool_end': {
        console.log('tool end', event.data)
        break
      }
      default: {
        // console.log('event', eventName)
        break
      }
    }
  }
}

async function runExample() {
  let config = { configurable: { thread_id: 'conversation-num-1' } }
  let inputs = { messages: [['user', 'What is the weather in SF?']] }
  // let inputs = { messages: [['user', 'Hi, my name is Joe']] }
  for await (const message of generateMessages(inputs, config)) {
    console.log(message)
  }
}

// run this example
runExample()
