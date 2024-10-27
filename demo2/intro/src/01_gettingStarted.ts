
import { promises as fs } from 'fs';
import { BaseMessage, HumanMessage } from '@langchain/core/messages'
import { START, END, StateGraph, MessagesAnnotation } from '@langchain/langgraph'

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

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const result = await model.invoke(messages);
  return { messages: [result] };
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addEdge("agent", END);

export const gettingStartedGraph = workflow.compile()

gettingStartedGraph.name = "01 Getting Started";

//draw graph
import { saveGraphAsImage } from "drawGraph.js"
await saveGraphAsImage(gettingStartedGraph)