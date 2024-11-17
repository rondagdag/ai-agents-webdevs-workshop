import "dotenv/config";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";


const tool = new DuckDuckGoSearch({ searchOptions: { safeSearch: 0, }, maxResults: 1 });

const result = await tool.invoke("what is the current weather in singapore?");
console.log(result);
