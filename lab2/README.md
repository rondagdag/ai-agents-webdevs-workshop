# Intro

This directory contains a simple LangGraph Graph, built for the introduction video in the LangGraph.js video series.
This directory contains a single graph, located inside the `index.ts` file.

## Setup

To setup the intro project, install the dependencies:

```bash
yarn install
```

## Environment variables

The intro project requires Tavily and OpenAI API keys to run. Sign up here:

- OpenAI: https://platform.openai.com/signup
- Tavily: https://tavily.com/

Once you have your API keys, create a `.env` file in this directory and add the following:

```bash
TAVILY_API_KEY=YOUR_API_KEY
OPENAI_API_KEY=YOUR_API_KEY
```

## LangGraph Config

The LangGraph configuration file for the intro project is located inside [`langgraph.json`](langgraph.json). This file defines the single graph implemented in the project: `simple_agent`.

## Tavily
Follow these steps to obtain access to the Tavily API:

Step 1: Sign Up
- Go to [Tavily's official website](https://tavily.com/) and create an account.
- Verify your email address to complete the registration process.

Step 2: Access the Dashboard
- Once logged in, navigate to the **Dashboard**.
- Here, you can manage your API keys, monitor usage, and configure settings.

Step 3: Generate Your API Key
- Go to the **API Keys** section in the dashboard.
- Click on **Generate API Key** to create a new API key.
- Copy the API key, as you will need it for all API requests.

