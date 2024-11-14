

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

// import * as fs from "node:fs/promises";
// import axios from "axios";

// const imageData = await fs.readFile("./images/Harry_Potter_and_the_Philosopher's_Stone_Book_Cover.jpg");
// const base64 = imageData.toString("base64");

// // const imageUrl =
// //   "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Harry_Potter.jpg/640px-Harry_Potter.jpg";
// // const axiosRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
// // const base64 = btoa(
// //   new Uint8Array(axiosRes.data).reduce(
// //     (data, byte) => data + String.fromCharCode(byte),
// //     ""
// //   )
// // );

// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { ChatOpenAI } from "@langchain/openai";

// const model = new ChatOpenAI({ model: "gpt-4o-mini" });

// const prompt = ChatPromptTemplate.fromMessages([
//   {
//     type: "user",
//     content: [
//       { type: "text", text: "What’s in this image?" },
//       { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } }
//     ]
//   },
// ]);

// const chain = prompt.pipe(model);

// const response = await chain.invoke({ base64 });
// console.log(response.content);

