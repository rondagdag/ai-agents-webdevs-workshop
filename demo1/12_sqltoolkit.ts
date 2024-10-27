import "dotenv/config";

import { OpenAI } from "@langchain/openai";
import { SqlDatabase } from "langchain/sql_db";
import { SqlToolkit } from "langchain/agents/toolkits/sql";
import { DataSource } from "typeorm";
/** This example uses Chinook database, which is a sample database available for SQL Server, Oracle, MySQL, etc.
 * To set it up follow the instructions on https://database.guide/2-sample-databases-sqlite/, placing the .db file
 * in the examples folder.
 */

import { initChatModel } from "langchain/chat_models/universal";

const model = await initChatModel("gpt-4", {
  modelProvider: "azure_openai",
  temperature: 0,
});

// const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });

const datasource = new DataSource({
    type: "sqlite",
    database: "../sql/potter_movies.db",
  });
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });

  const toolkit = new SqlToolkit(db, model);

  const tools = toolkit.getTools();

  console.log(
    tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
    })));
