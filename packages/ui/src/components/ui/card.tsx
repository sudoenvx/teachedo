import * as React from "react"
import { cn } from "cn"

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm" | "md" | "xs"
  variant?: "default" | "transparent" | "window"
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card flex flex-col overflow-hidden rounded-lg bg-surface text-sm text-text",
        "[--card-spacing:--spacing(3)] data-[size=xs]:[--card-spacing:--spacing(1.5)] data-[size=sm]:[--card-spacing:--spacing(2)] data-[size=md]:[--card-spacing:--spacing(4)]",
        "data-[variant=transparent]:border-transparent data-[variant=transparent]:bg-transparent",
        // Added: Extra inner container spacing for the window layout so the nested elements don't hit the outer border
        "p-(--card-spacing)", 
        "gap-(--card-spacing)", 
        "data-[variant=window]:p-(--card-spacing)", 
        "*:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-0.5 rounded-t-lg  has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        // "[.border-b]:pb-(--card-spacing)",
        // "border-b border-border",
        // Added: Override top corner rounding if nested inside a window layout padding
        "group-data-[variant=window]/card:bg-surface group-data-[variant=window]/card:rounded-lg",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-text-secondary text-base font-bold group-data-[size=sm]/card:text-sm group-data-[size=xs]/card:text-sm group-[&:not(:has([data-slot=card-description]))]/card-header:text-xs",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm group-data-[size=xs]/card:text-2xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "",
        // Updated: Added rounded corners and removed the top-padding killer for the window variant
        "group-data-[variant=window]/card:bg-muted/50 group-data-[variant=window]/card:rounded-md",
        // "group-has-data-[slot=card-header]/card:group-data-[variant=default]/card:pt-0", 
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-lg ",
        // Added: Override bottom corners rounding for window layouts
        "group-data-[variant=window]/card:bg-surface group-data-[variant=window]/card:rounded-lg group-data-[variant=window]/card:border-t-0",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
