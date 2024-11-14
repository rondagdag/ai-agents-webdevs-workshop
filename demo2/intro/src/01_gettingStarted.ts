
import { promises as fs } from 'fs';
import { BaseMessage, HumanMessage } from '@langchain/core/messages'
import { START, END, StateGraph, MessagesAnnotation } from '@langchain/langgraph'

import { model } from "model.js"


//#region nodes and edges
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const result = await model.invoke(messages);
  return { messages: [result] };
};
//#endregion

//#region graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addEdge("agent", END);

export const gettingStartedGraph = workflow.compile()

gettingStartedGraph.name = "01 Getting Started";

//#endregion

//#region draw graph
import { saveGraphAsImage } from "drawGraph.js"
await saveGraphAsImage(gettingStartedGraph)
//#endregion