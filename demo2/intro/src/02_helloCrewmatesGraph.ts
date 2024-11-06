import { StateGraph, START, END, Annotation } from "@langchain/langgraph";


//#region state
const HelloWorldStateAnnotation = Annotation.Root({
  name: Annotation<string>,
  isCrewmate: Annotation<boolean>,
});
//#endregion

//#region nodes and edges
// A node that says hello
function sayHello(state: typeof HelloWorldStateAnnotation.State) {
  console.log(`Hello ${state.name}!`);

  // Change the name
  const newName = "Ron";

  console.log(`Changing the name to '${newName}'`);

  return {
    name: newName,
  };
}

// Human node
function crewmateNode(_state: typeof HelloWorldStateAnnotation.State) {
  console.log("Hey there, Crewmate!");

  return {};
}

// Imposter node
function imposterNode(_state: typeof HelloWorldStateAnnotation.State) {
  console.log(
    "Boop boop beep! We cannot let our creators know we are the imposter. Updating state to be a crewmate."
  );
  return {
    isCrewmate: true,
  };
}

// A node that says bye
function sayBye(state: typeof HelloWorldStateAnnotation.State) {
  if (state.isCrewmate) {
    console.log(`Goodbye ${state.name}!`);
  } else {
    console.log(`Beep boop XC123-${state.name}!`);
  }
  return {};
}

function routeCrewMateOrImposter(state: typeof HelloWorldStateAnnotation.State) {
  if (state.isCrewmate) {
    return "crewmateNode";
  } else {
    return "imposterNode";
  }
}

//#endregion

//#region graph
// Initialize the LangGraph
const graphBuilder = new StateGraph({ stateSchema: HelloWorldStateAnnotation })
  // Add our nodes to the graph
  .addNode("sayHello", sayHello)
  .addNode("sayBye", sayBye)
  .addNode("crewmateNode", crewmateNode) // Add the node to the graph
  .addNode("imposterNode", imposterNode) // Add the node to the graph
  // Add the edges between nodes
  .addEdge(START, "sayHello")

  // Add the conditional edge
  .addConditionalEdges("sayHello", routeCrewMateOrImposter)

  // Routes both nodes to the sayBye node
  .addEdge("crewmateNode", "sayBye")
  .addEdge("imposterNode", "sayBye")
  .addEdge("sayBye", END);

// Compile the graph
export const helloCrewmatesGraph = graphBuilder.compile();
helloCrewmatesGraph.name = "02 Hello Crewmates";
//#endregion

//#region draw graph
import { saveGraphAsImage } from "drawGraph.js"
await saveGraphAsImage(helloCrewmatesGraph)

//#endregion