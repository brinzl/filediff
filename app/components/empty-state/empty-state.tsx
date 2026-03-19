import { FileCode2 } from "lucide-react";
import styles from "./empty-state.module.css";

export function EmptyState() {
  return (
    <div className={styles.container}>
      <FileCode2 className={styles.icon} />
      <p>Select a file to view its diff</p>
    </div>
  );
}
