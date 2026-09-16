import { Badge } from "./badge";
import { cn } from "cn";

interface DashedPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  live?: boolean;
}

export function DashedPlaceholder({ className, live = true, ...props }: DashedPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted",
        "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--border)_10px,var(--border)_11px)]",
        className
      )}
      {...props}
    >
      {live && (
        <Badge variant="default" className="absolute top-2 right-2 bg-black/65">
          PLACEHOLDER
        </Badge>
      )}
    </div>
  );
}