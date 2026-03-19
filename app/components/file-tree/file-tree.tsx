import { useState, useEffect, lazy, Suspense } from "react";
import { ChevronRight } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@app/components/ui/sidebar/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@app/components/ui/collapsible/collapsible";
import styles from "./file-tree.module.css";

const FileIcon = lazy(() =>
  import("@react-symbols/icons/utils").then((m) => ({
    default: m.FileIcon,
  })),
);
const FolderIcon = lazy(() =>
  import("@react-symbols/icons/utils").then((m) => ({
    default: m.FolderIcon,
  })),
);

interface TreeNode {
  type: "file" | "directory";
  name: string;
  path: string;
  status?: string;
  children?: TreeNode[];
}

interface FileTreeProps {
  tree: TreeNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth?: number;
  version?: number;
  expandAll?: boolean;
}

const statusBadgeClass: Record<string, string> = {
  M: styles.statusM,
  A: styles.statusA,
  D: styles.statusD,
  R: styles.statusR,
};

const fileNameClass: Record<string, string> = {
  M: styles.fileNameM,
  A: styles.fileNameA,
  D: styles.fileNameD,
  R: styles.fileNameR,
};

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  return (
    <span
      className={`${styles.statusBadge} ${statusBadgeClass[status] ?? styles.statusDefault}`}
    >
      {status}
    </span>
  );
}

export function FileTree({
  tree,
  selectedPath,
  onSelect,
  depth = 0,
  version,
  expandAll,
}: FileTreeProps) {
  return (
    <>
      {tree.map((node) =>
        node.type === "directory" ? (
          <DirectoryNode
            key={node.path}
            node={node}
            selectedPath={selectedPath}
            onSelect={onSelect}
            depth={depth}
            version={version}
            expandAll={expandAll}
          />
        ) : (
          <FileNode
            key={node.path}
            node={node}
            selectedPath={selectedPath}
            onSelect={onSelect}
            depth={depth}
          />
        ),
      )}
    </>
  );
}

function DirectoryNode({
  node,
  selectedPath,
  onSelect,
  depth,
  version,
  expandAll,
}: {
  node: TreeNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth: number;
  version?: number;
  expandAll?: boolean;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (version !== undefined && expandAll !== undefined) {
      setOpen(expandAll);
    }
  }, [version]);

  return (
    <li className={styles.directoryItem}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              className={styles.menuButtonGap}
              style={{ paddingLeft: `${depth * 8 + 8}px` }}
            />
          }
        >
          <ChevronRight
            className={styles.chevron}
            data-open={open}
          />
          <Suspense fallback={<span className={styles.iconPlaceholder} />}>
            <FolderIcon
              folderName={node.name}
              width={14}
              height={14}
              className={styles.fileIcon}
            />
          </Suspense>
          <span className={styles.fileName}>{node.name}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className={styles.nestedList}>
            <FileTree
              tree={node.children ?? []}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
              version={version}
              expandAll={expandAll}
            />
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

function FileNode({
  node,
  selectedPath,
  onSelect,
  depth,
}: {
  node: TreeNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth: number;
}) {
  const isSelected = node.path === selectedPath;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isSelected}
        onClick={() => onSelect(node.path)}
        className={styles.menuButtonGap}
        style={{ paddingLeft: `${depth * 8 + 8}px` }}
      >
        <span className={styles.spacer} />
        <Suspense fallback={<span className={styles.iconPlaceholder} />}>
          <FileIcon
            fileName={node.name}
            autoAssign
            width={14}
            height={14}
            className={styles.fileIcon}
          />
        </Suspense>
        <span
          className={`${styles.fileName} ${fileNameClass[node.status ?? ""] ?? ""}`}
        >
          {node.name}
        </span>
        <StatusBadge status={node.status} />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
