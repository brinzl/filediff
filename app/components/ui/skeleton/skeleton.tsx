import styles from "./skeleton.module.css";

function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={`${styles.skeleton}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

export { Skeleton };
