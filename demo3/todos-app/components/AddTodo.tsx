import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTasks } from "@/lib/hooks/use-tasks";
import "@copilotkit/react-textarea/styles.css";
import { CopilotTextarea } from "@copilotkit/react-textarea";

export function AddTodo() {
  const [title, setTitle] = useState("");
  const { addTask } = useTasks();

  const handleAddTask = () => {
    addTask(title);
    setTitle("");
  };

  return (
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
  );
}
