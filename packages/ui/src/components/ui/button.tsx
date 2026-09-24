import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border-neutral-500 hover:bg-neutral-200 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        accent: "bg-accent text-accent-foreground hover:bg-accent-hover aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive: "bg-destructive/20 text-destructive hover:bg-destructive/30 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        neutral: "bg-neutral-200 text-text hover:bg-neutral-300 aria-expanded:bg-muted aria-expanded:text-muted-foreground dark:bg-neutral-700 dark:text-black dark:hover:bg-neutral-600 dark:aria-expanded:bg-muted dark:aria-expanded:text-muted-foreground",

        "neutral-muted": "bg-neutral-300 text-text hover:bg-neutral-400/60 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30 dark:text-text dark:hover:bg-neutral-600 dark:aria-expanded:bg-muted dark:aria-expanded:text-muted-foreground",

        "neutral-outline": "border-neutral-500 text-text bg-neutral-200 hover:bg-neutral-300 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30 dark:text-text dark:hover:bg-neutral-600 dark:aria-expanded:bg-muted dark:aria-expanded:text-muted-foreground"
      },
      size: {
        // py-1.5 (6px) | px-3 (12px)
        default: "py-1.5 px-3 text-xs gap-1 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        
        // py-0.5 (2px) | px-1 (4px)
        xs: "py-0.5 px-1 rounded-sm text-[0.625rem]/none gap-1 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&_svg:not([class*='size-'])]:size-2.5",
        
        // py-1 (4px) | px-2 (8px)
        sm: "py-1.5 px-2 rounded-[calc(var(--radius-md)-0.1rem)] text-[11px]/none gap-1 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        
        // py-2 (8px) | px-4 (16px)
        lg: "py-3 px-4 text-sm/none gap-1 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        
        // Icon variants retain square dimensions using aspect-square or matching padding
        icon: "p-1.5 aspect-square [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "p-0.5 rounded-sm aspect-square [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "p-1 aspect-square [&_svg:not([class*='size-'])]:size-3",
        "icon-md": "p-1.5 aspect-square [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "p-2 aspect-square [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
