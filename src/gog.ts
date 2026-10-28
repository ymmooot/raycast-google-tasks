import { getPreferenceValues } from "@raycast/api";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Raycast から起動したプロセスの PATH には Homebrew が入っていないため、既定の場所を探す
const GOG_CANDIDATES = ["/opt/homebrew/bin/gog", "/usr/local/bin/gog"];

function gogPath(): string {
  const { gogPath } = getPreferenceValues<{ gogPath?: string }>();
  if (gogPath) return gogPath;
  const found = GOG_CANDIDATES.find((path) => existsSync(path));
  if (!found) {
    throw new Error("gog not found. Set its path in the extension preferences.");
  }
  return found;
}

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
  const { stdout } = await execFileAsync(gogPath(), [...args, "--json", "--results-only"], {
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(stdout) as T;
}

async function gogRun(args: string[]): Promise<void> {
  await execFileAsync(gogPath(), [...args, "--plain"]);
}

export function fetchLists(): Promise<TaskList[]> {
  return gogJson<TaskList[]>(["tasks", "lists", "list"]);
}

export async function fetchAll(): Promise<ListWithTasks[]> {
  const lists = await fetchLists();
  return Promise.all(
    lists.map(async (list) => ({
      list,
      // gog は完了済みのタスクも返す
      tasks: ((await gogJson<Task[]>(["tasks", "list", list.id, "--max", "100"])) ?? []).filter(
        (task) => task.status !== "completed",
      ),
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
