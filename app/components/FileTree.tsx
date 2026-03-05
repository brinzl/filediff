import { useState, useEffect, lazy, Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const FileIcon = lazy(() => import("@react-symbols/icons/utils").then((m) => ({ default: m.FileIcon })));
const FolderIcon = lazy(() => import("@react-symbols/icons/utils").then((m) => ({ default: m.FolderIcon })));

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
  /** When this changes, all directories reset to `expandAll` */
  version?: number;
  expandAll?: boolean;
}

const statusColor: Record<string, string> = {
  M: "text-amber-200",
  A: "text-green-300",
  D: "text-red-400",
  R: "text-blue-400",
};

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  return (
    <span className={`ml-auto shrink-0 text-xs font-bold leading-none ${statusColor[status] ?? "text-muted-foreground"}`}>
      {status}
    </span>
  );
}

export function FileTree({ tree, selectedPath, onSelect, depth = 0, version, expandAll }: FileTreeProps) {
  return (
    <>
      {tree.map((node) =>
        node.type === "directory" ? (
          <DirectoryNode key={node.path} node={node} selectedPath={selectedPath} onSelect={onSelect} depth={depth} version={version} expandAll={expandAll} />
        ) : (
          <FileNode key={node.path} node={node} selectedPath={selectedPath} onSelect={onSelect} depth={depth} />
        ),
      )}
    </>
  );
}

function DirectoryNode({ node, selectedPath, onSelect, depth, version, expandAll }: {
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
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="gap-1" style={{ paddingLeft: `${depth * 8 + 8}px` }}>
            <ChevronRight className={`size-3 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
            <Suspense fallback={<span className="size-3.5 shrink-0" />}>
              <FolderIcon folderName={node.name} width={14} height={14} className="shrink-0" />
            </Suspense>
            <span className="truncate">{node.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <FileTree tree={node.children ?? []} selectedPath={selectedPath} onSelect={onSelect} depth={depth + 1} version={version} expandAll={expandAll} />
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function FileNode({ node, selectedPath, onSelect, depth }: {
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
        className="gap-1"
        style={{ paddingLeft: `${depth * 8 + 8}px` }}
      >
        <span className="size-3 shrink-0" />
        <Suspense fallback={<span className="size-3.5 shrink-0" />}>
          <FileIcon fileName={node.name} autoAssign width={14} height={14} className="shrink-0" />
        </Suspense>
        <span className={`truncate ${statusColor[node.status ?? ""] ?? ""}`}>{node.name}</span>
        <StatusBadge status={node.status} />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
