import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import styles from "./separator.module.css";

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
  return (
    <SeparatorPrimitive
      orientation={orientation}
      className={`${styles.separator}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

export { Separator };
