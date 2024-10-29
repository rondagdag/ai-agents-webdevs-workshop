import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { graph } from "agent.js";


//#region state
const JokeOrFactStateAnnotation = Annotation.Root({
  userInput: Annotation<string>,
  responseMsg: Annotation<string>,
});

//#endregion

//#region nodes and edges
// decipherUserInput conditional node
function decipherUserInput(state: typeof JokeOrFactStateAnnotation.State) {
  // This could be more complex logic using an LLM
  if (state.userInput.includes("joke")) {
    return "jokeNode";
  } else {
    return "factNode";
  }
}

async function jokeNode(_state: typeof JokeOrFactStateAnnotation.State) {
  const RANDOM_JOKE_API_ENDPOINT = `https://geek-jokes.sameerkumar.website/api?format=json`;

  const resp = await fetch(RANDOM_JOKE_API_ENDPOINT);
  const { joke } = await resp.json();

  return {
    responseMsg: "You requested a JOKE: " + joke,
  };
}

async function factNode(_state: typeof JokeOrFactStateAnnotation.State) {
  const RANDOM_FACT_API_ENDPOINT = `https://uselessfacts.jsph.pl/api/v2/facts/random`;

  const resp = await fetch(RANDOM_FACT_API_ENDPOINT);
  const { text: fact } = await resp.json();

  return {
    responseMsg: "You requested a FACT: " + fact,
  };
}
//#endregion

//#region graph
// Initialize the LangGraph
const graphBuilder = new StateGraph({ stateSchema: JokeOrFactStateAnnotation })
  // Add our nodes to the graph
  .addNode("jokeNode", jokeNode)
  .addNode("factNode", factNode)
  // Add the edges between nodes
  .addConditionalEdges(START, decipherUserInput)
  .addEdge("jokeNode", END)
  .addEdge("factNode", END);

// Compile the graph
export const jokeOrFactGraph = graphBuilder.compile();
jokeOrFactGraph.name = "03 Joke or Fact Graph"
//#endregion

//#region draw graph
import { saveGraphAsImage } from "drawGraph.js"
await saveGraphAsImage(jokeOrFactGraph)
//#endregion