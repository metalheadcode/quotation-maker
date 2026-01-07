"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useQuotationStore, DraftQuotation, QuotationDataWithIds } from "@/stores/useQuotationStore";

interface DraftSelectorProps {
  currentDraftId: string | null;
  onSelectDraft: (draftData: QuotationDataWithIds, draftId: string) => void;
  onCreateNew: () => void;
}

export function DraftSelector({
  currentDraftId,
  onSelectDraft,
  onCreateNew,
}: DraftSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [draftToDelete, setDraftToDelete] = React.useState<DraftQuotation | null>(null);

  const { drafts, isLoadingDrafts, loadDraftById, deleteDraftFromSupabase } =
    useQuotationStore();

  const selectedDraft = drafts.find((d) => d.id === currentDraftId);

  const handleSelectDraft = async (draftId: string) => {
    const draftData = await loadDraftById(draftId);
    if (draftData) {
      onSelectDraft(draftData, draftId);
    }
    setOpen(false);
  };

  const handleDeleteDraft = async () => {
    if (!draftToDelete) return;

    try {
      await deleteDraftFromSupabase(draftToDelete.id);
    } catch (error) {
      console.error("Failed to delete draft:", error);
    } finally {
      setDraftToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[280px] justify-between"
          >
            {isLoadingDrafts ? (
              <span className="text-muted-foreground">Loading drafts...</span>
            ) : selectedDraft ? (
              <span className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {selectedDraft.projectTitle || selectedDraft.quotationNumber || "Untitled Draft"}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {drafts.length > 0 ? "Select a draft..." : "No drafts yet"}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search drafts..." />
            <CommandList>
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <p className="text-muted-foreground mb-3">No drafts found</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onCreateNew();
                      setOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Quotation
                  </Button>
                </div>
              </CommandEmpty>

              {drafts.length > 0 && (
                <CommandGroup heading="Your Drafts">
                  {drafts.map((draft) => (
                    <CommandItem
                      key={draft.id}
                      value={`${draft.projectTitle} ${draft.quotationNumber}`}
                      onSelect={() => handleSelectDraft(draft.id)}
                      className="group"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 flex-shrink-0",
                          currentDraftId === draft.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <FileText className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">
                          {draft.projectTitle || "Untitled"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {draft.quotationNumber} • {formatDate(draft.updatedAt)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDraftToDelete(draft);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />

              <CommandGroup forceMount>
                <CommandItem
                  onSelect={() => {
                    onCreateNew();
                    setOpen(false);
                  }}
                  className="text-primary"
                  forceMount
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Quotation
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{draftToDelete?.projectTitle || "Untitled"}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDraft}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
