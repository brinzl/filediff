import * as React from "react";
import { PanelLeftIcon } from "lucide-react";

import { Button } from "@app/components/ui/button/button";
import { Input } from "@app/components/ui/input/input";
import { Separator } from "@app/components/ui/separator/separator";
import { Skeleton } from "@app/components/ui/skeleton/skeleton";
import styles from "./sidebar.module.css";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    setOpen((open) => !open);
  }, [setOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, toggleSidebar }),
    [state, open, setOpen, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={`${styles.wrapper}${className ? ` ${className}` : ""}`}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { state } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={`${styles.sidebarNone}${className ? ` ${className}` : ""}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={styles.sidebar}
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div data-slot="sidebar-gap" className={styles.sidebarGap} />
      <div
        data-slot="sidebar-container"
        data-variant={variant}
        data-side={side}
        className={`${styles.sidebarContainer}${className ? ` ${className}` : ""}`}
        {...props}
      >
        <div data-sidebar="sidebar" data-slot="sidebar-inner" className={styles.sidebarInner}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={`${styles.trigger}${className ? ` ${className}` : ""}`}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={`${styles.rail}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={`${styles.inset}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={`${styles.sidebarInput}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={`${styles.header}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={`${styles.footer}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={`${styles.sidebarSeparator}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={`${styles.content}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={`${styles.group}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={`${styles.groupLabel}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={`${styles.groupAction}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={`${styles.groupContent}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={`${styles.menu}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={`${styles.menuItem}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarMenuButton({
  isActive = false,
  variant = "default",
  size = "default",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  isActive?: boolean;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}) {
  return (
    <button
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      data-variant={variant}
      className={`${styles.menuButton}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarMenuAction({
  className,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  showOnHover?: boolean;
}) {
  return (
    <button
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      data-show-on-hover={showOnHover || undefined}
      className={`${styles.menuAction}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={`${styles.menuBadge}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={`${styles.menuSkeleton}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {showIcon && (
        <Skeleton
          style={{ width: 16, height: 16, borderRadius: "var(--radius-md)" }}
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        style={{ height: 16, maxWidth: width, flex: 1 }}
        data-sidebar="menu-skeleton-text"
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={`${styles.menuSub}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={`${styles.menuSubItem}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  return (
    <a
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={`${styles.menuSubButton}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
