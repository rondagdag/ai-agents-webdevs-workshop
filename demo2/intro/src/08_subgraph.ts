
import { StateGraph, START, Annotation } from "@langchain/langgraph";
import { initChatModel } from "langchain/chat_models/universal";

//#region model
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
//#endregion

//#region logs
// Custom structure for adding logs from subgraphs to the state
export interface Log {
  type: string;
  id: string
  task: string
  status: string
  details: string
  timestamp: Date
  feedback?: string
}

// Define custom reducer (see more on this in the "Custom reducer" section below)
const addLogs = (left: Log[], right: Log[]): Log[] => {
  let newLeft = left || [];
  let newRight = right || [];

  const logs = [...newLeft];
  const leftIdToIdx = new Map(logs.map((log, idx) => [log.id, idx]));

  // update if the new logs are already in the state, otherwise append
  for (const log of newRight) {
    const idx = leftIdToIdx.get(log.id);
    if (idx !== undefined) {
      logs[idx] = log;
    } else {
      logs.push(log);
    }
  }

  return logs;
};

//#endregion

//#region Failure Analysis Subgraph
const FailureAnalysisAnnotation = Annotation.Root({
  // keys shared with the parent graph (EntryGraphState)
  logs: Annotation<Log[]>({
    reducer: addLogs,
    default: () => [],
  }),
  failureReport: Annotation<string>,
  // subgraph key
  failures: Annotation<Log[]>,
})

const getFailures = (state: typeof FailureAnalysisAnnotation.State) => {
  console.log(state.logs)
  const failures = state.logs.filter(log => log.status === "Incomplete");
  console.log(failures)
  return { failures };
}

const generateSummary = (state: typeof FailureAnalysisAnnotation.State) => {
  const failureTasks = state.failures.map(log => log.task);
  // NOTE: you can implement custom summarization logic here
  const failureReport = `Incomplete tasks: ${failureTasks.join(", ")}`;
  return { failureReport };
}


const failureBuilder = new StateGraph(FailureAnalysisAnnotation)
  .addNode("getFailures", getFailures)
  .addNode("generateSummary", generateSummary)
  .addEdge(START, "getFailures")
  .addEdge("getFailures", "generateSummary");

//#endregion

//#region Summarization subgraph
const TaskSummarizationAnnotation = Annotation.Root({
  // keys that are shared with the parent graph (EntryGraphState)
  summaryReport: Annotation<string>,
  logs: Annotation<Log[]>({
    reducer: addLogs,
    default: () => [],
  }),
  // subgraph key
  summary: Annotation<string>,
})

const summarizePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Your task is to summarize list of logs`,
  ],
  new MessagesPlaceholder("messages"),
]);

const summarize = summarizePrompt.pipe(model as any).pipe(new StringOutputParser());

const generateTaskSummary = async (_state: typeof TaskSummarizationAnnotation.State) => {
  const logs = JSON.stringify(_state.logs);
  const result = await summarize.invoke({ messages: logs });
  return { summary: result };
}

const sendToSlack = (state: typeof TaskSummarizationAnnotation.State) => {
  const summary = state.summary;
  // NOTE: you can implement custom logic here, for example sending the summary generated in the previous step to Slack
  return { summaryReport: summary };
}

const taskSummarizationBuilder = new StateGraph(TaskSummarizationAnnotation)
  .addNode("generateTaskSummary", generateTaskSummary)
  .addNode("sendToSlack", sendToSlack)
  .addEdge(START, "generateTaskSummary")
  .addEdge("generateTaskSummary", "sendToSlack");
  
//#endregion


//#region Entry Graph
const EntryGraphAnnotation = Annotation.Root({
  rawLogs: Annotation<Log[]>({
    reducer: addLogs,
    default: () => [],
  }),
  // This will be used in subgraphs
  logs: Annotation<Log[]>({
    reducer: addLogs,
    default: () => [],
  }),
  // This will be generated in the failure analysis subgraph
  failureReport: Annotation<string>,
  // This will be generated in the summarization subgraph
  summaryReport: Annotation<string>,
});

const selectLogs = (state: typeof EntryGraphAnnotation.State) => {
  return { logs: state.rawLogs.filter((log) => "status" in log) };
}

const entryBuilder = new StateGraph(EntryGraphAnnotation)
  .addNode("selectLogs", selectLogs)
  .addNode("taskSummarization", taskSummarizationBuilder.compile())
  .addNode("failureAnalysis", failureBuilder.compile())
  // Add edges
  .addEdge(START, "selectLogs")
  .addEdge("selectLogs", "failureAnalysis")
  .addEdge("selectLogs", "taskSummarization");

export const subgraph = entryBuilder.compile()
//#endregion
subgraph.name = "07 simulation";

//draw graph
import { saveGraphAsImage } from "drawGraph.js"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
await saveGraphAsImage(subgraph)