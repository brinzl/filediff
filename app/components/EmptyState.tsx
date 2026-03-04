import { FileCode2 } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <FileCode2 className="size-12 opacity-50" />
      <p>Select a file to view its diff</p>
    </div>
  );
}
