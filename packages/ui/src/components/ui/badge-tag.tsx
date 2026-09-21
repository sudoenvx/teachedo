import { createContext, useContext, useMemo, type ComponentProps } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";


/* ==========================================================================
   BadgeTag: a pill that pairs a short message with an optional lead-in label
   and a trailing action.

   Anatomy
   <BadgeTag variant size render?>       the pill (can itself be a link via `render`)
     <BadgeTagLabel />                   leading solid / outlined chip (text, icon, avatar)
     <BadgeTagText emphasis? />          message; icons can sit inside
     <BadgeTagSeparator shape? />        thin line or dot between parts
     <BadgeTagAction appearance? />      trailing button or link

   Every part reads `variant` and `size` from the root, so colors stay in sync.
   ========================================================================== */

/* ---- styles ------------------------------------------------------------- */

const badgeTagVariants = cva(
  "inline-flex w-fit max-w-full items-center rounded-full border p-1 [&_svg]:shrink-0 [a&]:transition-[filter] [a&]:hover:brightness-95",
  {
    variants: {
      variant: {
        default: "border-border bg-neutral-100 text-text",
        primary: "border-primary/25 bg-primary/10 text-primary",
        info: "border-blue-300 bg-blue-100 text-blue-600",
        success: "border-green-300 bg-green-100 text-green-600",
        violet: "border-violet-300 bg-violet-100 text-violet-600",
        destructive:
          "border-destructive/30 bg-destructive/20 text-destructive-subtle-foreground",
        outline: "border-border bg-surface text-text-muted",
        ghost: "border-transparent bg-transparent text-text-muted",
      },
      size: {
        default: "gap-2.5 text-sm [&_svg]:size-4",
        sm: "gap-2 text-xs [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/** The solid chip look, shared by <BadgeTagLabel /> and <BadgeTagAction appearance="solid" />. */
const chipVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium has-data-[slot=avatar]:ps-1",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-text",
        primary: "border-transparent bg-primary text-primary-foreground",
        info: "border-transparent bg-blue-500 text-white",
        success: "border-transparent bg-green-500 text-white",
        violet: "border-transparent bg-violet-500 text-white",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-primary/25 bg-surface text-primary",
        ghost: "border-primary/25 bg-surface text-primary",
      },
      size: {
        default: "px-3 py-1",
        sm: "px-2.5 py-0.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/** Text next to the chip. Also styles the `link` and `muted` actions. */
const textVariants = cva("inline-flex items-center gap-1.5", {
  variants: {
    emphasis: {
      default: "",
      strong: "font-semibold",
      muted: "text-text-muted",
      gradient:
        "bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text font-semibold text-transparent",
    },
    size: {
      default: "py-1 first:ps-3 last:pe-3",
      sm: "py-0.5 first:ps-2.5 last:pe-2.5",
    },
  },
  defaultVariants: { emphasis: "default", size: "default" },
});

/* ---- context ------------------------------------------------------------ */

type BadgeTagVariant = NonNullable<VariantProps<typeof badgeTagVariants>["variant"]>;
type BadgeTagSize = NonNullable<VariantProps<typeof badgeTagVariants>["size"]>;

const BadgeTagContext = createContext<{ variant: BadgeTagVariant; size: BadgeTagSize }>({
  variant: "default",
  size: "default",
});

const useBadgeTag = () => useContext(BadgeTagContext);

/** Outline and ghost badges have a neutral text color, so emphasized text picks up the primary color. */
const isNeutral = (variant: BadgeTagVariant) => variant === "outline" || variant === "ghost";

/* ---- parts -------------------------------------------------------------- */

type BadgeTagProps = useRender.ComponentProps<"div"> & {
  variant?: BadgeTagVariant;
  size?: BadgeTagSize;
};

function BadgeTag({ variant = "default", size = "default", className, render, ...props }: BadgeTagProps) {
  const context = useMemo(() => ({ variant, size }), [variant, size]);

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">({ className: cn(badgeTagVariants({ variant, size }), className) }, props),
    render,
    state: { slot: "badge-tag", variant, size },
  });

  return <BadgeTagContext.Provider value={context}>{element}</BadgeTagContext.Provider>;
}

/** Leading chip. Accepts text, an icon or an <Avatar className="size-5" />. */
function BadgeTagLabel({ className, ...props }: ComponentProps<"span">) {
  const { variant, size } = useBadgeTag();
  return (
    <span
      data-slot="badge-tag-label"
      className={cn(chipVariants({ variant, size }), className)}
      {...props}
    />
  );
}

type BadgeTagTextProps = ComponentProps<"span"> & VariantProps<typeof textVariants>;

/** The message. Put icons inside it; avoid them with `emphasis="gradient"`, which makes them transparent. */
function BadgeTagText({ emphasis = "default", className, ...props }: BadgeTagTextProps) {
  const { variant, size } = useBadgeTag();
  return (
    <span
      data-slot="badge-tag-text"
      className={cn(
        textVariants({ emphasis, size }),
        emphasis === "strong" && isNeutral(variant) && "text-primary",
        className,
      )}
      {...props}
    />
  );
}

type BadgeTagSeparatorProps = ComponentProps<"span"> & { shape?: "line" | "dot" };

function BadgeTagSeparator({ shape = "line", className, ...props }: BadgeTagSeparatorProps) {
  return (
    <span
      aria-hidden
      data-slot="badge-tag-separator"
      className={cn(
        "shrink-0 bg-current opacity-30",
        shape === "line" ? "h-4 w-px" : "size-1 rounded-full",
        className,
      )}
      {...props}
    />
  );
}

type BadgeTagActionProps = useRender.ComponentProps<"button"> & {
  /** `solid`: chip-style button. `link`: bold text. `muted`: quiet text. */
  appearance?: "solid" | "link" | "muted";
};

/** Trailing action. A <button> by default; pass `render={<a href="…" />}` or your router's <Link />. */
function BadgeTagAction({ appearance = "solid", className, render, ...props }: BadgeTagActionProps) {
  const { variant, size } = useBadgeTag();

  const appearanceClassName =
    appearance === "solid"
      ? cn(chipVariants({ variant, size }), "transition-[filter] hover:brightness-95")
      : cn(
          textVariants({ emphasis: appearance === "link" ? "strong" : "muted", size }),
          appearance === "link" && "hover:underline",
          appearance === "link" && isNeutral(variant) && "text-primary",
          appearance === "muted" && "hover:text-text",
        );

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: render ? undefined : "button",
        className: cn(
          "cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          appearanceClassName,
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "badge-tag-action", appearance },
  });
}

export {
  BadgeTag,
  BadgeTagLabel,
  BadgeTagText,
  BadgeTagSeparator,
  BadgeTagAction,
  badgeTagVariants,
};
export type { BadgeTagProps, BadgeTagVariant, BadgeTagSize };