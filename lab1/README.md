# Lab 1: Working with Langchain

- [Lab 1: Working with Langchain](#lab-1-working-with-langchain)
  - [Ollama](#ollama)
    - [Install Ollama](#install-ollama)
    - [Running Llama 3.2](#running-llama-32)
    - [How to use Ollama in LangChain](#how-to-use-ollama-in-langchain)
  - [Groq](#groq)
    - [How to Obtain a Groq API Key](#how-to-obtain-a-groq-api-key)
  - [Azure OpenAI](#azure-openai)
    - [Getting Started with Azure OpenAI Studio](#getting-started-with-azure-openai-studio)
    - [Prerequisites](#prerequisites)
  - [How to run the project](#how-to-run-the-project)


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


## Azure OpenAI

### Getting Started with Azure OpenAI Studio

Azure OpenAI Studio allows you to deploy and interact with OpenAI models seamlessly. Follow these steps to set up your environment, deploy a model, obtain the necessary API key, and test the deployment using `curl` commands.

### Prerequisites

- An active [Azure subscription](https://azure.microsoft.com/free/).
- Access to the [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview).

Step 1: Create an Azure OpenAI Resource

1. **Sign in to the [Azure portal](https://portal.azure.com/).**
2. **Navigate to "Create a resource":**
   - Click on "Create a resource" in the left-hand menu.
3. **Search for "Azure OpenAI":**
   - In the search bar, type "Azure OpenAI" and select it from the results.
4. **Configure the resource:**
   - **Subscription:** Choose your Azure subscription.
   - **Resource Group:** Select an existing group or create a new one.
   - **Region:** Pick a region where the service is available.
   - **Name:** Provide a unique name for your OpenAI resource.
   - **Pricing Tier:** Select the desired pricing tier.
5. **Review and create:**
   - After configuring, click "Review + create" and then "Create" to deploy the resource.

*For detailed instructions, refer to the [Azure documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource).*

Step 2: Deploy a Model Using Azure AI Studio

1. **Access Azure AI Studio:**
   - Navigate to [Azure AI Studio](https://oai.azure.com/) and sign in with your Azure credentials.
2. **Navigate to the Model Catalog:**
   - On the left sidebar, select "Model catalog."
3. **Filter for Azure OpenAI Models:**
   - Under "Collections," choose "Azure OpenAI."
4. **Select and Deploy a Model:**
   - Choose a model (e.g., `gpt-4`) and click "Deploy."
   - **Configure Deployment:**
     - **Hub:** Select an existing hub or create a new one.
     - **Deployment Name:** Provide a unique name.
     - **Settings:** Adjust settings as needed.
   - Click "Deploy" to initiate the deployment.
5. **Access Deployment Details:**
   - Once deployed, navigate to the deployment details page.
   - Click "Open in playground" to test the model.
   - Select "View Code" to obtain code samples for integration.

*Detailed guidance is available in the [Azure AI Studio documentation](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models-openai).*

Step 3: Obtain the API Key and Endpoint

1. **Navigate to Your Azure OpenAI Resource:**
   - In the [Azure portal](https://portal.azure.com/), go to your OpenAI resource.
2. **Access Keys and Endpoint:**
   - Under "Resource Management," select "Keys and Endpoint."
   - **Endpoint:** Copy the provided endpoint URL.
   - **API Keys:** Copy one of the API keys (`KEY1` or `KEY2`).

*For more information, see the [Azure OpenAI Service REST API reference](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference).*

Step 4: Test the Deployment Using `curl`

With the endpoint and API key, you can test the deployed model using `curl` commands.

**Example: Sending a Request to the Deployed Model**

```bash
curl -X POST https://<your-resource-name>.openai.azure.com/openai/deployments/<deployment-name>/completions?api-version=2024-06-01-preview \
  -H "Content-Type: application/json" \
  -H "api-key: <your-api-key>" \
  -d '{
    "prompt": "Hello, how are you?",
    "max_tokens": 50
  }'
```


## How to run the project

```bash
npm install
npx tsx 01_first_chain.ts
```

Modify prompts and questions in the `01_first_chain.ts` file to test different scenarios.
