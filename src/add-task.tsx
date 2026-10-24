import { Action, ActionPanel, Form, popToRoot, showToast, Toast, useNavigation } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { addTask, fetchLists } from "./gog";

type Props = { defaultListId?: string; onAdded?: () => void };
type Values = { title: string; listId: string; due: Date | null; notes: string };

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AddTask({ defaultListId, onAdded }: Props) {
  const { data: lists, isLoading } = useCachedPromise(fetchLists);
  const { pop } = useNavigation();

  async function handleSubmit(values: Values) {
    const title = values.title.trim();
    if (!title) {
      await showToast({ style: Toast.Style.Failure, title: "タイトルを入力してください" });
      return;
    }
    const toast = await showToast({ style: Toast.Style.Animated, title: "追加中" });
    try {
      await addTask(values.listId, {
        title,
        notes: values.notes.trim() || undefined,
        due: values.due ? toDateString(values.due) : undefined,
      });
      toast.style = Toast.Style.Success;
      toast.title = "追加しました";
      toast.message = title;
      if (onAdded) {
        onAdded();
        pop();
      } else {
        await popToRoot();
      }
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "追加に失敗しました";
      toast.message = error instanceof Error ? error.message : String(error);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="追加" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="タイトル" placeholder="やること" autoFocus />
      <Form.Dropdown id="listId" title="リスト" defaultValue={defaultListId}>
        {lists?.map((list) => <Form.Dropdown.Item key={list.id} value={list.id} title={list.title} />)}
      </Form.Dropdown>
      <Form.DatePicker id="due" title="期限" type={Form.DatePicker.Type.Date} />
      <Form.TextArea id="notes" title="メモ" />
    </Form>
  );
}
