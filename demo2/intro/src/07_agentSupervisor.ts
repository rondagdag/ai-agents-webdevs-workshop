import "dotenv/config";
import { Annotation } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { initChatModel } from "langchain/chat_models/universal";

//#region "planner"

// const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });

// const model = await initChatModel("gpt-4", {
//   modelProvider: "azure_openai",
//   temperature: 0,
// });

const model = await initChatModel("gpt-4", {
  modelProvider: "openai",
  temperature: 0,
});

import { END, Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// This defines the object that is passed between each node
// in the graph. We will create different nodes for each agent and tool
const AgentState = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  // The agent node that last performed work
  next: Annotation({
    reducer: (x, y) => y ?? x ?? END,
    default: () => END,
  }),
});

//require("esm-hook"); // Only for running this in TSLab. See: https://github.com/yunabe/tslab/issues/72
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { DynamicStructuredTool } from "@langchain/core/tools";
import * as d3 from "d3";
// ----------ATTENTION----------
// If attempting to run this notebook locally, you must follow these instructions
// to install the necessary system dependencies for the `canvas` package.
// https://www.npmjs.com/package/canvas#compiling
// -----------------------------
import { createCanvas } from "canvas";
import { z } from "zod";
import * as tslab from "tslab";

const chartTool = new DynamicStructuredTool({
  name: "generate_bar_chart",
  description:
    "Generates a bar chart from an array of data points using D3.js and displays it for the user.",
  schema: z.object({
    data: z
      .object({
        label: z.string(),
        value: z.number(),
      })
      .array(),
  }),
  func: async ({ data }) => {
    const width = 500;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const colorPalette = [
      "#e6194B",
      "#3cb44b",
      "#ffe119",
      "#4363d8",
      "#f58231",
      "#911eb4",
      "#42d4f4",
      "#f032e6",
      "#bfef45",
      "#fabebe",
    ];

    data.forEach((d, idx) => {
      ctx.fillStyle = colorPalette[idx % colorPalette.length];
      ctx.fillRect(
        x(d.label) ?? 0,
        y(d.value),
        x.bandwidth(),
        height - margin.bottom - y(d.value),
      );
    });

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    x.domain().forEach((d) => {
      const xCoord = (x(d) ?? 0) + x.bandwidth() / 2;
      ctx.fillText(d, xCoord, height - margin.bottom + 6);
    });

    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const ticks = y.ticks();
    ticks.forEach((d) => {
      const yCoord = y(d); // height - margin.bottom - y(d);
      ctx.moveTo(margin.left, yCoord);
      ctx.lineTo(margin.left - 6, yCoord);
      ctx.stroke();
      ctx.fillText(d.toString(), margin.left - 8, yCoord);
    });
    await tslab.display.png(canvas.toBuffer());
    return "Chart has been generated and displayed to the user!";
  },
});

const tavilyTool = new TavilySearchResults();

import { z } from "zod";
import { JsonOutputToolsParser } from "langchain/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

const members = ["researcher", "chart_generator"] as const;

const systemPrompt =
  "You are a supervisor tasked with managing a conversation between the" +
  " following workers: {members}. Given the following user request," +
  " respond with the worker to act next. Each worker will perform a" +
  " task and respond with their results and status. When finished," +
  " respond with FINISH.";
const options = [END, ...members];

// Define the routing function
const routingTool = {
  name: "route",
  description: "Select the next role.",
  schema: z.object({
    next: z.enum([END, ...members]),
  }),
}

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  new MessagesPlaceholder("messages"),
  [
    "system",
    "Given the conversation above, who should act next?" +
    " Or should we FINISH? Select one of: {options}",
  ],
]);

const formattedPrompt = await prompt.partial({
  options: options.join(", "),
  members: members.join(", "),
});

const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
});

const supervisorChain = formattedPrompt
  .pipe(llm.bindTools(
    [routingTool],
    {
      tool_choice: "route",
    },
  ))
  .pipe(new JsonOutputToolsParser())
  // select the first one
  .pipe((x) => (x[0].args));


import { HumanMessage } from "@langchain/core/messages";

await supervisorChain.invoke({
  messages: [
    new HumanMessage({
      content: "write a report on birds.",
    }),
  ],
});