import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Button } from "./button"
import { Textarea } from "./textarea"
import { Input } from "./input"

const inputGroupVariants = cva(
  "group/input-group relative flex h-7 w-full min-w-0 items-center rounded-sm border border-input-border bg-surface transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 group-data-[disabled=true]/input-group:border-disabled-background group-data-[disabled=true]/input-group:bg-disabled-background in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-data-[align=block-end]:rounded-sm has-data-[align=block-start]:rounded-sm has-[[data-slot=input-group-control]:focus-visible]:border-ring  has-[[data-slot=input-group-control]:focus-visible]:border-input-border-focus! 30 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:border-2 has-[textarea]:rounded-sm has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:bg-input/30 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5",
  {
    variants: {
      size: {
        default: "h-8 text-sm [&>input]:px-2 [&>input]:py-1 [&>textarea]:px-2 [&>textarea]:py-1",
        xs: "h-6 text-xs [&>input]:px-1.5 [&>input]:py-0.5 [&>textarea]:px-1.5 [&>textarea]:py-0.5",
        sm: "h-7 text-sm [&>input]:px-2 [&>input]:py-1 [&>textarea]:px-2 [&>textarea]:py-1",
        md: "h-9 text-sm [&>input]:px-3 [&>input]:py-2 [&>textarea]:px-3 [&>textarea]:py-2",
        lg: "h-11 text-base [&>input]:px-4 [&>input]:py-3 [&>textarea]:px-4 [&>textarea]:py-3",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

interface InputGroupProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof inputGroupVariants> {
      size?: "xs" | "sm" | "md" | "lg"
    }

function InputGroup({ size, className, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        inputGroupVariants({ size }),
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-1 py-1.5 text-xs/relaxed font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 **:data-[slot=kbd]:rounded-[calc(var(--radius-sm)-2px)] **:data-[slot=kbd]:bg-transparent group-data-[disabled=true]/input-group:bg-disabled-background **:data-[slot=kbd]:px-1 **:data-[slot=kbd]:text-[0.625rem] [&>svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pr-1.5 has-[>button]:mr-[-0.275rem] has-[>kbd]:mr-[-0.275rem]",
        "inline-end":
          "order-last pl-1.5 has-[>button]:ml-[-0.275rem] has-[>kbd]:ml-[-0.275rem]",
        "block-start":
          "order-first w-full justify-start px-2 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end":
          "order-last w-full justify-start px-2 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 rounded-sm text-xs/relaxed shadow-none",
  {
    variants: {
      size: {
        xs: "h-5 gap-1 rounded-[calc(var(--radius-sm)-2px)] px-1 [&>svg:not([class*='size-'])]:size-3",
        sm: "gap-1",
        "icon-xs": "size-6 p-0 has-[>svg]:p-0",
        "icon-sm": "size-7 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset"
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-xs/relaxed text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        // Fixes the autofill background layout distortion cleanly
        "autofill:transition-colors autofill:duration-[9999s] autofill:delay-[9999s]",

        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
