"use client";

import { useState } from "react";
import QuotationFormV2 from "@/components/quotation-form-v2";
import QuotationPreview from "@/components/quotation-preview";
import { QuotationData } from "@/lib/types/quotation";

export default function QuotationsPage() {
  const [quotationData, setQuotationData] = useState<QuotationData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFormSubmit = (data: QuotationData) => {
    setQuotationData(data);
    setShowPreview(true);
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      {!showPreview ? (
        <QuotationFormV2 onSubmit={handleFormSubmit} initialData={quotationData || undefined} />
      ) : (
        quotationData && <QuotationPreview data={quotationData} onEdit={handleEdit} />
      )}
    </div>
  );
}
