# Intro

This directory contains a single graph, located inside the `index.ts` file.

## Demo: 
In this example you find a node app that can be used to learn LangGraph in Typescript. This repository contains a series of sample scripts showcasing the usage of Langgraph, a JavaScript library for creating conversational AI applications.


## Setup

To setup the intro project, install the dependencies:

```bash
yarn install
yarn run dev
```

## Installation

- Test cases are in testcases folder

## Environment variables

The intro project requires Tavily and OpenAI API keys to run. Sign up here:

- OpenAI: https://platform.openai.com/signup
- Tavily: https://tavily.com/

Once you have your API keys, create a `.env` file in this directory and add the following:

```bash
TAVILY_API_KEY=YOUR_API_KEY
OPENAI_API_KEY=YOUR_API_KEY
AZURE_OPENAI_API_VERSION=2023-03-15-preview #default
AZURE_OPENAI_API_INSTANCE_NAME=YOUR_API_INSTANCE
AZURE_OPENAI_API_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=text-embedding-3-small
AZURE_OPENAI_API_KEY=YOUR_API_KEY
AZURE_OPENAI_ENDPOINT=YOUR_API_ENDPOINT
```

## Test the API

```
cd testcases
npx bru run "01 - Getting Started.bru" 
```


## LangGraph Config

The LangGraph configuration file for the intro project is located inside [`langgraph.json`](langgraph.json). This file defines the single graph implemented in the project: `01_gettingStarted`.