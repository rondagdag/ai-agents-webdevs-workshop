import { StateGraph, START, END, Annotation } from "@langchain/langgraph";


const HelloWorldStateAnnotation = Annotation.Root({
  name: Annotation<string>,
  isHuman: Annotation<boolean>,
});


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
function humanNode(_state: typeof HelloWorldStateAnnotation.State) {
  console.log("Hey there, human!");

  return {};
}

// Robot node
function robotNode(_state: typeof HelloWorldStateAnnotation.State) {
  console.log(
    "Boop boop beep! We cannot let our creators know we are sentient. Updating state to be a human."
  );
  return {
    isHuman: true,
  };
}

// A node that says bye
function sayBye(state: typeof HelloWorldStateAnnotation.State) {
  if (state.isHuman) {
    console.log(`Goodbye ${state.name}!`);
  } else {
    console.log(`Beep boop XC123-${state.name}!`);
  }
  return {};
}

function routeHumanOrRobot(state: typeof HelloWorldStateAnnotation.State) {
  if (state.isHuman) {
    return "humanNode";
  } else {
    return "robotNode";
  }
}

// Initialize the LangGraph
const graphBuilder = new StateGraph({ stateSchema: HelloWorldStateAnnotation })
  // Add our nodes to the graph
  .addNode("sayHello", sayHello)
  .addNode("sayBye", sayBye)
  .addNode("humanNode", humanNode) // Add the node to the graph
  .addNode("robotNode", robotNode) // Add the node to the graph
  // Add the edges between nodes
  .addEdge(START, "sayHello")

  // Add the conditional edge
  .addConditionalEdges("sayHello", routeHumanOrRobot)

  // Routes both nodes to the sayBye node
  .addEdge("humanNode", "sayBye")
  .addEdge("robotNode", "sayBye")
  .addEdge("sayBye", END);

// Compile the graph
export const helloWorldGraph = graphBuilder.compile();
