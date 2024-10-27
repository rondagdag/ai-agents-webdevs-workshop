"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloWorldGraph = void 0;
const langgraph_1 = require("@langchain/langgraph");
// State
const graphStateChannels = {
    name: {
        value: (prevName, newName) => newName,
        default: () => "Ada Lovelace",
    },
    isHuman: {
        value: (prevIsHuman, newIsHuman) => { var _a; return (_a = newIsHuman !== null && newIsHuman !== void 0 ? newIsHuman : prevIsHuman) !== null && _a !== void 0 ? _a : false; },
    },
};
// A node that says hello
function sayHello(state) {
    console.log(`Hello ${state.name}!`);
    // Change the name
    const newName = "Bill Nye";
    console.log(`Changing the name to '${newName}'`);
    return {
        name: newName,
    };
}
// Human node
function humanNode(state) {
    console.log("Hey there, human!");
    return {};
}
// Robot node
function robotNode(state) {
    console.log("Boop boop beep! We cannot let our creators know we are sentient. Updating state to be a human.");
    return {
        isHuman: true,
    };
}
// A node that says bye
function sayBye(state) {
    if (state.isHuman) {
        console.log(`Goodbye ${state.name}!`);
    }
    else {
        console.log(`Beep boop XC123-${state.name}!`);
    }
    return {};
}
function routeHumanOrRobot(state) {
    if (state.isHuman) {
        return "humanNode";
    }
    else {
        return "robotNode";
    }
}
// Initialize the LangGraph
const graphBuilder = new langgraph_1.StateGraph({ channels: graphStateChannels })
    // Add our nodes to the graph
    .addNode("sayHello", sayHello)
    .addNode("sayBye", sayBye)
    .addNode("humanNode", humanNode) // Add the node to the graph
    .addNode("robotNode", robotNode) // Add the node to the graph
    // Add the edges between nodes
    .addEdge(langgraph_1.START, "sayHello")
    // Add the conditional edge
    .addConditionalEdges("sayHello", routeHumanOrRobot)
    // Routes both nodes to the sayBye node
    .addEdge("humanNode", "sayBye")
    .addEdge("robotNode", "sayBye")
    .addEdge("sayBye", langgraph_1.END);
// Compile the graph
exports.helloWorldGraph = graphBuilder.compile();
