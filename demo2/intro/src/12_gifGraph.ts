
//converted from https://github.com/NirDiamant/GenAI_Agents/blob/main/all_agents_tutorials/gif_animation_generator_langgraph.ipynb

//#region model

import "dotenv/config";
import { initChatModel } from "langchain/chat_models/universal";
import axios from 'axios';
import { Jimp } from "jimp";
import fs from 'fs';
import { DallEAPIWrapper } from "@langchain/openai";

//#region model
// const model = await initChatModel("llama3.2", {
//   modelProvider: "ollama",
//   temperature: 0,
// });

const model = await initChatModel("gpt-4", {
  modelProvider: "azure_openai",
  temperature: 0,
});

// const model = await initChatModel("gpt-4", {
//   modelProvider: "openai",
//   temperature: 0,
// });
//#endregion

//#region state

import { Annotation, END, Graph, START } from "@langchain/langgraph";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

const GraphStateAnnotation = Annotation.Root({
  messages: Annotation<(HumanMessage | AIMessage)[]>,
  query: Annotation<string>,
  plot: Annotation<string>,
  character_description: Annotation<string>,
  image_prompts: Annotation<string[]>,
  image_urls: Annotation<string[]>,
  gif_data: Annotation<Buffer | null>
});

async function getImageData(url: string): Promise<Buffer | null> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Failed to fetch image from ${url}:`, error);
    return null;
  }
}

async function generateCharacterDescription(state: typeof GraphStateAnnotation.State) : Promise<Partial<typeof GraphStateAnnotation.State>> {
  const query = state.query;
  const response = await model.invoke([
    new HumanMessage({
      content: `Based on the query '${query}', create a detailed description of the main character, object, or scene. Include specific details about appearance, characteristics, and any unique features. This description will be used to maintain consistency across multiple images.`,
    }),
  ]);
  console.log(response.content)
  return {
    ...state,
    character_description: response.content as string,
};
}

async function generatePlot(state: typeof GraphStateAnnotation.State) : Promise<Partial<typeof GraphStateAnnotation.State>> {
  const characterDescription = state.character_description;
  const response = await model.invoke([
    new HumanMessage({
      content: `Create a short, 2-step plot for a GIF based on this query: '${state.query}' and featuring this description: ${characterDescription}. Each step should be a brief description of a single frame, maintaining consistency throughout. Keep it family-friendly and avoid any sensitive themes.`,
    }),
  ]);
  console.log(response.content)
  return {
    ...state,
    plot: response.content as string,
  }
}

async function generateImagePrompts(state: typeof GraphStateAnnotation.State) {
  const plot = state.plot;
  const characterDescription = state.character_description;
  const response = await model.invoke([
    new HumanMessage({
      content: `Based on this plot: '${plot}' and featuring this description: ${characterDescription}, generate 2 specific, family-friendly image prompts, one for each step. Each prompt should be detailed enough for image generation, maintaining consistency, and suitable for DALL-E.\n\nAlways include the following in EVERY prompt to maintain consistency:\n1. A brief reminder of the main character or object's key features\n2. The specific action or scene described in the plot step\n3. Any relevant background or environmental details\n\nFormat each prompt as a numbered list item, like this:\n1. [Your prompt here]\n2. [Your prompt here]\n... and so on.`,
    }),
  ]);

  let content = response.content as string;
  const prompts: string[] = [];
  content.split('\n').forEach((line: string) => {
    if (line.trim().match(/^(\d+)\./)) {
      const prompt = line.split('.', 2)[1].trim();
      prompts.push(`Create a detailed, photorealistic image of the following scene: ${prompt}`);
    }
  });

  if (prompts.length !== 2) {
    throw new Error(`Expected 2 prompts, but got ${prompts.length}. Please try again.`);
  }
  console.log(prompts)
  state.image_prompts = prompts;
  return {
  ...state,
  image_prompts: prompts,
  }
}


async function createImage(prompt: string, retries: number = 3): Promise<string | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
        const tool = new DallEAPIWrapper({
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'standard',
          n: 1,
        });
      const imageURL = await tool.invoke(prompt);
      return imageURL;
    } catch (e) {
      if (attempt === retries - 1) {
        console.error(`Failed to generate image for prompt: ${prompt}`, e);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return null;
}

async function createImages(state: typeof GraphStateAnnotation.State) :
  Promise<Partial<typeof GraphStateAnnotation.State>> {
  const imagePrompts = state.image_prompts;
  const imageUrls = await Promise.all(imagePrompts.map((prompt) => createImage(prompt)));
  state.image_urls = imageUrls.filter((url) => url !== null) as string[];
  console.log(state.image_urls);
  return state;
}

async function createGif(state: typeof GraphStateAnnotation.State) :
Promise<Partial<typeof GraphStateAnnotation.State>> {
  const imageUrls = state.image_urls;
  const images = [];
  console.log(imageUrls);
  for (const url of imageUrls) {
    const imgData = await getImageData(url);
    if (imgData) {
      const image = await Jimp.read(imgData);
      images.push(image);
    }
  }
  console.log("Length" + images.length)
  if (images.length > 0) {
    console.log("buffer")
    const gif = images[0];
    images.slice(0).forEach((img) => {
      gif.composite(img, 0, 0);
    });
    state.gif_data = await gif.getBuffer("image/gif");
  } else {
    state.gif_data = null;
  }
  console.log(state.gif_data);
  return state;
}

const workflow = new Graph()
  .addNode('generate_character_description', generateCharacterDescription)
  .addNode('generate_plot', generatePlot)
  .addNode('generate_image_prompts', generateImagePrompts)
  .addNode('create_images', createImages)
  .addNode('create_gif', createGif)

  .addEdge(START, 'generate_character_description')
  .addEdge('generate_character_description', 'generate_plot')
  .addEdge('generate_plot', 'generate_image_prompts')
  .addEdge('generate_image_prompts', 'create_images')
  .addEdge('create_images', 'create_gif')
  .addEdge('create_gif', END);

export const gifGraph = workflow.compile();
gifGraph.name = "12 Gif Graph"

//#region draw graph
// import { saveGraphAsImage } from "drawGraph.js"
// await saveGraphAsImage(gifGraph)

//#endregion


async function runWorkflow(query: string): Promise<typeof GraphStateAnnotation.State | null> {
  const initialState = {
    messages: [],
    query,
    plot: '',
    character_description: '',
    image_prompts: [],
    image_urls: [],
    gif_data: null,
  };

  try {
    const result = await gifGraph.invoke(initialState);

    console.log('Character/Scene Description:');
    console.log(result.character_description);

    console.log('\nGenerated Plot:');
    console.log(result.plot);

    console.log('\nImage Prompts:');
    result.image_prompts.forEach((prompt, i) => {
      console.log(`${i + 1}. ${prompt}`);
    });

    console.log('\nGenerated Image URLs:');
    result.image_urls.forEach((url, i) => {
      console.log(`${i + 1}. ${url}`);
    });

    if (result.gif_data) {
      console.log('\nGIF generated successfully.');
    } else {
      console.log('\nFailed to generate GIF.');
    }

    return result;
  } catch (e) {
    console.error(`An error occurred: ${e.message}`);
    return null;
  }
}

const query = "A cat wearing a top hat and monocle, sitting at a desk and writing a letter with a quill pen.";
runWorkflow(query).then((result) => {
  if (result && result.gif_data) {
    fs.writeFileSync('output.gif', result.gif_data);
    console.log('GIF saved as output.gif');
  } else {
    console.log('No GIF data available to display or save.');
  }
});

