"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoicePreview from "@/components/invoice-preview";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { InvoiceDataWithIds } from "@/lib/types/invoice";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invoiceData, setInvoiceData] =
    React.useState<InvoiceDataWithIds | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadInvoiceById = useInvoiceStore((state) => state.loadInvoiceById);

  React.useEffect(() => {
    const loadInvoice = async () => {
      setIsLoading(true);
      const data = await loadInvoiceById(id);
      setInvoiceData(data);
      setIsLoading(false);
    };

    if (id) {
      loadInvoice();
    }
  }, [id, loadInvoiceById]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Invoice not found</h2>
        <Button onClick={() => router.push("/dashboard/invoices")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/invoices")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>

      <InvoicePreview data={invoiceData} />
    </div>
  );
}
