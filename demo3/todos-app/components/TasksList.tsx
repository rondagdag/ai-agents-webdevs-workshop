"use client";

import { AddTodo } from "@/components/AddTodo";
import { Task } from "@/components/Task";
import { useTasks } from "@/lib/hooks/use-tasks";
import { TaskStatus } from "@/lib/tasks.types";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { AnimatePresence } from "framer-motion";

import { useCopilotChat } from "@copilotkit/react-core";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";

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
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <div className="flex flex-col gap-4 min-w-full md:min-w-[500px]">
        <h1 className="text-2xl font-bold">✍️ My Todos</h1>
        <AddTodo />

        <AnimatePresence>
          {tasks
            .sort((a, b) => {
              if (a.status === b.status) {
                return a.id - b.id;
              }
              return a.status === TaskStatus.todo ? -1 : 1;
            })
            .map((task) => (
              <Task key={task.id} task={task} />
            ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
