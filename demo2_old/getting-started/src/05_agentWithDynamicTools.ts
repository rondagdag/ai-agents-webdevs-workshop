import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { initChatModel } from "langchain/chat_models/universal";
import { z } from "zod";
import { tool } from "@langchain/core/tools";

// const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });

const model = await initChatModel("gpt-4", {
  modelProvider: "azure_openai",
  temperature: 0,
});

// const model = await initChatModel("gpt-3.5-turbo", {
//   modelProvider: "openai",
//   temperature: 0,
// });

const todayDateTimeSchema = z.object({
  timeZone: z.string().describe("Time Zone Format"),
  locale: z.string().describe("Locale string")
});

function getTodayDateTime({timeZone, locale}: { timeZone: string; locale: string }) {
  //const timeZone = 'America/Chicago';
  //const locale = 'en-US';
  const today = new Date();
  const formattedDate = today.toLocaleString(locale, {
      timeZone: timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  const result = {
      "formattedDate": formattedDate,
      "timezone": timeZone
  };
  console.log(result)
  return JSON.stringify(result);
}

const dateTool = tool(
  ({timeZone, locale}) => {
    return getTodayDateTime({timeZone, locale});
  },
  {
    name: "todays_date_time",
    description:
      "Useful to get current day, date and time.",
    schema: todayDateTimeSchema,
  }
);

console.log(await dateTool.invoke({timeZone: 'America/New_York', locale: 'en-US'}));

const tools = [dateTool];

const toolNode = new ToolNode(tools);

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;

  const llmWithTools = model.bindTools(tools);
  const result = await llmWithTools.invoke(messages);
  console.log(result);
  return { messages: [result] };
};

const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;

  const lastMessage = messages[messages.length - 1];
  if (
    lastMessage._getType() !== "ai" ||
    !(lastMessage as AIMessage).tool_calls?.length
  ) {
    // LLM did not call any tools, or it's not an AI message, so we should end.
    return END;
  }
  return "tools";
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END]);

export const agentWithDynamicToolsGraph = workflow.compile(
  // {
  //   checkpointer: new MemorySaver(),
  // }
)


agentWithDynamicToolsGraph.name = "Agent With Dynamic Tooling";
