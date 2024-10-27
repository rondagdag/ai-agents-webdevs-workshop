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

// const model = await initChatModel("gpt-4o", {
//   modelProvider: "openai",
//   temperature: 0,
// });

// const GraphState = Annotation.Root({
//   task: Annotation<string>({
//     reducer: (x, y) => (y ?? x),
//     default: () => "",
//   }),
//   planString: Annotation<string>({
//     reducer: (x, y) => (y ?? x),
//     default: () => "",
//   }),
//   steps: Annotation<string[][]>({
//     reducer: (x, y) => x.concat(y),
//     default: () => [],
//   }),
//   results: Annotation<Record<string, any>>({
//     reducer: (x, y) => ({ ...x, ...y }),
//     default: () => ({}),
//   }),
//   result: Annotation<string>({
//     reducer: (x, y) => (y ?? x),
//     default: () => "",
//   }),
// })


// const template =
//   `For the following task, make plans that can solve the problem step by step. For each plan, indicate which external tool together with tool input to retrieve evidence. You can store the evidence into a variable #E that can be called by later tools. (Plan, #E1, Plan, #E2, Plan, ...)

// Tools can be one of the following:
// (1) Google[input]: Worker that searches results from Google. Useful when you need to find short and succinct answers about a topic. The input should be a search query. 
// (2) LLM[input]: A pre-trained LLM like yourself. Useful when you need to act with general world knowledge and common sense. Prioritize it when you are confident in solving the problem yourself. Input can be any instruction including search results. 

// For example,
// Task: Thomas, Toby, and Rebecca worked a total of 157 hours in one week. Thomas worked x hours. Toby worked 10 hours less than twice what Thomas worked, and Rebecca worked 8 hours less than Toby. How many hours did Rebecca work? 
// Plan: Given Thomas worked x hours, translate the problem into algebraic expressions and solve with Wolfram Alpha.
// #E1 = WolframAlpha[Solve x + (2x - 10) + ((2x - 10) - 8) = 157]
// Plan: Find out the number of hours Thomas worked.
// #E2 = LLM[What is x, given #E1]
// Plan: Calculate the number of hours Rebecca worked.
// #E3 = Calculator[(2 * #E2 - 10) - 8]

// Important!
// Variables/results MUST be referenced using the # symbol!
// The plan will be executed as a program, so no coreference resolution apart from naive variable replacement is allowed.
// The ONLY way for steps to share context is by including #E within the arguments of the tool.

// Begin! 
// Describe your plans with rich details. Each Plan should be followed by only one #E.

// Task: {task}`;

// const promptTemplate = ChatPromptTemplate.fromMessages([["human", template]]);

// const planner = promptTemplate.pipe(model);

// const task = "what is the hometown of the winner of the 2023 australian open?";
// const result = await planner.invoke({ task });
// console.log(result);

// //#endregion "planner

// //#region "planner node"
// import { RunnableConfig } from "@langchain/core/runnables";

// const regexPattern = new RegExp(
//   "Plan:\\s*(.*?)\\s*(#E\\d+)\\s*=\\s*(\\w+)\\[([^\\]]+?)\\]",
//   "g",
// );

// async function getPlan(state: typeof GraphState.State, config?: RunnableConfig) {
//   console.log("---GET PLAN---");
//   const task = state.task;
//   const result = await planner.invoke({ task }, config);
//   console.log(result.content.toString());
//   // Find all matches in the sample text.
//   const matches = result.content.toString().matchAll(regexPattern);
//   let steps: string[][] = [];
//   for (const match of matches) {
//     const item = [match[1], match[2], match[3], match[4], match[0]];
//     if (item.some((i) => i === undefined)) {
//       throw new Error("Invalid match");
//     }
//     console.log("item");
//     console.log(item);
//     steps.push(item as string[]);
//   }
//   console.log(steps);
//   console.log(result.content.toString());
//   return {
//     steps,
//     planString: result.content.toString(),
//   };
// }

// //#endregion 

// //#region "executor"

// import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
// //import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

// const search = new TavilySearchResults({ maxResults: 1 });
// //const search = new DuckDuckGoSearch({ maxResults: 1 });


// const _getCurrentTask = (state: typeof GraphState.State) => {
//   console.log("_getCurrentTask", state);
//   if (!state.results) {
//     return 1;
//   }
//   if (Object.entries(state.results).length === state.steps.length) {
//     return null;
//   }
//   return Object.entries(state.results).length + 1;
// };

// const _parseResult = (input: unknown) => {


