"use client";

import { Badge } from "@/components/ui/badge";
import { QuotationStatus } from "@/lib/types/quotation";

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
}

const statusConfig: Record<
  QuotationStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "default" },
  accepted: { label: "Accepted", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
  expired: { label: "Expired", variant: "secondary" },
};

export function QuotationStatusBadge({ status }: QuotationStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={
        status === "accepted"
          ? "bg-green-100 text-green-800 hover:bg-green-100"
          : status === "sent"
          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
          : status === "expired"
          ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
          : undefined
      }
    >
      {config.label}
    </Badge>
  );
}
