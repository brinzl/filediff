import { useState } from "react";
import { MultiFileDiff } from "@pierre/diffs/react";
import { CopyPathButton } from "@/components/ui/copy-path-button";
import { LayoutToggle } from "@/components/ui/layout-toggle";

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
}

export function DiffViewer({ oldFile, newFile }: DiffViewerProps) {
  const [layout, setLayout] = useState<"split" | "unified">("split");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-1 px-4 pt-2">
        <LayoutToggle layout={layout} onLayoutChange={setLayout} />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="overflow-hidden rounded-lg border border-border">
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
            renderHeaderMetadata={({ newFile }) => (
              <CopyPathButton path={newFile?.name ?? ""} />
            )}
          />
        </div>
      </div>
    </div>
  );
}
