"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuotationFormV2 from "@/components/quotation-form-v2";
import QuotationPreview from "@/components/quotation-preview";
import { QuotationData } from "@/lib/types/quotation";
import { useQuotationStore } from "@/stores/useQuotationStore";

export default function NewQuotationPage() {
  const router = useRouter();
  const [quotationData, setQuotationData] = React.useState<QuotationData | null>(null);
  const [quotationId, setQuotationId] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);

  const currentDraftId = useQuotationStore((state) => state.currentDraftId);

  const handleFormSubmit = (data: QuotationData) => {
    setQuotationData(data);
    setQuotationId(currentDraftId);
    setShowPreview(true);
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

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

      {!showPreview ? (
        <QuotationFormV2 onSubmit={handleFormSubmit} initialData={quotationData || undefined} />
      ) : (
        quotationData && (
          <QuotationPreview
            data={quotationData}
            quotationId={quotationId || undefined}
            onEdit={handleEdit}
          />
        )
      )}
    </div>
  );
}
