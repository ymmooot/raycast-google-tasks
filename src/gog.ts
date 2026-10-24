import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const GOG = "/Users/ryota/homebrew/bin/gog";

export type TaskList = { id: string; title: string };
export type Task = {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: "needsAction" | "completed";
  webViewLink?: string;
};
export type ListWithTasks = { list: TaskList; tasks: Task[] };

async function gogJson<T>(args: string[]): Promise<T> {
  const { stdout } = await execFileAsync(GOG, [...args, "--json", "--results-only"], {
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(stdout) as T;
}

async function gogRun(args: string[]): Promise<void> {
  await execFileAsync(GOG, [...args, "--plain"]);
}

export function fetchLists(): Promise<TaskList[]> {
  return gogJson<TaskList[]>(["tasks", "lists", "list"]);
}

export async function fetchAll(): Promise<ListWithTasks[]> {
  const lists = await fetchLists();
  return Promise.all(
    lists.map(async (list) => ({
      list,
      tasks: (await gogJson<Task[]>(["tasks", "list", list.id, "--max", "100"])) ?? [],
    })),
  );
}

export function addTask(listId: string, input: { title: string; notes?: string; due?: string }) {
  const args = ["tasks", "add", listId, "--title", input.title];
  if (input.notes) args.push("--notes", input.notes);
  if (input.due) args.push("--due", input.due);
  return gogRun(args);
}

export function completeTask(listId: string, taskId: string) {
  return gogRun(["tasks", "done", listId, taskId]);
}

export function deleteTask(listId: string, taskId: string) {
  return gogRun(["tasks", "delete", listId, taskId, "--force"]);
}
