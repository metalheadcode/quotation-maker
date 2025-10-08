"use client";

import { useState } from "react";
import QuotationFormV2 from "@/components/quotation-form-v2";
import QuotationPreview from "@/components/quotation-preview";
import { QuotationData } from "@/lib/types/quotation";

export default function Home() {
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
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {!showPreview && (
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Quotation Maker
            </h1>
            <p className="text-gray-600">
              Create professional quotations with ease
            </p>
          </div>
        )}

        {!showPreview ? (
          <QuotationFormV2 onSubmit={handleFormSubmit} initialData={quotationData || undefined} />
        ) : (
          quotationData && <QuotationPreview data={quotationData} onEdit={handleEdit} />
        )}
      </div>
    </div>
  );
}
