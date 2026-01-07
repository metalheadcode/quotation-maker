"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { CompanyInfo } from "@/lib/types/quotation";

interface CompanyComboboxProps {
  value?: string;
  onSelect: (company: CompanyInfo | null, companyId?: string) => void;
}

export function CompanyCombobox({ value, onSelect }: CompanyComboboxProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const companies = useCompanyStore((state) => state.companies);

  const selectedCompany = companies.find((c) => c.id === value);

  const handleSelect = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      onSelect(
        {
          name: company.name,
          registrationNumber: company.registrationNumber,
          address: company.address,
          email: company.email,
          phone: company.phone,
        },
        companyId
      );
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCompany ? (
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {selectedCompany.name}
            </span>
          ) : (
            "Select company..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search company..." />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground mb-3">No company found</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    router.push("/dashboard/company");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Company
                </Button>
              </div>
            </CommandEmpty>

            {companies.length > 0 && (
              <CommandGroup heading="Your Companies">
                {companies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.name}
                    onSelect={() => handleSelect(company.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === company.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{company.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {company.registrationNumber || company.email}
                      </span>
                    </div>
                    {company.isDefault && (
                      <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup forceMount>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  router.push("/dashboard/company");
                }}
                className="text-primary"
                forceMount
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Company
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
