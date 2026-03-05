import { Columns2, Rows2 } from "lucide-react"

import { cn } from "@/lib/utils"

function LayoutToggle({
  layout,
  onLayoutChange,
  className,
}: {
  layout: string
  onLayoutChange: (layout: "split" | "unified") => void
  className?: string
}) {
  return (
    <div className={cn("inline-flex items-center rounded-md bg-muted p-0.5", className)}>
      <button
        onClick={() => onLayoutChange("split")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 font-medium transition-colors",
          layout === "split"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Columns2 className="size-3.5" />
        Split
      </button>
      <button
        onClick={() => onLayoutChange("unified")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 font-medium transition-colors",
          layout === "unified"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Rows2 className="size-3.5" />
        Stacked
      </button>
    </div>
  )
}

export { LayoutToggle }
