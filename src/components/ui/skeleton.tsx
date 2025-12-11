import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-shimmer rounded-lg bg-gradient-to-r from-secondary via-muted to-secondary", className)} {...props} />;
}

export { Skeleton };
