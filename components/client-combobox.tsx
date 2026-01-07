"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, Star } from "lucide-react";
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
import { useClientStore } from "@/stores/useClientStore";
import { CompanyInfo } from "@/lib/types/quotation";

interface ClientComboboxProps {
  value?: string;
  onSelect: (client: CompanyInfo | null, clientId?: string) => void;
  onAddNew: () => void;
}

export function ClientCombobox({ value, onSelect, onAddNew }: ClientComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const clients = useClientStore((state) => state.clients);
  const getRecentClients = useClientStore((state) => state.getRecentClients);
  const getFavoriteClients = useClientStore((state) => state.getFavoriteClients);
  const markAsUsed = useClientStore((state) => state.markAsUsed);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- clients is needed to recompute when data changes
  const recentClients = React.useMemo(() => getRecentClients(5), [getRecentClients, clients]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- clients is needed to recompute when data changes
  const favoriteClients = React.useMemo(() => getFavoriteClients(), [getFavoriteClients, clients]);

  const selectedClient = clients.find((c) => c.id === value);

  const handleSelect = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      markAsUsed(clientId);
      onSelect(
        {
          name: client.name,
          registrationNumber: client.registrationNumber,
          address: client.address,
          email: client.email,
          phone: client.phone,
        },
        clientId
      );
    }
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
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
          {selectedClient ? selectedClient.name : "Select client..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search client..." />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground mb-3">No client found</p>
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
                  Add New Client
                </Button>
              </div>
            </CommandEmpty>

            {favoriteClients.length > 0 && (
              <CommandGroup heading="Favorites">
                {favoriteClients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.name}
                    onSelect={() => handleSelect(client.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === client.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-xs text-muted-foreground">{client.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {recentClients.length > 0 && (
              <CommandGroup heading="Recent">
                {recentClients.map((client) => {
                  if (client.isFavorite) return null;
                  return (
                    <CommandItem
                      key={client.id}
                      value={client.name}
                      onSelect={() => handleSelect(client.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === client.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{client.name}</span>
                        <span className="text-xs text-muted-foreground">{client.email}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            <CommandGroup heading="All Clients">
              {clients
                .filter(
                  (client) =>
                    !favoriteClients.some((f) => f.id === client.id) &&
                    !recentClients.some((r) => r.id === client.id)
                )
                .map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.name}
                    onSelect={() => handleSelect(client.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === client.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-xs text-muted-foreground">{client.email}</span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>

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
                Add New Client
              </CommandItem>
              {value && (
                <CommandItem onSelect={handleClear} className="text-muted-foreground" forceMount>
                  Clear Selection
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
