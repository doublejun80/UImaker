import { ExportView } from "@/components/export/export-view";

export default async function ProjectExportPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}): Promise<React.ReactElement> {
  const { projectId } = await params;
  return <ExportView projectId={projectId} />;
}