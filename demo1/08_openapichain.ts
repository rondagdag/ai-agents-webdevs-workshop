import "dotenv/config";

import { OpenApiToolkit } from "langchain/agents/toolkits";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { JsonSpec } from "langchain/tools";

import { model } from "./model";

// Load & convert the OpenAPI spec from YAML to JSON.
const yamlFile = fs.readFileSync(
  "./texts/potterdb_openapi.yaml",
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

