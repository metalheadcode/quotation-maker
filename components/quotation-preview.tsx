"use client";

import { QuotationData } from "@/lib/types/quotation";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface QuotationPreviewProps {
  data: QuotationData;
  onEdit?: () => void;
}

export default function QuotationPreview({ data, onEdit }: QuotationPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="no-print mb-6 flex gap-3 justify-end">
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Edit Quotation
          </Button>
        )}
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Quotation
        </Button>
      </div>

      <div className="quotation-preview bg-white text-black p-8 max-w-[210mm] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-black">
          {data.from.logoUrl ? (
            <img
              src={data.from.logoUrl}
              alt={`${data.from.name} Logo`}
              className="h-16 object-contain"
            />
          ) : (
            <img
              src="/images/default-logo.png"
              alt="Company Logo"
              className="h-16 object-contain"
            />
          )}
          <div className="text-right text-sm">
            <div className="text-lg font-bold bg-gray-100 px-4 py-2 rounded mb-2">
              {data.quotationNumber}
            </div>
            <div>Date: {formatDate(data.date)}</div>
            <div>Valid Until: {formatDate(data.validUntil)}</div>
          </div>
        </div>

        {/* Company Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="font-bold text-sm text-black mb-2 border-b border-gray-300 pb-1">
              FROM
            </div>
            <div className="font-bold text-sm mb-1">{data.from.name}</div>
            {data.from.registrationNumber && (
              <div className="text-xs text-gray-600 italic mb-2">
                {data.from.registrationNumber}
              </div>
            )}
            <div className="text-sm mb-2 whitespace-pre-line">{data.from.address}</div>
            <div className="text-sm text-black">
              <div>📧 {data.from.email}</div>
              <div>📱 {data.from.phone}</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-sm text-black mb-2 border-b border-gray-300 pb-1">
              TO
            </div>
            <div className="font-bold text-sm mb-1">{data.to.name}</div>
            {data.to.registrationNumber && (
              <div className="text-xs text-gray-600 italic mb-2">
                {data.to.registrationNumber}
              </div>
            )}
            <div className="text-sm mb-2 whitespace-pre-line">{data.to.address}</div>
            <div className="text-sm text-black">
              <div>📧 {data.to.email}</div>
              <div>📞 {data.to.phone}</div>
            </div>
          </div>
        </div>

        {/* Project Title */}
        {data.projectTitle && (
          <div className="text-center bg-gray-50 p-3 mb-6 border-l-4 border-black font-bold">
            {data.projectTitle}
          </div>
        )}

        {/* Services Table */}
        <table className="w-full mb-6 text-sm border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-2 text-left w-[5%]">#</th>
              <th className="p-2 text-left w-[55%]">Item/Description</th>
              <th className="p-2 text-left w-[12%]">Price/Unit</th>
              <th className="p-2 text-left w-[10%]">Qty/Unit</th>
              <th className="p-2 text-right w-[18%]">Total (MYR)</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-2 text-center border-b border-gray-200">
                  {index + 1}
                </td>
                <td className="p-2 border-b border-gray-200 whitespace-pre-line">
                  {item.description}
                </td>
                <td className="p-2 text-right border-b border-gray-200">
                  {item.pricePerUnit.toFixed(2)}
                </td>
                <td className="p-2 text-center border-b border-gray-200">
                  {item.quantity} {item.unit}
                </td>
                <td className="p-2 text-right border-b border-gray-200">
                  {item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Section */}
        <div className="grid grid-cols-[60%_40%] gap-6 mt-6">
          <div className="text-sm">
            <div className="font-bold text-black mb-2">Terms & Conditions</div>
            <ul className="space-y-1">
              {data.terms.map((term, index) => (
                <li key={index}>{index + 1}. {term}</li>
              ))}
            </ul>

            {data.notes.length > 0 && (
              <>
                <div className="font-bold text-black mt-4 mb-2">Notes</div>
                <ul className="space-y-1">
                  {data.notes.map((note, index) => (
                    <li key={index}>• {note}</li>
                  ))}
                </ul>
              </>
            )}

            {(data.bankInfo.bankName || data.bankInfo.accountNumber) && (
              <div className="bg-gray-50 p-3 rounded mt-4 text-sm">
                <strong>Payment Information:</strong>
                <br />
                {data.bankInfo.bankName && (
                  <>
                    <strong>{data.bankInfo.bankName}</strong>
                    <br />
                  </>
                )}
                {data.bankInfo.accountNumber && (
                  <>
                    Account: {data.bankInfo.accountNumber}
                    <br />
                  </>
                )}
                {data.bankInfo.accountName && <>Name: {data.bankInfo.accountName}</>}
              </div>
            )}
          </div>

          <div>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="p-2 border-b border-gray-200">Subtotal (MYR):</td>
                  <td className="p-2 text-right border-b border-gray-200">
                    {data.subtotal.toFixed(2)}
                  </td>
                </tr>
                {data.discount > 0 && (
                  <tr>
                    <td className="p-2 border-b border-gray-200">Discount (MYR):</td>
                    <td className="p-2 text-right border-b border-gray-200">
                      -{data.discount.toFixed(2)}
                    </td>
                  </tr>
                )}
                {data.tax > 0 && (
                  <tr>
                    <td className="p-2 border-b border-gray-200">Tax (MYR):</td>
                    <td className="p-2 text-right border-b border-gray-200">
                      {data.tax.toFixed(2)}
                    </td>
                  </tr>
                )}
                {data.shipping > 0 && (
                  <tr>
                    <td className="p-2 border-b border-gray-200">Shipping (MYR):</td>
                    <td className="p-2 text-right border-b border-gray-200">
                      {data.shipping.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="bg-black text-white font-bold">
                  <td className="p-2">Total Amount (MYR):</td>
                  <td className="p-2 text-right">{data.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-gray-300 text-xs text-gray-600 italic">
          This quotation is computer-generated and does not require a signature.
          <br />
          For inquiries, contact {data.from.email} or {data.from.phone}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .quotation-preview {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          @page {
            size: A4;
            margin: 15mm;
          }

          /* Ensure backgrounds and colors print */
          .bg-gray-50,
          .bg-gray-100 {
            background-color: #f9fafb !important;
          }

          .bg-\\[\\#4a90e2\\] {
            background-color: #4a90e2 !important;
            color: white !important;
          }

          .text-\\[\\#4a90e2\\] {
            color: #4a90e2 !important;
          }

          .border-\\[\\#4a90e2\\] {
            border-color: #4a90e2 !important;
          }

          /* Ensure table backgrounds print */
          table tr:nth-child(even) {
            background-color: #f9fafb !important;
          }

          table thead tr {
            background-color: #4a90e2 !important;
            color: white !important;
          }
        }
      `}</style>
    </div>
  );
}
