"use client";

import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/lib/types/invoice";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "default" },
  paid: { label: "Paid", variant: "outline" },
  overdue: { label: "Overdue", variant: "destructive" },
};

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={
        status === "paid"
          ? "bg-green-100 text-green-800 hover:bg-green-100"
          : status === "sent"
          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
          : undefined
      }
    >
      {config.label}
    </Badge>
  );
}
