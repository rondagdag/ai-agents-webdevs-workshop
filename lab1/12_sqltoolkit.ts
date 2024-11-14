import "dotenv/config";

import { SqlDatabase } from "langchain/sql_db";
import { SqlToolkit } from "langchain/agents/toolkits/sql";
import { DataSource } from "typeorm";
/** This example uses Chinook database, which is a sample database available for SQL Server, Oracle, MySQL, etc.
 * To set it up follow the instructions on https://database.guide/2-sample-databases-sqlite/, placing the .db file
 * in the examples folder.
 */

import { model } from "./model";

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
