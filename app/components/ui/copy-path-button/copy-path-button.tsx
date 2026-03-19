import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import styles from "./copy-path-button.module.css";

function CopyPathButton({
  path,
  className,
  ...props
}: { path: string } & Omit<React.ComponentProps<"button">, "children">) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [path]);

  return (
    <button
      onClick={handleCopy}
      title="Copy file path"
      className={`${styles.button}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export { CopyPathButton };
