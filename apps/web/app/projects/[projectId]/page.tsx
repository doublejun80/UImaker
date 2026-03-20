import { ProjectEntryRedirect } from "@/components/chrome/project-entry-redirect";

export default async function ProjectEntryPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}): Promise<React.ReactElement> {
  const { projectId } = await params;
  return <ProjectEntryRedirect projectId={projectId} />;
}