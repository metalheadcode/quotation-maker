import { CompanyInfoManager } from "@/components/company-info-manager";

export default function CompanyPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground">
          Manage your company information for quotations
        </p>
      </div>
      <CompanyInfoManager />
    </div>
  );
}
