import { ChatOpenAI } from '@langchain/openai'
import { BaseMessage, HumanMessage } from '@langchain/core/messages'
import { START, END, MessageGraph } from '@langchain/langgraph'

const model = new ChatOpenAI({ temperature: 0 })
const graph = new MessageGraph()
  .addNode('sammy', async (state: BaseMessage[]) => {
    return model.invoke(state)
  })
  .addEdge('sammy', END)
  .addEdge(START, 'sammy')

const runnable = graph.compile()

async function runExample() {
  
  const result = await runnable.invoke(
    new HumanMessage('Hello, what is 1 + 1?')
  )
  console.log(result)
}

runExample()
