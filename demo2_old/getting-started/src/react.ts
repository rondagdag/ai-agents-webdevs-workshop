// // This code is Apache 2 licensed:
// // https://www.apache.org/licenses/LICENSE-2.0

// import { Configuration, OpenAIApi } from 'openai';
// import axios from 'axios';
// import { evaluate } from 'mathjs';

// // Set up OpenAI API key (set the environment variable OPENAI_API_KEY)
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// class ChatBot {
//   private system: string;
//   private messages: { role: string; content: string }[];

//   constructor(system = '') {
//     this.system = system;
//     this.messages = [];
//     if (this.system) {
//       this.messages.push({ role: 'system', content: this.system });
//     }
//   }

//   async call(message: string): Promise<string> {
//     this.messages.push({ role: 'user', content: message });
//     const result = await this.execute();
//     this.messages.push({ role: 'assistant', content: result });
//     return result;
//   }

//   private async execute(): Promise<string> {
//     const completion = await openai.createChatCompletion({
//       model: 'gpt-3.5-turbo',
//       messages: this.messages,
//     });
//     // Uncomment this to print out token usage each time
//     // console.log(completion.data.usage);
//     return completion.data.choices[0].message?.content || '';
//   }
// }

// const prompt = `
// You run in a loop of Thought, Action, PAUSE, Observation.
// At the end of the loop you output an Answer
// Use Thought to describe your thoughts about the question you have been asked.
// Use Action to run one of the actions available to you - then return PAUSE.
// Observation will be the result of running those actions.

// Your available actions are:

// calculate:
// e.g. calculate: 4 * 7 / 3
// Runs a calculation and returns the number - uses Python so be sure to use floating point syntax if necessary

// wikipedia:
// e.g. wikipedia: Django
// Returns a summary from searching Wikipedia

// simon_blog_search:
// e.g. simon_blog_search: Django
// Search Simon's blog for that term

// Always look things up on Wikipedia if you have the opportunity to do so.

// Example session:

// Question: What is the capital of France?
// Thought: I should look up France on Wikipedia
// Action: wikipedia: France
// PAUSE

// You will be called again with this:

// Observation: France is a country. The capital is Paris.

// You then output:

// Answer: The capital of France is Paris
// `.trim();

// const actionRe = /^Action: (\w+): (.*)$/;

// type ActionFunction = (input: string) => Promise<string>;

// const knownActions: { [key: string]: ActionFunction } = {
//   wikipedia,
//   calculate,
//   simon_blog_search: simonBlogSearch,
// };

// async function query(question: string, maxTurns = 5) {
//   let i = 0;
//   const bot = new ChatBot(prompt);
//   let nextPrompt = question;
//   while (i < maxTurns) {
//     i += 1;
//     const result = await bot.call(nextPrompt);
//     console.log(result);
//     const actions = result
//       .split('\n')
//       .map(line => line.match(actionRe))
//       .filter(match => match !== null);

//     if (actions.length > 0) {
//       // There is an action to run
//       const [, action, actionInput] = actions[0]!;
//       if (!(action in knownActions)) {
//         throw new Error(`Unknown action: ${action}: ${actionInput}`);
//       }
//       console.log(` -- running ${action} ${actionInput}`);
//       const observation = await knownActions[action](actionInput);
//       console.log('Observation:', observation);
//       nextPrompt = `Observation: ${observation}`;
//     } else {
//       return;
//     }
//   }
// }

// async function wikipedia(q: string): Promise<string> {
//   const response = await axios.get('https://en.wikipedia.org/w/api.php', {
//     params: {
//       action: 'query',
//       list: 'search',
//       srsearch: q,
//       format: 'json',
//       origin: '*',
//     },
//   });
//   return response.data.query.search[0].snippet;
// }

// async function simonBlogSearch(q: string): Promise<string> {
//   const sql = `
//     select
//       blog_entry.title || ': ' || substr(html_strip_tags(blog_entry.body), 0, 1000) as text,
//       blog_entry.created
//     from
//       blog_entry join blog_entry_fts on blog_entry.rowid = blog_entry_fts.rowid
//     where
//       blog_entry_fts match escape_fts(:q)
//     order by
//       blog_entry_fts.rank
//     limit
//       1
//   `.trim();

//   const response = await axios.get('https://datasette.simonwillison.net/simonwillisonblog.json', {
//     params: {
//       sql: sql,
//       _shape: 'array',
//       q: q,
//     },
//   });
//   return response.data[0].text;
// }

// async function calculate(what: string): Promise<string> {
//   try {
//     const result = evaluate(what);
//     return result.toString();
//   } catch {
//     return 'Error in calculation';
//   }
// }

// // To use the query function, call it with a question
// // query('What is the capital of France?');
