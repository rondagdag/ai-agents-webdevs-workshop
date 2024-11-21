# Working with CopilotKit

- [Working with CopilotKit](#working-with-copilotkit)
  - [Introduction](#introduction)
  - [What is CopilotKit?](#what-is-copilotkit)
  - [What is CopilotKit used for?](#what-is-copilotkit-used-for)
  - [What are the benefits of using CopilotKit?](#what-are-the-benefits-of-using-copilotkit)
    - [Bring context-aware AI to your app](#bring-context-aware-ai-to-your-app)
    - [Backend Actions \& Agents](#backend-actions--agents)
    - [Customize the look and feel of the built-in Copilot UI components](#customize-the-look-and-feel-of-the-built-in-copilot-ui-components)
  - [What are the features of CopilotKit?](#what-are-the-features-of-copilotkit)
  - [What are the limitations of using CopilotKit?](#what-are-the-limitations-of-using-copilotkit)
  - [What are the alternatives to CopilotKit?](#what-are-the-alternatives-to-copilotkit)
  - [How do I get started with CopilotKit?](#how-do-i-get-started-with-copilotkit)
  - [Next Steps](#next-steps)
  - [Use SLM](#use-slm)
    - [Ollama](#ollama)
    - [Install Ollama](#install-ollama)
    - [Running Llama 3.2](#running-llama-32)
    - [How to use Ollama in LangChain](#how-to-use-ollama-in-langchain)

## Introduction

## What is CopilotKit?

CopilotKit is the simplest way to integrate production-ready Copilots into any product. It is an open-source AI copilot framework and platform that helps build deeply integrated in-app AI chatbots. It is easy to integrate powerful AI into your React apps.

## What is CopilotKit used for?

- **ChatBots💬**: Context-aware in-app chatbots that can take actions in-app.
- **CopilotTextArea📝**: AI-powered text fields with context-aware autocomplete and insertions.
- **Co-Agents🤖**: In-app AI agents that can interact with your app and users, powered by LangChain.

## What are the benefits of using CopilotKit?

### Bring context-aware AI to your app

- Connect your data to AI Assistant.
- Customize the behavior of your AI assistant.
- Enable your Copilot to take actions in the frontend.
- Auto-generate suggestions in the chat window based on real-time application state.
- Copilot Textarea for AI-powered autosuggestions.

### Backend Actions & Agents

- Use any LLM model to power your AI assistant.
- Enable backend actions and agents in your Copilot.

### Customize the look and feel of the built-in Copilot UI components

- Embed custom UI components in the Copilot window.
- Built-in Copilot UI components.
- Fully customize your Copilot's UI from the ground up using headless UI.

## What are the features of CopilotKit?

- **Seamless AI Integration**: CopilotKit offers plug-and-play components.
- **Contextual Awareness**: Access real-time, user-specific data, enhancing their relevance and effectiveness.
- **Actionable Intelligence**: CopilotKit enables copilots to perform actions on behalf of users, streamlining workflows and improving efficiency.
- **CoAgents Integration**: Seamless integration with LangChain and LangGraph agents.
- **Generative UI**: Render fully custom React components within the chat interface.
- **AI-Enabled Text Editing**: AI-powered text editing features, including autocompletions and insertions, serving as a drop-in replacement for any textarea.

## What are the limitations of using CopilotKit?

- **Framework Compatibility**: Primarily designed for React applications.
- **Customization Complexity**: Achieving deep customization may require significant effort. Implementing a fully custom headless UI involves using hooks like `useCopilotChat`.
- **AI Model Dependencies**: Performance and capabilities are influenced by the underlying AI models. Limitations inherent to these models, such as handling specific languages or domain-specific knowledge, can affect effectiveness.
- **Resource Requirements**: Integrating AI functionalities can be resource-intensive, potentially impacting application performance.
- **Data Privacy and Security**: Incorporating AI copilots involves processing user data, which raises concerns about data privacy and security. Implement robust measures to protect sensitive information and comply with relevant data protection regulations.

## What are the alternatives to CopilotKit?

- **Next.js AI Chatbot**: [Next.js AI Chatbot](https://vercel.com/templates/next.js/nextjs-ai-chatbot)

## How do I get started with CopilotKit?

Follow the instructions to get started with CopilotKit: [CopilotKit Tutorial](https://docs.copilotkit.ai/tutorials/ai-todo-app/overview)

For Step2: To use Groq, modify app/api/route.ts
  
  ```typescript
  import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from '@copilotkit/runtime';
  import { NextRequest } from 'next/server';

  const runtime = new CopilotRuntime();
  
  async function getGroqAdapter() {
    const { GroqAdapter } = await import("@copilotkit/runtime");
    return new GroqAdapter();
  }
  export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter: await getGroqAdapter(),
      endpoint: req.nextUrl.pathname,
    });
   
    return handleRequest(req);
  };

  ```

install Groq
```bash
npm install @langchain/groq
```

  modify .env.local
  add the following line and plug in your GROQ API key
  ```bash
  GROQ_API_KEY=YOUR_GROQ_API
  ```

## Next Steps

After getting started with CopilotKit, you can explore the following advanced features:

1. **Add suggestions to your copilot** using the [`useCopilotChatSuggestions`](https://docs.copilotkit.ai/reference/hooks/useCopilotChatSuggestions) hook.

   Open `components/TasksList.tsx` and add the following code:

   ```typescript
   import { useCopilotChatSuggestions } from "@copilotkit/react-ui";

   export function TasksList() {
     const { tasks } = useTasks();
     useCopilotChatSuggestions(
       {
         instructions: "Suggest the most relevant next actions.",
         minSuggestions: 1,
         maxSuggestions: 2,
       },
       [tasks],
     );
   }
   ```

   It should suggest relevant actions based on the tasks in the list.

2. **Add an initial assistant message to your chat window** (for more info, check the documentation for [`<CopilotPopup />`](https://docs.copilotkit.ai/reference/components/chat/CopilotPopup)).

   Open `app/page.tsx`:

   ```typescript
   import { CopilotKitCSSProperties, CopilotPopup, CopilotSidebar } from "@copilotkit/react-ui";

   <div
     style={
       {
         height: `100vh`,
         "--copilot-kit-primary-color": "red",
       } as CopilotKitCSSProperties
     }
   >
     <CopilotSidebar
       labels={{
         title: "To Do Assistant",
         initial: "Hi! 👋 How can I assist with your list?",
       }}
     />
   </div>
   ```

   It will change the color of the chat window to red and display the initial message "Hi! 👋 How can I assist with your list?".

3. **Dive deeper into the useful [`useCopilotChat`](https://docs.copilotkit.ai/reference/hooks/useCopilotChat) hook**, which enables you to set the system message, append messages, and more.

   Open `components/AddTodo.tsx` and replace the following code:

   ```typescript
   import { useCopilotChat } from "@copilotkit/react-core";
   import { Role, TextMessage } from "@copilotkit/runtime-client-gql";

   export function AddTodo() {
     const [title, setTitle] = useState("");
     const { addTask } = useTasks();
     const { appendMessage } = useCopilotChat();

     const handleAddTask = () => {
       addTask(title);
       appendMessage(
         new TextMessage({
           content: `Added task ${title}. Is there anything else?`,
           role: Role.Assistant,
         }),
       );
       setTitle("");
     };
   }
   ```

   Add a task to the list. It will append a message to the chat window: "Added task {title}. Is there anything else?".

4. **Implement autocompletion using the [`<CopilotTextarea />`](https://docs.copilotkit.ai/reference/components/CopilotTextarea) component**.

   Open `components/AddTodo.tsx` and replace the following code:

   ```typescript
   import { CopilotTextarea } from "@copilotkit/react-textarea";

   <form onSubmit={(e) => e.preventDefault()}>
     <div className="flex items-center mb-4">
       <CopilotTextarea
         value={title}
         onChange={(e) => setTitle(e.target.value)}
         placeholder="Add a new todo..."
         className="flex-1 mr-2 bg-muted text-muted-foreground rounded-md px-4 py-2"
         autosuggestionsConfig={{
           textareaPurpose: "the title of the task",
           chatApiConfigs: {},
         }}
       />
       <Button type="submit" disabled={!title} onClick={handleAddTask}>
         Add
       </Button>
     </div>
   </form>
   ```

   This will enable autocompletion for the task title in the text area.

## Use SLM

### Ollama

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
ollama pull llama3.2
ollama run llama3.2
```

### How to use Ollama in LangChain
https://js.langchain.com/docs/integrations/chat/ollama/(https://js.langchain.com/docs/integrations/chat/ollama/)

```bash
npm install @langchain/ollama
```

To use Ollama, modify app/api/route.ts
  
  ```typescript  
  async function getLangChainOllamaAdapter() {
    const { LangChainAdapter } = await import("@copilotkit/runtime");
    const { ChatOllama } = await import("@langchain/ollama");
    return new LangChainAdapter({
      chainFn: async ({ messages, tools }) => {
        const model = new ChatOllama({
          model: "llama3.2", // Default value
          temperature: 0
        }).bind(tools as any) as any;
        return model.stream(messages, { tools });
      },
    });
  }

  export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter: await getLangChainOllamaAdapter(),
      endpoint: req.nextUrl.pathname,
    });
   
    return handleRequest(req);
  };

  ```

  modify .env.local
  add the following line and plug in your GROQ API key
  ```bash
  GROQ_API_KEY=YOUR_GROQ_API
  ```
