"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuotationPreview from "@/components/quotation-preview";
import { useQuotationStore, QuotationDataWithIds } from "@/stores/useQuotationStore";

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quotationData, setQuotationData] = React.useState<QuotationDataWithIds | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadQuotationById = useQuotationStore((state) => state.loadQuotationById);

  React.useEffect(() => {
    const loadQuotation = async () => {
      setIsLoading(true);
      const data = await loadQuotationById(id);
      setQuotationData(data);
      setIsLoading(false);
    };

    if (id) {
      loadQuotation();
    }
  }, [id, loadQuotationById]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quotationData) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Quotation not found</h2>
        <Button onClick={() => router.push("/dashboard/quotations")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quotations
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
          onClick={() => router.push("/dashboard/quotations")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quotations
        </Button>
      </div>

      <QuotationPreview data={quotationData} quotationId={id} />
    </div>
  );
}
