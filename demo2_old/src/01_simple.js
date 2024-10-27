"use strict";
// import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";
// import { RunnableConfig } from "@langchain/core/runnables";
Object.defineProperty(exports, "__esModule", { value: true });
// interface IState {
//   input: string;
//   results?: string;
// }
// // This defines the agent state
// const graphState: StateGraphArgs<IState>["channels"] = {
//   input: {
//     value: (x?: string, y?: string) => y ?? x ?? "",
//     default: () => "",
//   },
//   results: {
//     value: (x?: string, y?: string) => y ?? x ?? "",
//     default: () => "",
//   },
// };
// function myNode(state: IState, config?: RunnableConfig) {
//   console.log("In node:", config?.configurable?.user_id);
//   return { results: `Hello, ${state.input}!` };
// }
// // The second parameter is optional
// function myOtherNode(state: IState) {
//   return state;
// }
// const builder = new StateGraph({ channels: graphState })
//   .addNode("my_node", myNode)
//   .addNode("other_node", myOtherNode)
//   .addEdge(START, "my_node")
//   .addEdge("my_node", "other_node")
//   .addEdge("other_node", END);
// const graph = builder.compile();
// const result1 = await graph.invoke(
//   { input: "Will" },
//   { configurable: { user_id: "abcd-123" } }
// );
// // In node: abcd-123
// console.log(result1);
// // { input: 'Will', results: 'Hello, Will!' }