//   if (typeof input === "string") {
//     const parsedInput = JSON.parse(input);
//     if (Array.isArray(parsedInput) && parsedInput.length > 0 && "snippet" in parsedInput[0]) {
//       // This means it is a tool result.
//       return parsedInput.map(({ snippet }) => snippet).join("\n");
//     }
//   }
//   if (typeof input === "string") {
//     const parsedInput = JSON.parse(input);
//     if (Array.isArray(parsedInput) && "content" in parsedInput[0]) {
//       // This means it is a tool result.
//       return parsedInput.map(({ content }) => content).join("\n");
//     }
//   }


//   if (input && typeof input === "object" && "content" in input) {
//     // If it's not a tool, we know it's an LLM result.
//     const { content } = input;
//     return content;
//   }

//   if (input && typeof input === "object" && "snippet" in input) {
//     // If it's not a tool, we know it's an LLM result.
//     const { snippet } = input;
//     return snippet;
//   }

//   throw new Error("Invalid input received");
// };

// async function toolExecution(state: typeof GraphState.State, config?: RunnableConfig) {
//   console.log("---EXECUTE TOOL---");
//   const _step = _getCurrentTask(state);
//   if (_step === null) {
//     throw new Error("No current task found");
//   }
//   const [_, stepName, tool, toolInputTemplate] = state.steps[_step - 1];
//   console.log(`Step: ${_}`);
//   console.log(`Step Name: ${stepName}`);
//   console.log(`Tool: ${tool}`);
//   console.log(`Tool Input Template: ${toolInputTemplate}`);
//   let toolInput = toolInputTemplate;
//   const _results = state.results || {};
//   for (const [k, v] of Object.entries(_results)) {
//     toolInput = toolInput.replace(k, v);
//   }
//   let result;
//   if (tool === "Google") {
//     console.log("google tool execution: " + toolInput);
//     result = await search.invoke(toolInput, config);
//     console.log("google result");
//     console.log(result);
//     //await new Promise(resolve => setTimeout(resolve, 5000));
//   } else if (tool === "LLM") {
//     result = await model.invoke(toolInput, config);
//   } else {
//     throw new Error("Invalid tool specified");
//   }
//   _results[stepName] = JSON.stringify(_parseResult(result), null, 2);
//   return { results: _results };
// }
// //#endregion


// //#region "solver"

// const solvePrompt = ChatPromptTemplate.fromTemplate(
//   `Solve the following task or problem. To solve the problem, we have made step-by-step Plan and
// retrieved corresponding Evidence to each Plan. Use them with caution since long evidence might
// contain irrelevant information.

// {plan}

// Now solve the question or task according to provided Evidence above. Respond with the answer
// directly with no extra words.

// Task: {task}
// Response:`,
// );

// async function solve(state: typeof GraphState.State, config?: RunnableConfig) {
//   console.log("---SOLVE---");
//   let plan = "";
//   console.log(state.steps);
//   const _results = state.results || {};
//   for (let [_plan, stepName, tool, toolInput] of state.steps) {
//     console.log(`Plan: ${_plan}`);
//     console.log(`Step Name: ${stepName}`);
//     console.log(`Tool: ${tool}`);
//     console.log(`Original Tool Input: ${toolInput}`);
    
//     for (const [k, v] of Object.entries(_results)) {
//       toolInput = toolInput.replace(k, v);
//     }
    
//     console.log(`Processed Tool Input: ${toolInput}`);
//     plan += `Plan: ${_plan}\n${stepName} = ${tool}[${toolInput}]\n`;
//   }
//   const result = await solvePrompt
//     .pipe(model)
//     .invoke({ plan, task: state.task }, config);
//   return {
//     result: result.content.toString(),
//   };
// }

// //#endregion

// //#region "define graph"

// import { END, START, StateGraph } from "@langchain/langgraph";
// import { MemorySaver } from "@langchain/langgraph";

// const _route = (state: typeof GraphState.State) => {
//   console.log("---ROUTE TASK---");
//   const _step = _getCurrentTask(state);
//   if (_step === null) {
//     // We have executed all tasks
//     return "solve";
//   }
//   // We are still executing tasks, loop back to the "tool" node
//   return "tool";
// };

// const workflow = new StateGraph(GraphState)
//   .addNode("plan", getPlan)
//   .addNode("tool", toolExecution)
//   .addNode("solve", solve)
//   .addEdge("plan", "tool")
//   .addEdge("solve", END)
//   .addConditionalEdges("tool", _route)
//   .addEdge(START, "plan");

// // Compile

// export const agentRewoo = workflow.compile()
// agentRewoo.name = "Agent ReWOOg";

// //#endregion


