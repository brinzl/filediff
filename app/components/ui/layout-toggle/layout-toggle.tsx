import { Columns2, Rows2 } from "lucide-react";
import styles from "./layout-toggle.module.css";

function LayoutToggle({
  layout,
  onLayoutChange,
  className,
}: {
  layout: string;
  onLayoutChange: (layout: "split" | "unified") => void;
  className?: string;
}) {
  return (
    <div className={`${styles.container}${className ? ` ${className}` : ""}`}>
      <button
        onClick={() => onLayoutChange("split")}
        data-active={layout === "split"}
        className={styles.toggle}
      >
        <Columns2 />
        Split
      </button>
      <button
        onClick={() => onLayoutChange("unified")}
        data-active={layout === "unified"}
        className={styles.toggle}
      >
        <Rows2 />
        Stacked
      </button>
    </div>
  );
}

export { LayoutToggle };
