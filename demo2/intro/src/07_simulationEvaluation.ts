import "dotenv/config";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { initChatModel } from "langchain/chat_models/universal";
import { StateGraph, END, START } from "@langchain/langgraph";

//#region "model"

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

//#endregion

//#region define chatbot

async function myChatBot(messages: BaseMessageLike[]): Promise<AIMessageChunk> {
  const systemMessage = {
    role: 'system',
    content: `You are playing Among Us game. You are the imposter. Don't tell anyone. Just pretend you are someone else`,
  };
  const allMessages = [systemMessage, ...messages];
  
  const response = await model.invoke(allMessages)
  return response
}

// Test the chat bot
//const response = await myChatBot([{ role: 'user', content: 'hi!' }]);
//console.log(response);

//#endregion

//#region define simulated user
import { type Runnable } from "@langchain/core/runnables";
import { AIMessage, AIMessageChunk, BaseMessageLike } from "@langchain/core/messages";

async function createSimulatedUser(): Promise<Runnable<{ messages: BaseMessageLike[] }, AIMessage>> {
    const systemPromptTemplate = `You are playing Among Us game. You are the imposter. You are interacting with another player user who is trying to identify the imposter 
    
{instructions}

If you have nothing more to add to the conversation, you must respond only with a single word: "FINISHED"`;
    
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPromptTemplate],
      ["placeholder", '{messages}'],
    ]);
    
    const instructions = `Your name is Silent. You are trying to identify the imposter in the game. Be extremely persistent. Ask relevant questions from the conversation`;

    const partialPrompt = await prompt.partial({ instructions });
    
    const simulatedUser = partialPrompt.pipe(model as any);
    return simulatedUser;
}

// Test the simulated user
// const messages = [{role: "user", content: 'Hi! How can I help you?'}];
// const simulatedUser = await createSimulatedUser()
// const simulatedUserResponse = await simulatedUser.invoke({ messages });
// console.log(simulatedUserResponse);

//#endregion

//#region define agent simulation
// The code below creates a LangGraph workflow to run the simulation. The main components are:

// 1. The two nodes: one for the simulated user, the other for the chat bot.
// 2. The graph itself, with a conditional stopping criterion.

import { MessagesAnnotation } from "@langchain/langgraph";

async function chatBotNode (state: typeof MessagesAnnotation.State) {
  const messages = state.messages
  const chatBotResponse = await myChatBot(messages);
  return { messages: [chatBotResponse] }
}

import { BaseMessage, HumanMessage } from "@langchain/core/messages";

// MessagesAnnotation coerces all message likes to base message classes
function swapRoles(messages: BaseMessage[]) {
  return messages.map((m) =>
    m instanceof AIMessage
      ? new HumanMessage({ content: m.content })
      : new AIMessage({ content: m.content }),
  )
}

async function simulatedUserNode (state: typeof MessagesAnnotation.State) {
  const messages = state.messages
  const newMessages = swapRoles(messages)
  // This returns a runnable directly, so we need to use `.invoke` below:
  const simulateUser = await createSimulatedUser();
  const response = await simulateUser.invoke({ messages: newMessages })

  return { messages: [{ role: "user", content: response.content }] }
}

//edge
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  if (messages.length > 6) {
    return '__end__';
  } else if (messages[messages.length - 1].content === 'FINISHED') {
    return '__end__';
  } else {
    return 'continue';
  }
}

//#endregion

//#region define graph

const workflow = new StateGraph(MessagesAnnotation)
    .addNode('user', simulatedUserNode)
    .addNode('chatbot', chatBotNode)
    .addEdge('chatbot', 'user')
    .addConditionalEdges('user', shouldContinue, {
      [END]: END,
      continue: 'chatbot',
    })
    .addEdge(START, 'chatbot')

export const simulationGraph = workflow.compile()
simulationGraph.name = "07 simulation";
//#endregion

//#region draw graph
import { saveGraphAsImage } from "drawGraph.js"
await saveGraphAsImage(simulationGraph)

// for await (const chunk of await simulationGraph.stream({})) {
//   const nodeName = Object.keys(chunk)[0];
//   const messages = chunk[nodeName].messages;
//   console.log(`${nodeName}: ${messages[0].content}`);
//   console.log('\n---\n');
// }

//#endregion