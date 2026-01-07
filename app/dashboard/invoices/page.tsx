import { FileText } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Invoices</h2>
        <p className="text-muted-foreground">
          Invoice management coming soon.
        </p>
      </div>
    </div>
  );
}
