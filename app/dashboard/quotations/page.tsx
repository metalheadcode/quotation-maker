"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Send,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QuotationsDataTable } from "@/components/quotations-data-table";
import { CreateInvoiceDialog } from "@/components/create-invoice-dialog";
import { useQuotationStore } from "@/stores/useQuotationStore";
import { QuotationStatus } from "@/lib/types/quotation";

export default function QuotationsPage() {
  const quotations = useQuotationStore((state) => state.quotations);
  const isLoading = useQuotationStore((state) => state.isLoadingQuotations);
  const fetchQuotations = useQuotationStore((state) => state.fetchQuotations);
  const deleteQuotation = useQuotationStore((state) => state.deleteQuotation);
  const updateQuotationStatus = useQuotationStore(
    (state) => state.updateQuotationStatus
  );

  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [createInvoiceQuotation, setCreateInvoiceQuotation] = React.useState<{
    id: string;
    quotationNumber: string;
  } | null>(null);

  React.useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteQuotation(deleteId);
      setDeleteId(null);
    }
  };

  const handleStatusChange = async (id: string, status: QuotationStatus) => {
    await updateQuotationStatus(id, status);
    fetchQuotations();
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">
            Manage your quotations and create invoices
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quotations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotations.filter((q) => q.status === "draft").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotations.filter((q) => q.status === "sent").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotations.filter((q) => q.status === "accepted").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
          <CardDescription>
            View and manage all your quotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : quotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No quotations yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first quotation to get started
              </p>
              <Button asChild>
                <Link href="/dashboard/quotations/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Quotation
                </Link>
              </Button>
            </div>
          ) : (
            <QuotationsDataTable
              data={quotations}
              onStatusChange={handleStatusChange}
              onDelete={setDeleteId}
              onCreateInvoice={setCreateInvoiceQuotation}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quotation? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Invoice Dialog */}
      {createInvoiceQuotation && (
        <CreateInvoiceDialog
          quotationId={createInvoiceQuotation.id}
          quotationNumber={createInvoiceQuotation.quotationNumber}
          open={!!createInvoiceQuotation}
          onOpenChange={(open) => {
            if (!open) setCreateInvoiceQuotation(null);
          }}
        />
      )}
    </div>
  );
}
