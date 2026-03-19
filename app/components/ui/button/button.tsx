import * as React from "react";
import styles from "./button.module.css";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={`${styles.button}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

export { Button };
export type { ButtonVariant, ButtonSize };
