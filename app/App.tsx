import { useState } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/Sidebar";
import { DiffViewer } from "@/components/DiffViewer";
import { EmptyState } from "@/components/EmptyState";
import { useQuery } from "@/hooks/useQuery";

interface TreeNode {
  type: "file" | "directory";
  name: string;
  path: string;
  status?: string;
  children?: TreeNode[];
}

interface RepoInfo {
  branch: string;
  head: string;
  path?: string;
}

interface TreeResponse {
  tree: TreeNode[];
}

interface DiffResponse {
  diff: string;
}

export default function App() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const { data: treeData } = useQuery<TreeResponse>("/api/tree");
  const { data: info } = useQuery<RepoInfo>("/api/info");
  const { data: diffData } = useQuery<DiffResponse>(
    `/api/diff/file?path=${encodeURIComponent(selectedPath ?? "")}`,
    { enabled: !!selectedPath },
  );

  const tree = treeData?.tree ?? [];

  if (!treeData) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        tree={tree}
        selectedPath={selectedPath}
        onFileSelect={setSelectedPath}
      />
      <SidebarInset>
        <header className="flex h-10 items-center gap-2 border-b px-4 my-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-semibold">filediff</h1>
          {info?.path && (
            <span className="text-muted-foreground">{info.path}</span>
          )}
        </header>
        <div className="flex-1 overflow-hidden">
          {diffData?.diff ? (
            <DiffViewer diff={diffData.diff} />
          ) : (
            <EmptyState />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
