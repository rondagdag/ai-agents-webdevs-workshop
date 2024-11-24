
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import "dotenv/config";

//#region model
import { embeddings } from "embeddings.js";
import { model } from "model.js"

//#endregion

//#region Retriever

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { AzureOpenAIEmbeddings, OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import fs from 'fs';
import path from 'path';

const indexPath = path.resolve("./rag.index");
let vectorStore;

if (fs.existsSync(indexPath)) {
  vectorStore = await FaissStore.load(indexPath, embeddings);
} else {

  const urls = [
    "https://en.wikipedia.org/wiki/Among_Us",
    //"https://among-us.fandom.com/wiki/Among_Us"
    // "https://lilianweng.github.io/posts/2023-06-23-agent/",
    // "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
    // "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
  ];
  
  const docs = await Promise.all(
    urls.map((url) => new CheerioWebBaseLoader(url).load()),
  );
  const docsList = docs.flat();
  
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const docSplits = await textSplitter.splitDocuments(docsList);
  
  // Add to vectorDB
  // const vectorStore = await MemoryVectorStore.fromDocuments(
  //   docSplits,
  //   new OpenAIEmbeddings(),
  // );

  vectorStore = await FaissStore.fromDocuments(
    docSplits,
    new OpenAIEmbeddings(),
  );
  vectorStore.save(indexPath);
}

const retriever = vectorStore.asRetriever();

//#endregion

//#region agent state
import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// const GraphState = Annotation.Root({
//   messages: Annotation<BaseMessage[]>({
//     reducer: (x, y) => x.concat(y),
//     default: () => [],
//   })
// })

import { createRetrieverTool } from "langchain/tools/retriever";
import { ToolNode } from "@langchain/langgraph/prebuilt";

const tool = createRetrieverTool(
  retriever,
  {
    name: "retrieve_blog_posts",
    description:
      "Search and return information about Among Us Game",
  },
);
const tools = [tool];

const toolNode = new ToolNode<typeof MessagesAnnotation.State>(tools as any);
//#endregion

//#region Nodes

import { START, END } from "@langchain/langgraph";
import { pull } from "langchain/hub";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";
import { graph } from "agent.js";

/**
 * Decides whether the agent should retrieve more information or end the process.
 * This function checks the last message in the state for a function call. If a tool call is
 * present, the process continues to retrieve information. Otherwise, it ends the process.
 */
function shouldRetrieve(state: typeof MessagesAnnotation.State): string {
  const { messages } = state;
  console.log("---DECIDE TO RETRIEVE---");
  const lastMessage = messages[messages.length - 1];

  if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length) {
    console.log("---DECISION: RETRIEVE---");
    return "retrieve";
  }
  // If there are no tool calls then we finish.
  return END;
}

/**
 * Determines whether the Agent should continue based on the relevance of retrieved documents.
 * This function checks if the last message in the conversation is of type FunctionMessage, indicating
 * that document retrieval has been performed. It then evaluates the relevance of these documents to the user's
 * initial question using a predefined model and output parser. If the documents are relevant, the conversation
 * is considered complete. Otherwise, the retrieval process is continued.
 */
