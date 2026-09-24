import { useMemo } from "react";
import {
  Badge,
  DataTable,
  type DataTableColumn,
} from "@teachedo/ui/components";
import type { InvoiceItem } from "../types/teacher-profile.types";

export function TeacherBillingTab({ invoices }: { invoices: InvoiceItem[] }) {
  const columns = useMemo<DataTableColumn<InvoiceItem>[]>(
    () => [
      {
        header: "الشهر المفوتر",
        accessor: "month",
        cellClassName: "font-semibold text-[12px] text-text",
      },
      {
        header: "المبلغ المطلوب",
        render: (row) => (
          <span className="font-semibold tabular-nums text-primary">
            {row.amount.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        header: "المبلغ المدفوع",
        render: (row) => (
          <span className="font-semibold tabular-nums text-success">
            {row.amountPaid.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        header: "الحالة",
        render: (row) => (
          <Badge
            variant={
              row.isPaid || row.status === "paid" ? "success" : "warning"
            }
            size="sm"
          >
            {row.isPaid || row.status === "paid" ? "مسددة بالكامل" : "مستحقة"}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      title="سجل دورات الفوترة الشهرية"
      description="الفواتير الصادرة للمدرس بناءً على عدد الطلاب النشطين نهاية كل شهر."
      data={invoices}
      columns={columns}
      getRowId={(row) => row.id}
    />
  );
}
