import { ClientInfoManager } from "@/components/client-info-manager";

export default function ClientsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">Client Management</h1>
        <p className="text-muted-foreground">
          Manage your clients for quotations
        </p>
      </div>
      <ClientInfoManager />
    </div>
  );
}
