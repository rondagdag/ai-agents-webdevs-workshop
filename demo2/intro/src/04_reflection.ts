import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, StateGraph, START, Annotation } from "@langchain/langgraph";

//#region model
import { initChatModel } from "langchain/chat_models/universal";

//#region model
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

//#region nodes and edges
//Easy Generation Chain

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an essay assistant tasked with writing excellent 5-paragraph essays.
Generate the best essay possible for the user's request.  
If the user provides critique, respond with a revised version of your previous attempts.`,
  ],
  new MessagesPlaceholder("messages"),
]);

const essayGenerationChain = prompt.pipe(model as any);


// Define the top-level State interface
const State = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  })
})

const generationNode = async (state: typeof State.State) => {
  const { messages } = state;
  return {
    messages: [await essayGenerationChain.invoke({ messages })],
  };
};

const reflectionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a teacher grading an essay submission.
Generate critique and recommendations for the user's submission.
Provide detailed recommendations, including requests for length, depth, style, etc.`,
  ],
  new MessagesPlaceholder("messages"),
]);

const reflect = reflectionPrompt.pipe(model as any);

const reflectionNode = async (state: typeof State.State) => {
  const { messages } = state;
  // Other messages we need to adjust
  const clsMap: { [key: string]: new (content: string) => BaseMessage } = {
    ai: HumanMessage,
    human: AIMessage,
  };
  // First message is the original user request. We hold it the same for all nodes
  const translated = [
    messages[0],
    ...messages
      .slice(1)
      .map((msg) => new clsMap[msg._getType()](msg.content.toString())),
  ];
  const res : any = await reflect.invoke({ messages: translated });
  // We treat the output of this as human feedback for the generator
  console.log(res.content);
  return {
    messages: [new HumanMessage({ content: res.content })],
  };
};


const shouldContinue = (state: typeof State.State) => {
  const { messages } = state;
  if (messages.length > 2) {
    // End state after 3 iterations
    return END;
  }
  return "reflect";
};

//#endregion

//#region Define the graph
const workflow = new StateGraph(State)
  .addNode("generate", generationNode)
  .addNode("reflect", reflectionNode)
  .addEdge(START, "generate");
  
workflow
  .addConditionalEdges("generate", shouldContinue)
  .addEdge("reflect", "generate");

export const reflectionGraph =  workflow.compile();
reflectionGraph.name = "04 Reflection"
//#endregion

//#region draw graph
import { saveGraphAsImage } from "drawGraph.js"
await saveGraphAsImage(reflectionGraph)
//#endregion