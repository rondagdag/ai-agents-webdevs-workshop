import "dotenv/config";
import OpenAI from "openai";
import * as fs from "node:fs/promises";

const openai = new OpenAI();

async function main() {

    const imageData = await fs.readFile("./images/Harry_Potter_and_the_Philosopher's_Stone_Book_Cover.jpg");
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What’s in this image?" },
          {
            type: "image_url",
            image_url: {
                url: `data:image/jpeg;base64,${imageData.toString("base64")}`,
            //   "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
            },
          },
        ],
      },
    ],
  });
  console.log(response.choices[0]);
}
main();

// import "dotenv/config";
// import { z } from "zod";
// import * as fs from "node:fs/promises";
// import { HumanMessage } from "@langchain/core/messages";
// import { tool } from "@langchain/core/tools";

// import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";

// import { initChatModel } from "langchain/chat_models/universal";

// // const model = await initChatModel("llama3.2", {
// //   modelProvider: "ollama",
// //   temperature: 0,
// // });

// const model = await initChatModel("gpt-4", {
//   modelProvider: "azure_openai",
//   temperature: 0,
// });

// // const model = await initChatModel("gpt-4o", {
// //   modelProvider: "openai",
// //   temperature: 0,
// // });

// import { ChatOpenAI } from "@langchain/openai";
// import {
//     ChatPromptTemplate,
//     MessagesPlaceholder,
//   } from "@langchain/core/prompts";

// // const weatherTool = tool(
// //     async ({ weather }) => {
// //       console.log(weather);
// //       return weather;
// //     },
// //     {
// //       name: "multiply",
// //       description: "Describe the weather",
// //       schema: z.object({
// //         weather: z.enum(["sunny", "cloudy", "rainy"]),
// //       }),
// //     }
// //   );

// // const model = new ChatOpenAI({
// //     model: "gpt-4o",
// //     temperature: 0,
// //     callbacks: [new ConsoleCallbackHandler()],
// // }); 
// //.bindTools([weatherTool]);

// const imageData = await fs.readFile("../images/Harry_Potter_and_the_Philosopher's_Stone_Book_Cover.jpg");

// const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg";


// const response = await model.invoke([
//     {
//         role: "user",
//         content: [
//             {   type: "text", text: "What’s in this image?" },
//             {
//                 type: "image_url",
//                 image_url: {
//                     url: `data:image/jpeg;base64,${imageData.toString("base64")}`,
//                 //   "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
//                 },
//             },
//         ],
//     },
//   ]);

//   console.log(response.content);
  
// //   const message = new HumanMessage({
// //     content: [
// //       {
// //         type: "text",
// //         text: "describe this image",
// //       },
// //       {
// //         type: "image_url",
// //         image_url: { 
// //             url: `data:image/jpeg;base64,${imageData.toString("base64")}`,
// //         },
// //       },
// //     ],
// //   });




// //   const imageData = await fs.readFile("../images/Harry_Potter_and_the_Philosopher's_Stone_Book_Cover.jpg");
// // const message = new HumanMessage({
// //   content: [
// //     {
// //       type: "text",
// //       text: "what does this image contain?",
// //     },
// //     {
// //       type: "image_url",
// //       image_url: {
// //         url: `data:image/jpeg;base64,${imageData.toString("base64")}`,
// //       },
// //     },
// //   ],
// // });
// // const response = await model.invoke([message]);
// // console.log(response.content);