async function gradeDocuments(state: typeof MessagesAnnotation.State): Promise<Partial<typeof MessagesAnnotation.State>> {
  console.log("---GET RELEVANCE---");

  const { messages } = state;
  const tool = {
    name: "give_relevance_score",
    description: "Give a relevance score to the retrieved documents.",
    schema: z.object({
      binaryScore: z.string().describe("Relevance score 'yes' or 'no'"),
    })
  }

  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a grader assessing relevance of retrieved docs to a user question.
  Here are the retrieved docs:
  \n ------- \n
  {context} 
  \n ------- \n
  Here is the user question: {question}
  If the content of the docs are relevant to the users question, score them as relevant.
  Give a binary score 'yes' or 'no' score to indicate whether the docs are relevant to the question.
  Yes: The docs are relevant to the question.
  No: The docs are not relevant to the question.`,
  );

  const modelWithTools = model.bindTools([tool], {
    tool_choice: tool.name,
  });

  const chain = prompt.pipe(modelWithTools as any);

  const lastMessage = messages[messages.length - 1];

  const score = await chain.invoke({
    question: messages[0].content as string,
    context: lastMessage.content as string,
  });

  return {
    messages: [score as any]
  };
}

// Check the relevance of the previous LLM tool call.
function checkRelevance(state: typeof MessagesAnnotation.State): string {
  console.log("---CHECK RELEVANCE---");

  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (!("tool_calls" in lastMessage)) {
    throw new Error("The 'checkRelevance' node requires the most recent message to contain tool calls.")
  }
  const toolCalls = (lastMessage as AIMessage).tool_calls;
  if (!toolCalls || !toolCalls.length) {
    throw new Error("Last message was not a function message");
  }

  if (toolCalls[0].args.binaryScore === "yes") {
    console.log("---DECISION: DOCS RELEVANT---");
    return "yes";
  }
  console.log("---DECISION: DOCS NOT RELEVANT---");
  return "no";
}


/**
 * Invokes the agent model to generate a response based on the current state.
 * This function calls the agent model to generate a response to the current conversation state.
 * The response is added to the state's messages.
 */
async function agent(state: typeof MessagesAnnotation.State): Promise<Partial<typeof MessagesAnnotation.State>> {
  console.log("---CALL AGENT---");
  
  const { messages } = state;
  // Find the AIMessage which contains the `give_relevance_score` tool call,
  // and remove it if it exists. This is because the agent does not need to know
  // the relevance score.
  const filteredMessages = messages.filter((message) => {
    if ("tool_calls" in message && Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
      return message.tool_calls[0].name !== "give_relevance_score";
    }
    return true;
  });

  const modelWithTools = model.bindTools(tools);
  const response = await modelWithTools.invoke(filteredMessages);
  return {
    messages: [response],
  };
}

// Transform the query to produce a better question.
async function rewrite(state: typeof MessagesAnnotation.State): Promise<Partial<typeof MessagesAnnotation.State>> {
  console.log("---TRANSFORM QUERY---");

  const { messages } = state;
  const question = messages[0].content as string;
  const prompt = ChatPromptTemplate.fromTemplate(
    `Look at the input and try to reason about the underlying semantic intent / meaning. \n 
Here is the initial question:
\n ------- \n
{question} 
\n ------- \n
Formulate an improved question:`,
  );

  // Grader
  const response = await prompt.pipe(model as any).invoke({ question });
  return {
    messages: [response as any],
  };
}

// Generate answer
async function generate(state: typeof MessagesAnnotation.State): Promise<Partial<typeof MessagesAnnotation.State>> {
  console.log("---GENERATE---");
  
  const { messages } = state;
  const question = messages[0].content as string;
  // Extract the most recent ToolMessage
  const lastToolMessage = messages.slice().reverse().find((msg) => msg._getType() === "tool");
  if (!lastToolMessage) {
    throw new Error("No tool message found in the conversation history");
  }

  const docs = lastToolMessage.content as string;
  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  const ragChain = prompt.pipe(model as any);

  const response = await ragChain.invoke({
    context: docs,
    question,
  });

  //console.log(response)

  return {
    messages: [response as any],
  };
}

//#endregion

//#region graph

// Define the graph
const workflow = new StateGraph(MessagesAnnotation)
  // Define the nodes which we'll cycle between.
  .addNode("agent", agent)
  .addNode("retrieve", toolNode)
  .addNode("gradeDocuments", gradeDocuments)
  .addNode("rewrite", rewrite)
  .addNode("generate", generate);

  // Call agent node to decide to retrieve or not
  workflow.addEdge(START, "agent")  
  // Decide whether to retrieve
  .addConditionalEdges(
    "agent",
    // Assess agent decision
    shouldRetrieve,
  )
  .addEdge("retrieve", "gradeDocuments")
  
  // Edges taken after the `action` node is called.
  .addConditionalEdges(
    "gradeDocuments",
    // Assess agent decision
    checkRelevance,
    {
      // Call tool node
      yes: "generate",
      no: "rewrite", // placeholder
    },
  )
  .addEdge("generate", END)
  .addEdge("rewrite", "agent");
  
// Compile
export const ragGraph = workflow.compile();
ragGraph.name = "10 RAG";

//#endregion

//#region draw graph
import { saveGraphAsImage } from "drawGraph.js"
await saveGraphAsImage(ragGraph)

//#endregion