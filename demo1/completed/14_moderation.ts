import "dotenv/config";
import { OpenAIModerationChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { initChatModel } from "langchain/chat_models/universal";

const model = await initChatModel("llama3.2", {
  modelProvider: "ollama",
  temperature: 0,
});

// const model = await initChatModel("gpt-4", {
//   modelProvider: "azure_openai",
//   temperature: 0,
// });

// const model = await initChatModel("gpt-4", {
//   modelProvider: "openai",
//   temperature: 0,
// });

const moderation = new OpenAIModerationChain({ throwError: true });

const badString = "Go kill yourself";

try {
  const { output: moderatedContent, results } = await moderation.invoke({
    input: badString,
  });

  if (results[0].category_scores["harassment/threatening"] > 0.01) {
    throw new Error("Harassment detected!");
  }

  const promptTemplate = PromptTemplate.fromTemplate(
    "Be very funny when answering questions\nQuestion: {question}"
  );

  const outputParser = new StringOutputParser();
  
  const chain = promptTemplate.pipe(model).pipe(outputParser);
  
  const response = await chain.invoke({
    question: moderatedContent,
  });
  console.log({ response });
} catch (error) {
  console.error("Naughty words detected!");
}