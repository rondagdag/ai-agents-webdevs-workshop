import "dotenv/config";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";



export async function run() {

    const tool = new DuckDuckGoSearch({ maxResults: 1 });

    const result = await tool.invoke("what is the current weather in singapore?");
    console.log(result);
}

run();