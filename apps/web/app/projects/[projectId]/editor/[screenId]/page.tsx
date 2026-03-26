import { EditorView } from "@/components/editor/editor-view";

export default async function EditorPage({
  params
}: {
  params: Promise<{ projectId: string; screenId: string }>;
}): Promise<React.ReactElement> {
  const { projectId, screenId } = await params;
  return <EditorView projectId={projectId} screenId={screenId} />;
}