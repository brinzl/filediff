import { useState, useCallback } from "react";
import { GitBranch, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar";
import { FileTree } from "@/components/FileTree";

interface TreeNode {
  type: "file" | "directory";
  name: string;
  path: string;
  status?: string;
  children?: TreeNode[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  tree: TreeNode[];
  selectedPath: string | null;
  onFileSelect: (path: string) => void;
}

export function AppSidebar({ tree, selectedPath, onFileSelect, ...props }: AppSidebarProps) {
  const [version, setVersion] = useState(0);
  const [expandAll, setExpandAll] = useState(false);

  const collapseAll = useCallback(() => {
    setExpandAll(false);
    setVersion((v) => v + 1);
  }, []);

  const expandAllDirs = useCallback(() => {
    setExpandAll(true);
    setVersion((v) => v + 1);
  }, []);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <GitBranch className="size-3.5 text-muted-foreground" />
          <span className="font-medium">Changed Files</span>
          <span className="ml-auto rounded-full bg-sidebar-accent px-2 py-0.5 text-muted-foreground">
            {countFiles(tree)}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center">
            <SidebarGroupLabel className="flex-1">Files</SidebarGroupLabel>
            <div className="flex items-center gap-0.5 pr-2">
              <button
                onClick={expandAllDirs}
                className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                title="Expand all"
              >
                <ChevronsUpDown className="size-3.5" />
              </button>
              <button
                onClick={collapseAll}
                className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                title="Collapse all"
              >
                <ChevronsDownUp className="size-3.5" />
              </button>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              <FileTree tree={tree} selectedPath={selectedPath} onSelect={onFileSelect} version={version} expandAll={expandAll} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function countFiles(nodes: TreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === "file" && node.status) count++;
    if (node.children) count += countFiles(node.children);
  }
  return count;
}
