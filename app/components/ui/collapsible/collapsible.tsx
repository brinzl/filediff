import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return <CollapsiblePrimitive.Trigger {...props} />;
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Panel>) {
  return <CollapsiblePrimitive.Panel {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
