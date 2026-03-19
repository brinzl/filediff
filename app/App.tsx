import { useState, lazy, Suspense } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@app/components/ui/sidebar/sidebar";
import { AppSidebar } from "@app/components/sidebar/sidebar";
import { EmptyState } from "@app/components/empty-state/empty-state";
import { useQuery } from "@app/hooks/useQuery";
import styles from "./app.module.css";

const DiffViewer = lazy(() =>
  import("@app/components/diff-viewer/diff-viewer").then((m) => ({ default: m.DiffViewer })),
);

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

interface FileContents {
  name: string;
  contents: string;
}

interface DiffResponse {
  oldFile: FileContents;
  newFile: FileContents;
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
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar
        tree={tree}
        selectedPath={selectedPath}
        onFileSelect={setSelectedPath}
      />
      <SidebarInset>
        <header className={styles.header}>
          <SidebarTrigger className={styles.triggerOffset} />
          <h1>filediff</h1>
          {info?.path && (
            <span className={styles.repoPath}>{info.path}</span>
          )}
        </header>
        <div className={styles.mainContent}>
          {diffData?.oldFile && diffData?.newFile ? (
            <Suspense
              fallback={
                <div className={styles.diffLoading}>Loading diff...</div>
              }
            >
              <DiffViewer
                oldFile={diffData.oldFile}
                newFile={diffData.newFile}
                filePath={`${info?.path ?? ""}/${selectedPath!}`}
              />
            </Suspense>
          ) : (
            <EmptyState />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
