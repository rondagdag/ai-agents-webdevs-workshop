
# Prompt Engineer and the AI Agents in Javascript

Prompts in a language model are like magic spells. You tell the model what you want to talk about or ask, and it generates a magical response based on the input. AI agents are like the wizard who consults their spell book to cast a series of spells. AI Agents use a large language model (LLM) as a reasoning engine to determine which actions to take and in which order. Attend this session to learn how to craft AI Agents in JavaScript using LangChain and other prompt engineering techniques. Alohomora!

## Demo: 
In this example you find a node app that can be used to learn LangChain in Typescript. This repository contains a series of sample scripts showcasing the usage of Langchain, a JavaScript/Typescript library for creating conversational AI applications.

- `00_basics.ts`: Introduction to basics of using OpenAI API without Langchain.
- `01_first_chain.ts`: How to create your first conversation chain in Langchain.
- `02_simplesequentialchain.ts`: A simple example of creating a sequential conversation chain.
- `03_sequentialchain.ts`: Detailed walkthrough of creating and utilizing a sequential conversation chain in Langchain.
- `04_parsers.ts`: How to use parsers to process input and output in a conversation chain.
- `05_indexes.ts`: How to create and use indexes in Langchain for efficient retrieval of information.
- `06_usestore.ts`: How to utilize the Vector Databases in Langchain for maintaining and retrieving information which was not trained into the model.
- `07_chathistory.ts`: How to create a chat bot in Langchain, forming the basis of a conversational AI application.
- `08_openapichain.ts`: How to use simple open api.
- `09_openaifunc.js`: How to create an agent in Langchain the uses OpenAI Functions.
- `10_duckduckgo.js`: How to create a tool that uses duckduckgo.
- `10_wikipediatool.ts`: How to create a tool that uses wikipedia.
- `11_webbrowsertool.ts`: Create a tool that invoke web browser to get data.
- `12_sqltoolkit.ts`: This example shows how to load and use an agent with a SQL toolkit.
- `13_extraction.ts`: This example shows how to extract and output to json.
- `14_moderation.ts`: This example shows how to add moderation/filter before sending to LLM.
- `15_multimodal.ts`: This example shows how to add moderation/filter before sending to LLM.
- `16_imagegeneration.ts`: How to generate images.


To run these examples, clone the git repository and run npm install to install the dependencies. You need to create a .env file and add your API Key for OpenAI like this: OPENAI_API_KEY=sk-...

This codes utilizes ES6 modules, to allow import statements and async/await within NodeJS.
  
Click my binder link to test it out! 
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/rondagdag/ai-agents-webdevs-workshop/HEAD)

### Presentation resources
- [Slidedeck](./ai-agents-js.pdf)

### Resources

- [JS/TS Langchain](https://js.langchain.com/)

- [Deep Learning Short Course - Build LLM apps with Langchan JS](https://www.deeplearning.ai/short-courses/build-llm-apps-with-langchain-js/)

- [Flowise](https://flowiseai.com/)

- [Learn Prompting](https://learnprompting.org/)

- [Inspired by LangChain JS Crash Course](https://github.com/Coding-Crashkurse/LangChain-JS-Full-Course#readme)

- [Harry Potter Manuscript](https://github.com/amephraim/nlp/blob/master/texts/)
```
curl "https://raw.githubusercontent.com/amephraim/nlp/master/texts/J.%20K.%20Rowling%20-%20Harry%20Potter%201%20-%20Sorcerer's%20Stone.txt" > "texts/J. K. Rowling - Harry Potter 1 - Sorcerer's Stone.txt"
```

- [OpenAI Cocktail Recipes Generator](https://github.com/swamichandra/cocktails)

### Speakers
- [Ron Dagdag](https://www.dagdag.net)






Original source:

