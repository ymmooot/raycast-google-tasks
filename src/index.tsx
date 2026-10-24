import { Action, ActionPanel, Alert, Color, confirmAlert, Icon, List, showToast, Toast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import AddTask from "./add-task";
import { completeTask, deleteTask, fetchAll, Task, TaskList } from "./gog";

export default function Command() {
  const { data, isLoading, revalidate } = useCachedPromise(fetchAll);

  async function handleComplete(list: TaskList, task: Task) {
    const toast = await showToast({ style: Toast.Style.Animated, title: "完了にしています" });
    try {
      await completeTask(list.id, task.id);
      toast.style = Toast.Style.Success;
      toast.title = "完了";
      toast.message = task.title;
      revalidate();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "完了にできませんでした";
      toast.message = error instanceof Error ? error.message : String(error);
    }
  }

  async function handleDelete(list: TaskList, task: Task) {
    const ok = await confirmAlert({
      title: "タスクを削除しますか？",
      message: task.title,
      primaryAction: { title: "削除", style: Alert.ActionStyle.Destructive },
    });
    if (!ok) return;
    try {
      await deleteTask(list.id, task.id);
      await showToast({ style: Toast.Style.Success, title: "削除しました", message: task.title });
      revalidate();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "削除できませんでした",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="タスクを検索">
      {data?.map(({ list, tasks }) => (
        <List.Section key={list.id} title={list.title} subtitle={String(tasks.length)}>
          {tasks.map((task) => (
            <List.Item
              key={task.id}
              icon={{ source: Icon.Circle, tintColor: Color.SecondaryText }}
              title={task.title}
              subtitle={task.notes?.split("\n")[0]}
              accessories={task.due ? [{ date: new Date(task.due), icon: Icon.Calendar }] : []}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action title="完了にする" icon={Icon.CheckCircle} onAction={() => handleComplete(list, task)} />
                    <Action.Push
                      title="タスクを追加"
                      icon={Icon.Plus}
                      shortcut={{ modifiers: ["cmd"], key: "n" }}
                      target={<AddTask defaultListId={list.id} onAdded={revalidate} />}
                    />
                    {task.webViewLink && (
                      <Action.OpenInBrowser title="Google Tasks で開く" url={task.webViewLink} />
                    )}
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <Action
                      title="再読み込み"
                      icon={Icon.ArrowClockwise}
                      shortcut={{ modifiers: ["cmd"], key: "r" }}
                      onAction={revalidate}
                    />
                    <Action
                      title="削除"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      shortcut={{ modifiers: ["ctrl"], key: "x" }}
                      onAction={() => handleDelete(list, task)}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
      <List.EmptyView
        title="未完了のタスクはありません"
        actions={
          <ActionPanel>
            <Action.Push title="タスクを追加" icon={Icon.Plus} target={<AddTask onAdded={revalidate} />} />
          </ActionPanel>
        }
      />
    </List>
  );
}
