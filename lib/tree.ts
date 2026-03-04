export interface TreeNode {
  type: 'file' | 'directory';
  name: string;
  path: string;
  status?: string;
  children?: TreeNode[];
}

interface StatusFile {
  status: string;
  path: string;
}

export function buildTree(files: StatusFile[]): TreeNode[] {
  const root: TreeNode[] = [];
  const dirMap = new Map<string, TreeNode>();
  for (const { path, status } of files) {
    const parts = path.split('/');
    let currentPath = '';
    let currentLevel = root;

    parts.forEach((name, i) => {
      const isLast = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${name}` : name;

      if (isLast) {
        currentLevel.push({ type: 'file', name, path: currentPath, status });
      } else {
        let dir = dirMap.get(currentPath);

        if (!dir) {
          dir = { type: 'directory', name, path: currentPath, children: [] };
          dirMap.set(currentPath, dir);
          currentLevel.push(dir);
        }
        currentLevel = dir.children!;
      }
    });
  }

  return sortTree(root);
}

function sortTree(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .sort((a, b) =>
      (a.type === b.type ? 0 : a.type === 'directory' ? -1 : 1) ||
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    )
    .map(node => ({
      ...node,
      ...(node.children && { children: sortTree(node.children) })
    }));
}
