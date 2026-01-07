"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { QuotationData, CompanyInfo } from "@/lib/types/quotation";
import { quotationDataSchema, QuotationFormData } from "@/lib/schemas/quotation";
import { Plus, Trash2, Save, Building2, Landmark, ExternalLink, Mail, Phone, Users, Star } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ClientCombobox } from "@/components/client-combobox";
import { CompanyCombobox } from "@/components/company-combobox";
import { BankAccountCombobox } from "@/components/bank-account-combobox";
import { DraftSelector } from "@/components/draft-selector";
import { SaveStatusIndicator } from "@/components/save-status-indicator";
import { FloatingSaveButton } from "@/components/floating-save-button";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { useClientStore } from "@/stores/useClientStore";
import { useQuotationStore, QuotationDataWithIds } from "@/stores/useQuotationStore";
import { useBankInfoStore } from "@/stores/useBankInfoStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface QuotationFormProps {
  onSubmit: (data: QuotationData) => void;
  initialData?: QuotationData;
}

export default function QuotationFormV2({ onSubmit, initialData }: QuotationFormProps) {
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const companies = useCompanyStore((state) => state.companies);
  const fetchCompanies = useCompanyStore((state) => state.fetchCompanies);
  const selectCompany = useCompanyStore((state) => state.selectCompany);

  const clients = useClientStore((state) => state.clients);
  const fetchClients = useClientStore((state) => state.fetchClients);
  const getClient = useClientStore((state) => state.getClient);

  const getNextQuotationNumber = useQuotationStore((state) => state.getNextQuotationNumber);
  const incrementQuotationNumber = useQuotationStore((state) => state.incrementQuotationNumber);
  const fetchDrafts = useQuotationStore((state) => state.fetchDrafts);
  const currentDraftId = useQuotationStore((state) => state.currentDraftId);
  const clearCurrentDraft = useQuotationStore((state) => state.clearCurrentDraft);

  const bankAccounts = useBankInfoStore((state) => state.bankAccounts);
  const fetchBankAccounts = useBankInfoStore((state) => state.fetchBankAccounts);
  const addBankAccount = useBankInfoStore((state) => state.addBankAccount);

  const [selectedClientId, setSelectedClientId] = useState<string>();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>();
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>();
  const [showBankSetup, setShowBankSetup] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialDataHash, setInitialDataHash] = useState<string>("");
  const [lastSavedDataHash, setLastSavedDataHash] = useState<string>("");

  // Fetch data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchCompanies(),
        fetchClients(),
        fetchDrafts(),
        fetchBankAccounts(),
      ]);
      setIsInitialized(true);
    };
    initializeData();
  }, [fetchCompanies, fetchClients, fetchDrafts, fetchBankAccounts]);

  // Set selected company ID when company is loaded
  useEffect(() => {
    if (selectedCompany?.id && !selectedCompanyId) {
      setSelectedCompanyId(selectedCompany.id);
    }
  }, [selectedCompany, selectedCompanyId]);

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationDataSchema),
    defaultValues: initialData || {
      quotationNumber: getNextQuotationNumber(),
      date: new Date().toISOString().split("T")[0],
      validUntil: "",
      from: selectedCompany || {
        name: "",
        registrationNumber: "",
        address: "",
        email: "",
        phone: "",
      },
      to: {
        name: "",
        registrationNumber: "",
        address: "",
        email: "",
        phone: "",
      },
      projectTitle: "",
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      terms: [
        "Payment is due within 30 days of invoice date.",
        "Delivery will be made within 14 days of receiving payment.",
        "Shipping costs are included in the total price.",
        "This quotation is valid until the expiration date listed above.",
        "To accept this quotation, please sign and return a copy, or issue a purchase order referencing this quote number before the expiration date.",
      ],
      notes: [],
      bankInfo: {
        bankName: "",
        accountNumber: "",
        accountName: "",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Auto-select default bank account when loaded (for new quotations)
  useEffect(() => {
    if (isInitialized && bankAccounts.length > 0 && !selectedBankAccountId && !initialData) {
      const defaultAccount = bankAccounts.find((b) => b.isDefault) || bankAccounts[0];
      if (defaultAccount) {
        setSelectedBankAccountId(defaultAccount.id);
        // Also populate the form fields
        form.setValue("bankInfo.bankName", defaultAccount.bankName);
        form.setValue("bankInfo.accountNumber", defaultAccount.accountNumber);
        form.setValue("bankInfo.accountName", defaultAccount.accountName);
      }
    }
  }, [isInitialized, bankAccounts, selectedBankAccountId, initialData, form]);

  // Watch entire form for auto-save
  const watchedFormData = form.watch();

  // Memoize form data for auto-save to prevent unnecessary re-renders
  const formDataForAutoSave = useMemo(() => {
    // Only enable auto-save after initialization
    if (!isInitialized) return null;

    const data = watchedFormData;
    return {
      quotationNumber: data.quotationNumber,
      date: data.date,
      validUntil: data.validUntil,
      projectTitle: data.projectTitle,
      from: {
        name: data.from.name,
        registrationNumber: data.from.registrationNumber || "",
        address: data.from.address,
        email: data.from.email,
        phone: data.from.phone,
      },
      to: {
        name: data.to.name,
        registrationNumber: data.to.registrationNumber || "",
        address: data.to.address,
        email: data.to.email,
        phone: data.to.phone,
      },
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      shipping: data.shipping,
      total: data.total,
      terms: data.terms,
      notes: data.notes,
      bankInfo: {
        bankName: data.bankInfo?.bankName || "",
        accountNumber: data.bankInfo?.accountNumber || "",
        accountName: data.bankInfo?.accountName || "",
      },
      clientId: selectedClientId,
      companyInfoId: selectedCompanyId,
      bankInfoId: selectedBankAccountId,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedFormData), isInitialized, selectedClientId, selectedCompanyId, selectedBankAccountId]);

  // Auto-save hook
  const { saveStatus, lastSavedAt, triggerSave } = useAutoSave(formDataForAutoSave, {
    delay: 2000,
    enabled: isInitialized,
    onSaveSuccess: () => {
      // Mark as saved - update hash to track future changes
      if (formDataForAutoSave) {
        setLastSavedDataHash(JSON.stringify(formDataForAutoSave));
        setHasUnsavedChanges(false);
      }
    },
    onSaveError: () => {
      toast.error("Failed to save draft");
    },
  });

  // Set initial hash when form first initializes (for new quotations)
  useEffect(() => {
    if (!isInitialized || !formDataForAutoSave || initialDataHash) return;
    // Set the initial hash on first render after initialization
    setInitialDataHash(JSON.stringify(formDataForAutoSave));
  }, [isInitialized, formDataForAutoSave, initialDataHash]);

  // Track unsaved changes by comparing current data to initial or last saved state
  useEffect(() => {
    if (!isInitialized || !formDataForAutoSave || !initialDataHash) return;

    const currentHash = JSON.stringify(formDataForAutoSave);
    // Compare to last saved hash if available, otherwise to initial hash
    const compareHash = lastSavedDataHash || initialDataHash;

    if (currentHash !== compareHash) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [formDataForAutoSave, lastSavedDataHash, initialDataHash, isInitialized]);

  // Warn user when leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle manual save
  const handleManualSave = useCallback(async () => {
    await triggerSave();
    toast.success("Draft saved");
  }, [triggerSave]);

  // Handle draft selection - restore form data AND dropdown selections
  const handleSelectDraft = useCallback((draftData: QuotationDataWithIds, _draftId: string) => {
    form.reset(draftData);
    // Restore dropdown selections from loaded draft
    setSelectedClientId(draftData.clientId);
    setSelectedCompanyId(draftData.companyInfoId);
    setSelectedBankAccountId(draftData.bankInfoId);
    // Reset hash states - the loaded draft becomes the new baseline
    const draftHash = JSON.stringify({
      ...draftData,
      clientId: draftData.clientId,
      companyInfoId: draftData.companyInfoId,
      bankInfoId: draftData.bankInfoId,
    });
    setInitialDataHash(draftHash);
    setLastSavedDataHash(draftHash);
    setHasUnsavedChanges(false);
    toast.success("Draft loaded");
  }, [form]);

  // Handle create new quotation
  const handleCreateNew = useCallback(() => {
    clearCurrentDraft();
    form.reset({
      quotationNumber: getNextQuotationNumber(),
      date: new Date().toISOString().split("T")[0],
      validUntil: "",
      from: selectedCompany || {
        name: "",
        registrationNumber: "",
        address: "",
        email: "",
        phone: "",
      },
      to: {
        name: "",
        registrationNumber: "",
        address: "",
        email: "",
        phone: "",
      },
      projectTitle: "",
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      terms: [
        "Payment is due within 30 days of invoice date.",
        "Delivery will be made within 14 days of receiving payment.",
        "Shipping costs are included in the total price.",
        "This quotation is valid until the expiration date listed above.",
        "To accept this quotation, please sign and return a copy, or issue a purchase order referencing this quote number before the expiration date.",
      ],
      notes: [],
      bankInfo: {
        bankName: "",
        accountNumber: "",
        accountName: "",
      },
    });
    setSelectedClientId(undefined);
    // Reset hash states for new quotation - will be set by effect on next render
    setInitialDataHash("");
    setLastSavedDataHash("");
    setHasUnsavedChanges(false);
    toast.success("New quotation started");
  }, [clearCurrentDraft, form, getNextQuotationNumber, selectedCompany]);

  // Watch items for subtotal calculation
  const watchItems = form.watch("items");
  const watchDiscount = form.watch("discount");
  const watchTax = form.watch("tax");
  const watchShipping = form.watch("shipping");

  // Update form when selected company changes
  useEffect(() => {
    if (selectedCompany) {
      form.setValue("from.name", selectedCompany.name);
      form.setValue("from.registrationNumber", selectedCompany.registrationNumber || "");
      form.setValue("from.address", selectedCompany.address);
      form.setValue("from.email", selectedCompany.email);
      form.setValue("from.phone", selectedCompany.phone);
    }
  }, [selectedCompany, form]);

  // Calculate totals
  useEffect(() => {
    const subtotal = watchItems?.reduce((sum, item) => {
      const itemTotal = (item.pricePerUnit || 0) * (item.quantity || 0);
      return sum + itemTotal;
    }, 0) || 0;

    const total = subtotal - (watchDiscount || 0) + (watchTax || 0) + (watchShipping || 0);

    form.setValue("subtotal", subtotal);
    form.setValue("total", total);

    // Update item totals
    watchItems?.forEach((item, index) => {
      const itemTotal = (item.pricePerUnit || 0) * (item.quantity || 0);
      form.setValue(`items.${index}.total`, itemTotal);
    });
  }, [watchItems, watchDiscount, watchTax, watchShipping, form]);

  const addItem = () => {
    append({
      id: Date.now().toString(),
      description: "",
      pricePerUnit: 0,
      quantity: 0,
      unit: "Unit",
      total: 0,
    });
  };

  const handleClientSelect = (client: CompanyInfo | null, clientId?: string) => {
    if (client) {
      form.setValue("to.name", client.name);
      form.setValue("to.registrationNumber", client.registrationNumber || "");
      form.setValue("to.address", client.address);
      form.setValue("to.email", client.email);
      form.setValue("to.phone", client.phone);
      setSelectedClientId(clientId);
    } else {
      // Clear client fields
      form.setValue("to.name", "");
      form.setValue("to.registrationNumber", "");
      form.setValue("to.address", "");
      form.setValue("to.email", "");
      form.setValue("to.phone", "");
      setSelectedClientId(undefined);
    }
  };

  const handleCompanySelect = (company: CompanyInfo | null, companyId?: string) => {
    if (company && companyId) {
      selectCompany(companyId);
      setSelectedCompanyId(companyId);
      form.setValue("from.name", company.name);
      form.setValue("from.registrationNumber", company.registrationNumber || "");
      form.setValue("from.address", company.address);
      form.setValue("from.email", company.email);
      form.setValue("from.phone", company.phone);
    }
  };

  const handleBankAccountSelect = (
    bankInfo: { bankName: string; accountNumber: string; accountName: string } | null,
    bankInfoId?: string
  ) => {
    if (bankInfo && bankInfoId) {
      form.setValue("bankInfo.bankName", bankInfo.bankName);
      form.setValue("bankInfo.accountNumber", bankInfo.accountNumber);
      form.setValue("bankInfo.accountName", bankInfo.accountName);
      setSelectedBankAccountId(bankInfoId);
    }
  };

  const handleBankSetup = async () => {
    const bankData = form.getValues("bankInfo");
    if (bankData?.bankName && bankData?.accountNumber && bankData?.accountName) {
      try {
        const newBankAccount = await addBankAccount({
          bankName: bankData.bankName,
          accountNumber: bankData.accountNumber,
          accountName: bankData.accountName,
          isDefault: bankAccounts.length === 0,
        });
        if (newBankAccount) {
          setSelectedBankAccountId(newBankAccount.id);
        }
        setShowBankSetup(false);
        toast.success("Bank account saved successfully");
      } catch {
        toast.error("Failed to save bank account");
      }
    } else {
      toast.error("Please fill in all bank account fields");
    }
  };

  const handleFormSubmit = (data: QuotationFormData) => {
    incrementQuotationNumber();
    onSubmit(data as QuotationData);
  };

  return (
    <Form {...form}>
      {/* Bank Setup Dialog */}
      <Dialog open={showBankSetup} onOpenChange={setShowBankSetup}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Add Bank Account
            </DialogTitle>
            <DialogDescription>
              Save your bank account information for quotations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="bankInfo.bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Maybank, CIMB" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankInfo.accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="1234567890" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankInfo.accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your Company Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button onClick={handleBankSetup} className="w-full" type="button">
              <Save className="mr-2 h-4 w-4" />
              Save Bank Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Header with Draft Selector and Save Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 mb-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-3">
              <DraftSelector
                currentDraftId={currentDraftId}
                onSelectDraft={handleSelectDraft}
                onCreateNew={handleCreateNew}
              />
            </div>
            <SaveStatusIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
          </div>

          {/* Quotation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Quotation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quotationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quotation Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="#QUO000001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Until</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="projectTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Project Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* From & To */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* From (Company) - Read Only */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">From (Your Company)</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href="/dashboard/company">
                      Manage Companies
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {companies.length > 0 ? (
                  <>
                    <div>
                      <FormLabel>Select Company</FormLabel>
                      <div className="mt-1.5">
                        <CompanyCombobox
                          value={selectedCompanyId}
                          onSelect={handleCompanySelect}
                        />
                      </div>
                    </div>
                    {selectedCompany && (
                      <>
                        <Separator />
                        <div className="flex gap-4">
                          {selectedCompany.logoUrl && (
                            <Image
                              src={selectedCompany.logoUrl}
                              alt={`${selectedCompany.name} logo`}
                              width={64}
                              height={64}
                              className="rounded-lg border object-contain flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-lg">{selectedCompany.name}</p>
                            {selectedCompany.registrationNumber && (
                              <p className="text-sm text-muted-foreground">
                                {selectedCompany.registrationNumber}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-line">{selectedCompany.address}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {selectedCompany.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {selectedCompany.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-3">No company profile yet</p>
                    <Button type="button" asChild>
                      <Link href="/dashboard/company">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Company
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* To (Client) - Read Only */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">To (Client)</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href="/dashboard/clients">
                      Manage Clients
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {clients.length > 0 ? (
                  <>
                    <div>
                      <FormLabel>Select Client</FormLabel>
                      <div className="mt-1.5">
                        <ClientCombobox
                          value={selectedClientId}
                          onSelect={handleClientSelect}
                        />
                      </div>
                    </div>
                    {selectedClientId && getClient(selectedClientId) && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">{getClient(selectedClientId)?.name}</p>
                            {getClient(selectedClientId)?.isFavorite && (
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            )}
                          </div>
                          {getClient(selectedClientId)?.registrationNumber && (
                            <p className="text-sm text-muted-foreground">
                              {getClient(selectedClientId)?.registrationNumber}
                            </p>
                          )}
                          {getClient(selectedClientId)?.address && (
                            <p className="text-sm whitespace-pre-line">{getClient(selectedClientId)?.address}</p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-1">
                            {getClient(selectedClientId)?.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {getClient(selectedClientId)?.email}
                              </span>
                            )}
                            {getClient(selectedClientId)?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {getClient(selectedClientId)?.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-3">No clients yet</p>
                    <Button type="button" asChild>
                      <Link href="/dashboard/clients">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-2xl">Items</CardTitle>
                <Button
                  type="button"
                  onClick={addItem}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg bg-muted/30 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">
                                Description
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Enter item description..."
                                  rows={3}
                                  className="resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.pricePerUnit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">
                                Price per Unit (MYR)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value) || 0)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  placeholder="0"
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value) || 0)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">Unit</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., pcs, hours" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          className="w-full"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end items-center pt-2 border-t">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Item Total</p>
                        <p className="text-lg font-bold">
                          MYR {form.watch(`items.${index}.total`)?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {fields.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      No items yet
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                      Click &ldquo;Add Item&rdquo; above to add your first item to the
                      quotation
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-lg">
                    MYR {form.watch("subtotal")?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Discount (MYR)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Tax (MYR)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="shipping"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            Shipping (MYR)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                <span className="text-xl font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  MYR {form.watch("total")?.toFixed(2) || "0.00"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Bank Information</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBankSetup(true)}
                >
                  {bankAccounts.length > 0 ? "Add New" : "Add"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {bankAccounts.length > 0 && (
                <div>
                  <FormLabel>Select Bank Account</FormLabel>
                  <div className="mt-1.5">
                    <BankAccountCombobox
                      value={selectedBankAccountId}
                      onSelect={handleBankAccountSelect}
                      onAddNew={() => setShowBankSetup(true)}
                    />
                  </div>
                </div>
              )}
              {bankAccounts.length > 0 && <Separator />}
              <FormField
                control={form.control}
                name="bankInfo.bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Maybank, CIMB" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankInfo.accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1234567890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankInfo.accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your Company Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("bankInfo.bankName") && !selectedBankAccountId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBankSetup}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save as New Bank Account
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 pb-20">
            <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[240px]">
              Generate Quotation Preview
            </Button>
          </div>
        </form>

        {/* Floating Save Button - shows when there are unsaved changes */}
        <FloatingSaveButton
          isVisible={hasUnsavedChanges || saveStatus === "error"}
          isSaving={saveStatus === "saving"}
          onSave={handleManualSave}
          saveStatus={saveStatus}
          lastSavedAt={lastSavedAt}
        />
      </Form>
  );
}
