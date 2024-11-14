# Lab 1: Working with Langchain

- [Lab 1: Working with Langchain](#lab-1-working-with-langchain)
  - [Ollama](#ollama)
    - [Install Ollama](#install-ollama)
    - [Running Llama 3.2](#running-llama-32)
    - [How to use Ollama in LangChain](#how-to-use-ollama-in-langchain)
  - [Groq](#groq)
    - [How to Obtain a Groq API Key](#how-to-obtain-a-groq-api-key)
  - [Tavily](#tavily)


## Ollama

### Install Ollama

Download link:- https://ollama.com/download(https://ollama.com/download)

Windows Installation: Installing Ollama on Windows is straightforward. After downloading the executable file, simply run it, and Ollama will be installed automatically.

MacOS Installation: After the download completes on MacOS, you can unzip the downloaded file. Then, simply drag the Ollama.app folder into your Applications folder.

Linux installation: Just run below command in your terminal. Ollama will be installed.

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

```bash
ollama --help
ollama serve
ollama list
ollama rm
ollama run
ollama pull
```

### Running Llama 3.2
```bash
ollama run llama3.2
```

### How to use Ollama in LangChain
https://js.langchain.com/docs/integrations/chat/ollama/(https://js.langchain.com/docs/integrations/chat/ollama/)



## Groq

### How to Obtain a Groq API Key

Follow these steps to get your Groq API key and start using Groq services:

Step 1: Sign In to Groq Dashboard
1. Go to the [Groq Dashboard](https://dashboard.groq.com).
2. Click on the **Sign In** button in the top-right corner.
3. Use your existing credentials or create a new account if you haven't registered yet.

Step 2: Navigate to API Keys
1. Once logged in, go to **Account Settings** from the user menu.
2. In the **Settings** menu, click on **API Keys**.

Step 3: Create a New API Key
1. Click the **Create New API Key** button.
2. Enter a descriptive name for your API key (e.g., `My Project Key`).
3. Set the desired permissions for the API key based on your use case.

Step 4: Copy Your API Key
1. After creating the key, you will see it listed in the **API Keys** section.
2. Click the **Copy** button next to your new API key.
   - **Important:** Store the key securely. You will not be able to view it again once you navigate away from the page.


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

