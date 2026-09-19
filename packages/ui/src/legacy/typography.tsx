import { cn } from "cn"
import React from "react"


export type TypographyVariant =
  | "display-large"
  | "display-medium"
  | "display-small"
  | "headline-large"
  | "headline-medium"
  | "headline-small"
  | "title-large"
  | "title-medium"
  | "title-small"
  | "body-large"
  | "body-medium"
  | "body-small"
  | "label-large"
  | "label-medium"
  | "label-small"

export type TypographyElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "label"

interface TypographyProps {
  variant: TypographyVariant
  element?: TypographyElement
  className?: string
  children: React.ReactNode
}

// Typography variant styles mapping
const typographyStyles: Record<TypographyVariant, string> = {
  // DISPLAYS (Massive, for heroes)
  "display-large": "text-[57px] font-normal leading-[64px] tracking-tight",
  "display-medium": "text-[45px] font-normal leading-[52px] tracking-tight",
  "display-small": "text-[36px] font-normal leading-[44px] tracking-tight",
  
  // HEADLINES (For page/section headers)
  "headline-large": "text-[28px] font-semibold leading-[40px] tracking-tight",
  "headline-medium": "text-[24px] font-semibold leading-[36px] tracking-tight",
  "headline-small": "text-[22px] font-semibold leading-[32px] tracking-tight", /* Fixed leading */
  
  // TITLES (For cards, popups, and components)
  "title-large": "text-[20px] font-medium leading-[28px] tracking-tight", /* Changed to 28px for better breathing room */
  "title-medium": "text-[18px] font-medium leading-6 tracking-normal",
  "title-small": "text-[16px] font-medium leading-5 tracking-normal",
  
  // BODY (For paragraphs and long reading)
  /* Note: Change to 16px/14px/12px if this is not a high-density dashboard */
  "body-large": "text-[14px] font-normal leading-relaxed tracking-normal",
  "body-medium": "text-[13px] font-normal leading-5 tracking-normal",
  "body-small": "text-[12px] font-normal leading-4 tracking-normal",
  
  // LABELS (For buttons, badges, navigation — highly legible)
  "label-large": "text-[14px] font-medium leading-5 tracking-normal", /* Unified syntax */
  "label-medium": "text-[12px] font-medium leading-4 tracking-wide", /* Unified syntax */
  "label-small": "text-[11px] font-medium leading-4 tracking-wide uppercase",
}

// Base Typography component with proper type constraints
export function Typography({
  variant,
  element = "p",
  className,
  children,
  ...props
}: TypographyProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof TypographyProps>) {
  
  // Create the component with proper typing
  const elementProps = {
    className: cn(typographyStyles[variant], className),
    ...props,
    children,
  }

  // Use React.createElement for better type safety
  return React.createElement(element, elementProps)
}

// Specific typography components for common use cases
interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: "large" | "medium" | "small"
  className?: string
  children: React.ReactNode
}

export function Heading({
  level = 1,
  size = "small",
  className,
  children,
  ...props
}: HeadingProps & Omit<React.HTMLAttributes<HTMLHeadingElement>, keyof HeadingProps>) {
  const element = `h${level}` as TypographyElement
  const variant = `headline-${size}` as TypographyVariant

  return (
    <Typography variant={variant} element={element} className={className} {...props}>
      {children}
    </Typography>
  )
}

interface DisplayProps {
  size?: "large" | "medium" | "small"
  className?: string
  children: React.ReactNode
}

export function Display({
  size = "large",
  className,
  children,
  ...props
}: DisplayProps & Omit<React.HTMLAttributes<HTMLHeadingElement>, keyof DisplayProps>) {
  const variant = `display-${size}` as TypographyVariant

  return (
    <Typography variant={variant} element="h1" className={className} {...props}>
      {children}
    </Typography>
  )
}

interface BodyProps {
  size?: "large" | "medium" | "small"
  className?: string
  children: React.ReactNode
}

export function Body({
  size = "medium",
  className,
  children,
  ...props
}: BodyProps & Omit<React.HTMLAttributes<HTMLParagraphElement>, keyof BodyProps>) {
  const variant = `body-${size}` as TypographyVariant

  return (
    <Typography variant={variant} element="p" className={className} {...props}>
      {children}
    </Typography>
  )
}

interface TitleProps {
  size?: "large" | "medium" | "small"
  element?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
  className?: string
  children: React.ReactNode
}

export function Title({
  size = "small",
  element = "h3",
  className,
  children,
  ...props
}: TitleProps & Omit<React.HTMLAttributes<HTMLElement>, keyof TitleProps>) {
  const variant = `title-${size}` as TypographyVariant

  return (
    <Typography variant={variant} element={element} className={className} {...props}>
      {children}
    </Typography>
  )
}

interface LabelProps {
  size?: "large" | "medium" | "small"
  htmlFor?: string
  className?: string
  children: React.ReactNode
}

export function Label({
  size = "small",
  className,
  children,
  ...props
}: LabelProps & Omit<React.LabelHTMLAttributes<HTMLLabelElement>, keyof LabelProps>) {
  const variant = `label-${size}` as TypographyVariant

  return (
    <Typography variant={variant} element="label" className={className} {...props}>
      {children}
    </Typography>
  )
}

// Utility component for inline text with specific styling
interface TextProps {
  variant?: TypographyVariant
  className?: string
  children: React.ReactNode
}

export function Text({
  variant = "body-medium",
  className,
  children,
  ...props
}: TextProps & Omit<React.HTMLAttributes<HTMLSpanElement>, keyof TextProps>) {
  return (
    <Typography variant={variant} element="span" className={className} {...props}>
      {children}
    </Typography>
  )
}