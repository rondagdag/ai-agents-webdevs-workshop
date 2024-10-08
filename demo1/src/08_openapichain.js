import "dotenv/config";

import { OpenApiToolkit } from "langchain/agents/toolkits";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { JsonSpec } from "langchain/tools";

import { initChatModel } from "langchain/chat_models/universal";

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

// Load & convert the OpenAPI spec from YAML to JSON.
const yamlFile = fs.readFileSync(
  "../potterdb_openapi.yaml",
  "utf8"
);
const data = yaml.load(yamlFile);
if (!data) {
  throw new Error("Failed to load OpenAPI spec");
}

// Define headers for the API requests.
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
};

const toolkit = new OpenApiToolkit(new JsonSpec(data), model, headers);

const tools = toolkit.getTools();

console.log(
  tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
  }))
);

