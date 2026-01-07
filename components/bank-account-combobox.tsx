"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, Landmark } from "lucide-react";
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
import { useBankInfoStore, BankInfo } from "@/stores/useBankInfoStore";

interface BankAccountComboboxProps {
  value?: string;
  onSelect: (bankInfo: { bankName: string; accountNumber: string; accountName: string } | null, bankInfoId?: string) => void;
  onAddNew: () => void;
}

export function BankAccountCombobox({ value, onSelect, onAddNew }: BankAccountComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const bankAccounts = useBankInfoStore((state) => state.bankAccounts);

  const selectedBankAccount = bankAccounts.find((b) => b.id === value);

  const handleSelect = (bankAccountId: string) => {
    const bankAccount = bankAccounts.find((b) => b.id === bankAccountId);
    if (bankAccount) {
      onSelect(
        {
          bankName: bankAccount.bankName,
          accountNumber: bankAccount.accountNumber,
          accountName: bankAccount.accountName,
        },
        bankAccountId
      );
    }
    setOpen(false);
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return "••••" + accountNumber.slice(-4);
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
          {selectedBankAccount ? (
            <span className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              {selectedBankAccount.bankName} - {maskAccountNumber(selectedBankAccount.accountNumber)}
            </span>
          ) : (
            "Select bank account..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search bank account..." />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground mb-3">No bank account found</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onAddNew();
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Bank Account
                </Button>
              </div>
            </CommandEmpty>

            {bankAccounts.length > 0 && (
              <CommandGroup heading="Your Bank Accounts">
                {bankAccounts.map((bankAccount: BankInfo) => (
                  <CommandItem
                    key={bankAccount.id}
                    value={`${bankAccount.bankName} ${bankAccount.accountNumber}`}
                    onSelect={() => handleSelect(bankAccount.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === bankAccount.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Landmark className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{bankAccount.bankName}</span>
                      <span className="text-xs text-muted-foreground">
                        {bankAccount.accountName} • {maskAccountNumber(bankAccount.accountNumber)}
                      </span>
                    </div>
                    {bankAccount.isDefault && (
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
                  onAddNew();
                  setOpen(false);
                }}
                className="text-primary"
                forceMount
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Bank Account
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
