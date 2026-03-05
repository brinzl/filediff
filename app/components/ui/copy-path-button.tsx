import { useState, useCallback } from "react"
import { Copy, Check } from "lucide-react"

import { cn } from "@/lib/utils"

function CopyPathButton({
  path,
  className,
  ...props
}: { path: string } & Omit<React.ComponentProps<"button">, "children">) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(path)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [path])

  return (
    <button
      onClick={handleCopy}
      title="Copy file path"
      className={cn(
        "inline-flex items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
      {...props}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

export { CopyPathButton }
