import "dotenv/config";


import { Calculator } from "@langchain/community/tools/calculator";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

import { createToolCallingAgent } from "langchain/agents";

import { AgentExecutor } from "langchain/agents";

import { initChatModel } from "langchain/chat_models/universal";

// const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });

const model = await initChatModel("gpt-4", {
  modelProvider: "openai",
  temperature: 0,
});

const todayDateTimeSchema = z.object({
  timeZone: z.string().describe("Time Zone Format"),
  locale: z.string().describe("Locale string")
});

function getTodayDateTime({timeZone, locale}) {
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

const tools = [new Calculator(), dateTool];

const llmWithTools = model.bindTools(tools);

const res = await llmWithTools.invoke("What is 3 * 12? What is today?");

console.log(res);

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are very powerful assistant"],
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

const agent = await createToolCallingAgent({ llm: model, tools, prompt });

const executor = new AgentExecutor({
  agent,
  tools,
});

const input = "What is 3 * 12? What is today?";
const result = await executor.invoke({
  input,
});

console.log(result);



