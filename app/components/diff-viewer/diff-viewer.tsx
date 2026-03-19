import { useState } from "react";
import { MultiFileDiff } from "@pierre/diffs/react";
import { CopyPathButton } from "@app/components/ui/copy-path-button/copy-path-button";
import { LayoutToggle } from "@app/components/ui/layout-toggle/layout-toggle";
import styles from "./diff-viewer.module.css";

const diffStyles: Record<string, string> = {
  "--diffs-header-font-family": "Inter",
  "--diffs-font-family": "'JetBrains Mono', monospace",
  "--diffs-font-size": "13px",
  "--diffs-line-height": "1.5",
  "--diffs-tab-size": "2",
};

interface FileContents {
  name: string;
  contents: string;
}

interface DiffViewerProps {
  oldFile: FileContents;
  newFile: FileContents;
  filePath: string;
}

export function DiffViewer({ oldFile, newFile, filePath }: DiffViewerProps) {
  const [layout, setLayout] = useState<"split" | "unified">("split");

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <LayoutToggle layout={layout} onLayoutChange={setLayout} />
      </div>
      <div className={styles.scrollArea}>
        <div className={styles.diffWrapper}>
          <MultiFileDiff
            oldFile={oldFile}
            newFile={newFile}
            style={diffStyles}
            options={{
              theme: "pierre-dark",
              diffStyle: layout,
              diffIndicators: "bars",
              overflow: "scroll",
              expandUnchanged: false,
              hunkSeparators: "line-info",
              expansionLineCount: 100,
            }}
            renderHeaderMetadata={() => (
              <CopyPathButton path={filePath} />
            )}
          />
        </div>
      </div>
    </div>
  );
}
