"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankAccountCombobox } from "@/components/bank-account-combobox";
import { useBankInfoStore } from "@/stores/useBankInfoStore";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { Loader2 } from "lucide-react";

interface CreateInvoiceDialogProps {
  quotationId: string;
  quotationNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({
  quotationId,
  quotationNumber,
  open,
  onOpenChange,
}: CreateInvoiceDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [poNumber, setPoNumber] = React.useState("");
  const [dueDate, setDueDate] = React.useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default 30 days
    return date.toISOString().split("T")[0];
  });
  const [selectedBankId, setSelectedBankId] = React.useState<string | null>(
    null
  );

  const bankAccounts = useBankInfoStore((state) => state.bankAccounts);
  const fetchBankAccounts = useBankInfoStore((state) => state.fetchBankAccounts);
  const createInvoiceFromQuotation = useInvoiceStore(
    (state) => state.createInvoiceFromQuotation
  );
  const saveInvoice = useInvoiceStore((state) => state.saveInvoice);
  const incrementInvoiceNumber = useInvoiceStore(
    (state) => state.incrementInvoiceNumber
  );

  React.useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  // Auto-select default bank account
  React.useEffect(() => {
    if (!selectedBankId && bankAccounts.length > 0) {
      const defaultBank = bankAccounts.find((b) => b.isDefault);
      if (defaultBank) {
        setSelectedBankId(defaultBank.id);
      } else {
        setSelectedBankId(bankAccounts[0].id);
      }
    }
  }, [bankAccounts, selectedBankId]);

  const selectedBank = bankAccounts.find((b) => b.id === selectedBankId);

  const handleCreate = async () => {
    if (!selectedBank) {
      alert("Please select a bank account");
      return;
    }

    setIsLoading(true);
    try {
      const invoiceData = await createInvoiceFromQuotation(
        quotationId,
        {
          bankName: selectedBank.bankName,
          accountNumber: selectedBank.accountNumber,
          accountName: selectedBank.accountName,
        },
        selectedBank.id,
        poNumber
      );

      if (invoiceData) {
        // Update due date
        invoiceData.dueDate = dueDate;

        // Save the invoice
        const invoiceId = await saveInvoice(invoiceData);

        if (invoiceId) {
          incrementInvoiceNumber();
          onOpenChange(false);
          router.push(`/dashboard/invoices/${invoiceId}`);
        }
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create an invoice from quotation {quotationNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="po-number">PO Number (Optional)</Label>
            <Input
              id="po-number"
              placeholder="e.g., POMS-2512821314"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Client&apos;s purchase order reference number
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Payment due date (default: 30 days from today)
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Bank Account *</Label>
            <BankAccountCombobox
              value={selectedBankId || undefined}
              onSelect={(bankInfo, id) => {
                if (id) setSelectedBankId(id);
              }}
              onAddNew={() => {
                window.open("/dashboard/settings", "_blank");
              }}
            />
            {selectedBank && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <div>
                  <strong>{selectedBank.bankName}</strong>
                </div>
                <div>Account: {selectedBank.accountNumber}</div>
                <div>Name: {selectedBank.accountName}</div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading || !selectedBank}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
