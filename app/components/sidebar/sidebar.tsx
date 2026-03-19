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
} from "@app/components/ui/sidebar/sidebar";
import { FileTree } from "@app/components/file-tree/file-tree";
import styles from "./sidebar.module.css";

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

export function AppSidebar({
  tree,
  selectedPath,
  onFileSelect,
  ...props
}: AppSidebarProps) {
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
        <div className={styles.headerRow}>
          <GitBranch className={styles.headerIcon} />
          <span className={styles.headerTitle}>Changed Files</span>
          <span className={styles.headerBadge}>{countFiles(tree)}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className={styles.labelRow}>
            <SidebarGroupLabel className={styles.labelFlex}>
              Files
            </SidebarGroupLabel>
            <div className={styles.actionButtons}>
              <button
                onClick={expandAllDirs}
                className={styles.actionButton}
                title="Expand all"
              >
                <ChevronsUpDown className={styles.actionButtonIcon} />
              </button>
              <button
                onClick={collapseAll}
                className={styles.actionButton}
                title="Collapse all"
              >
                <ChevronsDownUp className={styles.actionButtonIcon} />
              </button>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className={styles.noGap}>
              <FileTree
                tree={tree}
                selectedPath={selectedPath}
                onSelect={onFileSelect}
                version={version}
                expandAll={expandAll}
              />
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
