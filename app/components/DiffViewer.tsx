import { useState } from "react";
import { Columns2, Rows2 } from "lucide-react";
import { PatchDiff } from "@pierre/diffs/react";

const diffStyles: Record<string, string> = {
  "--diffs-header-font-family": "Inter",
  "--diffs-font-family": "'JetBrains Mono', monospace",
  "--diffs-font-size": "14px",
  "--diffs-line-height": "1.8",
  "--diffs-tab-size": "2",
};

interface DiffViewerProps {
  diff: string;
}

export function DiffViewer({ diff }: DiffViewerProps) {
  const [layout, setLayout] = useState<"split" | "unified">("split");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-1 px-4 pt-2">
        <LayoutToggle layout={layout} onLayoutChange={setLayout} />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="overflow-hidden rounded-lg border border-border">
          <PatchDiff
            patch={diff}
            style={diffStyles}
            options={{
              theme: "pierre-dark",
              diffStyle: layout,
              diffIndicators: "bars",
              overflow: "scroll",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function LayoutToggle({ layout, onLayoutChange }: {
  layout: string;
  onLayoutChange: (layout: "split" | "unified") => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md bg-muted p-0.5">
      <button
        onClick={() => onLayoutChange("split")}
        className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 font-medium transition-colors ${layout === "split"
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
          }`}
      >
        <Columns2 className="size-3.5" />
        Split
      </button>
      <button
        onClick={() => onLayoutChange("unified")}
        className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 font-medium transition-colors ${layout === "unified"
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
          }`}
      >
        <Rows2 className="size-3.5" />
        Stacked
      </button>
    </div>
  );
}
