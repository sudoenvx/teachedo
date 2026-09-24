// "use client"

// import * as React from "react"
// import { cn } from "cn"

// function Table({ className, ...props }: React.ComponentProps<"table">) {
//   return (
//     <div
//       data-slot="table-container"
//       className="relative w-full overflow-x-auto"
//     >
//       <table
//         data-slot="table"
//         className={cn("w-full caption-bottom text-sm", className)}
//         {...props}
//       />
//     </div>
//   )
// }

// function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
//   return (
//     <thead
//       data-slot="table-header"
//       className={cn("[&_tr]:border-b", className)}
//       {...props}
//     />
//   )
// }

// function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
//   return (
//     <tbody
//       data-slot="table-body"
//       className={cn("[&_tr:last-child]:border-0", className)}
//       {...props}
//     />
//   )
// }

// function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
//   return (
//     <tfoot
//       data-slot="table-footer"
//       className={cn(
//         "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
//         className
//       )}
//       {...props}
//     />
//   )
// }

// function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
//   return (
//     <tr
//       data-slot="table-row"
//       className={cn(
//         "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
//         className
//       )}
//       {...props}
//     />
//   )
// }

// function TableHead({ className, ...props }: React.ComponentProps<"th">) {
//   return (
//     <th
//       data-slot="table-head"
//       className={cn(
//         "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
//         className
//       )}
//       {...props}
//     />
//   )
// }

// function TableCell({ className, ...props }: React.ComponentProps<"td">) {
//   return (
//     <td
//       data-slot="table-cell"
//       className={cn(
//         "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
//         className
//       )}
//       {...props}
//     />
//   )
// }

// function TableCaption({
//   className,
//   ...props
// }: React.ComponentProps<"caption">) {
//   return (
//     <caption
//       data-slot="table-caption"
//       className={cn("mt-4 text-sm text-muted-foreground", className)}
//       {...props}
//     />
//   )
// }

// export {
//   Table,
//   TableHeader,
//   TableBody,
//   TableFooter,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableCaption,
// }


import * as React from "react"
import { cn } from "cn"

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn("w-full text-sm caption-bottom", className)} {...props} />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-muted text-text [&_tr]:border-b-0", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn("border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn("border-b border-border transition-colors hover:bg-surface-secondary/50 data-[state=selected]:bg-muted-light", className)} {...props} />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn("h-10 px-3 py-2 text-start align-middle text-[12px] font-medium uppercase tracking-wider text-muted-foreground [&:has([role=checkbox])]:pr-3", className)} {...props} />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("px-3 py-2.5 align-middle text-[13px] [&:has([role=checkbox])]:pr-3", className)} {...props} />
))
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell }