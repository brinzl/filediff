import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import styles from "./scroll-area.module.css";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      className={`${styles.root}${className ? ` ${className}` : ""}`}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className={styles.viewport}>
        <ScrollAreaPrimitive.Content>
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      className={`${styles.scrollbar}${className ? ` ${className}` : ""}`}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb className={styles.thumb} />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
