// import "dotenv/config";
// import { Annotation } from "@langchain/langgraph";
// import { ChatPromptTemplate } from "@langchain/core/prompts";

// import { initChatModel } from "langchain/chat_models/universal";

// //#region "planner"

// // const model = await initChatModel("llama3.2", {
// //   modelProvider: "ollama",
// //   temperature: 0,
// // });

// // const model = await initChatModel("gpt-4", {
// //   modelProvider: "azure_openai",
// //   temperature: 0,
// // });

// const model = await initChatModel("gpt-4", {
//   modelProvider: "openai",
//   temperature: 0,
// });

// const PlanExecuteState = Annotation.Root({
//   input: Annotation({
//     reducer: (x, y) => y ?? x ?? "",
//   }),
//   plan: Annotation<string[]>({
//     reducer: (x, y) => y ?? x ?? [],
//   }),
//   pastSteps: Annotation<[string, string][]>({
//     reducer: (x, y) => x.concat(y),
//   }),
//   response: Annotation({
//     reducer: (x, y) => y ?? x,
//   }),
// })


// import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// const tools = [new TavilySearchResults({ maxResults: 3 })];


// import { createReactAgent } from "@langchain/langgraph/prebuilt";

// const agentExecutor = createReactAgent({
//   llm: model,
//   tools: tools,
// });

// import { HumanMessage } from "@langchain/core/messages";

// const agentExecutorResult = await agentExecutor.invoke({
//   messages: [new HumanMessage("who is the winner of the us open")],
// });

// console.log(agentExecutorResult);

// import { z } from "zod";
// import { zodToJsonSchema } from "zod-to-json-schema";

// const plan = zodToJsonSchema(
//   z.object({
//     steps: z
//       .array(z.string())
//       .describe("different steps to follow, should be in sorted order"),
//   }),
// );
// const planFunction = {
//   name: "plan",
//   description: "This tool is used to plan the steps to follow",
//   parameters: plan,
// };

// const planTool = {
//   type: "function",
//   function: planFunction,
// };

// import { ChatPromptTemplate } from "@langchain/core/prompts";

// const plannerPrompt = ChatPromptTemplate.fromTemplate(
//   `For the given objective, come up with a simple step by step plan. \
// This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps. \
// The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.

// {objective}`,
// );

// const newModel = model.withStructuredOutput(planFunction);

// const planner = plannerPrompt.pipe(newModel);

// const result = await planner.invoke({
//   objective: "what is the hometown of the current Australia open winner?",
// });

// console.log(result);

// import { JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";

// const response = zodToJsonSchema(
//   z.object({
//     response: z.string().describe("Response to user."),
//   }),
// );

// const responseTool = {
//   type: "function",
//   function: {
//     name: "response",
//     description: "Response to user.",
//     parameters: response,
//   },
// };

// const replannerPrompt = ChatPromptTemplate.fromTemplate(
//   `For the given objective, come up with a simple step by step plan. 
// This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps.
// The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.

// Your objective was this:
// {input}

// Your original plan was this:
// {plan}

// You have currently done the follow steps:
// {pastSteps}

// Update your plan accordingly. If no more steps are needed and you can return to the user, then respond with that and use the 'response' function.
// Otherwise, fill out the plan.  
// Only add steps to the plan that still NEED to be done. Do not return previously done steps as part of the plan.`,
// );

// const parser = new JsonOutputToolsParser();
// const replanner = replannerPrompt
//   .pipe(
//     (model as any).bindTools([
//       planTool,
//       responseTool,
//     ]),
//   )
//   .pipe(parser);

//   import { END, START, StateGraph } from "@langchain/langgraph";
//   import { RunnableConfig } from "@langchain/core/runnables";
  
//   async function executeStep(
//     state: typeof PlanExecuteState.State,
//     config?: RunnableConfig,
//   ): Promise<{ pastSteps: [string, string][], plan: string[] }> {
//     const task = state.plan[0];
//     const input = {
//       messages: [new HumanMessage(task)],
//     };
//     const { messages } = await agentExecutor.invoke(input, config);
  
//     return {
//       pastSteps: [[task, messages[messages.length - 1].content.toString()]],
//       plan: state.plan.slice(1),
//     };
//   }
  
//   async function planStep(
//     state: typeof PlanExecuteState.State,
//   ): Promise<{ plan: string[] }> {
//     const plan = await planner.invoke({ objective: state.input });
//     console.log(plan);
//     return { plan: plan.steps };
//   }
  
//   async function replanStep(
//     state: typeof PlanExecuteState.State,
//   ): Promise<{ plan?: string[], response?: string }> {
//     const output = await replanner.invoke({
//       input: state.input,
//       plan: state.plan.join("\n"),
//       pastSteps: state.pastSteps
//         .map(([step, result]) => `${step}: ${result}`)
//         .join("\n"),
//     });
//     const toolCall = output[0];
  
//     if (toolCall.type == "response") {
//       return { response: toolCall.args?.response };
//     }
  
//     return { plan: toolCall.args?.steps };
//   }
  
//   function shouldEnd(state: typeof PlanExecuteState.State) {
//     return state.response ? "true" : "false";
//   }
  
//   const workflow = new StateGraph(PlanExecuteState)
//     .addNode("planner", planStep)
//     .addNode("agent", executeStep)
//     .addNode("replan", replanStep)
//     .addEdge(START, "planner")
//     .addEdge("planner", "agent")
//     .addEdge("agent", "replan")
//     .addConditionalEdges("replan", shouldEnd, {
//       true: END,
//       false: "agent",
//     });
  
//   // Finally, we compile it!
//   // This compiles it into a LangChain Runnable,
//   // meaning you can use it as you would any other runnable
//   const app = workflow.compile();

//   const config = { recursionLimit: 10 };
// const inputs = {
//   input: "what is the hometown of the 2024 Australian open winner?",
// };

// for await (const event of await app.stream(inputs, config)) {
//   console.log(event);
// }