"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { QuotationData, CompanyInfo } from "@/lib/types/quotation";
import { quotationDataSchema, QuotationFormData } from "@/lib/schemas/quotation";
import { Plus, Trash2, Save, Building2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ClientCombobox } from "@/components/client-combobox";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { useClientStore } from "@/stores/useClientStore";
import { useQuotationStore } from "@/stores/useQuotationStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuotationFormProps {
  onSubmit: (data: QuotationData) => void;
  initialData?: QuotationData;
}

export default function QuotationFormV2({ onSubmit, initialData }: QuotationFormProps) {
  const company = useCompanyStore((state) => state.company);
  const hasCompany = useCompanyStore((state) => state.hasCompany);
  const setCompany = useCompanyStore((state) => state.setCompany);

  const addClient = useClientStore((state) => state.addClient);
  const getNextQuotationNumber = useQuotationStore((state) => state.getNextQuotationNumber);
  const incrementQuotationNumber = useQuotationStore((state) => state.incrementQuotationNumber);

  const [selectedClientId, setSelectedClientId] = useState<string>();
  const [showCompanySetup, setShowCompanySetup] = useState(!hasCompany());

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationDataSchema),
    defaultValues: initialData || {
      quotationNumber: getNextQuotationNumber(),
      date: new Date().toISOString().split("T")[0],
      validUntil: "",
      from: company || {
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

  // Watch items for subtotal calculation
  const watchItems = form.watch("items");
  const watchDiscount = form.watch("discount");
  const watchTax = form.watch("tax");
  const watchShipping = form.watch("shipping");

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

  const handleSaveAsNewClient = () => {
    const toData = form.getValues("to");
    if (toData.name && toData.email) {
      addClient({
        name: toData.name,
        registrationNumber: toData.registrationNumber || "",
        address: toData.address,
        email: toData.email,
        phone: toData.phone,
      });
    }
  };

  const handleCompanySetup = () => {
    const fromData = form.getValues("from");
    if (fromData.name && fromData.email) {
      setCompany({
        name: fromData.name,
        registrationNumber: fromData.registrationNumber || "",
        address: fromData.address,
        email: fromData.email,
        phone: fromData.phone,
      });
      setShowCompanySetup(false);
    }
  };

  const handleFormSubmit = (data: QuotationFormData) => {
    incrementQuotationNumber();
    onSubmit(data as QuotationData);
  };

  return (
    <Form {...form}>
      {/* Company Setup Dialog */}
      <Dialog open={showCompanySetup} onOpenChange={setShowCompanySetup}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Setup Your Company Details
            </DialogTitle>
            <DialogDescription>
              Let&apos;s save your company information so you don&apos;t have to enter it every time
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="from.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your Company Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="from.registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123456-A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="from.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Company address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@company.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="from.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+60 12-345 6789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button onClick={handleCompanySetup} className="w-full" type="button">
              <Save className="mr-2 h-4 w-4" />
              Save Company Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
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
            {/* From (Company) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">From (Your Company)</CardTitle>
                  {hasCompany() && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCompanySetup(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="from.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="from.registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="from.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="from.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="from.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* To (Client) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">To (Client)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <FormLabel>Select Existing Client</FormLabel>
                  <div className="flex gap-2 mt-1.5">
                    <ClientCombobox
                      value={selectedClientId}
                      onSelect={handleClientSelect}
                      onAddNew={() => {
                        // Clear and let user enter manually
                        handleClientSelect(null);
                      }}
                    />
                  </div>
                </div>
                <Separator />
                <FormField
                  control={form.control}
                  name="to.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="to.registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="to.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="to.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="to.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("to.name") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveAsNewClient}
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save as New Client
                  </Button>
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
              <CardTitle className="text-2xl">Bank Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bankInfo.bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[240px]">
              Generate Quotation Preview
            </Button>
          </div>
        </form>
      </Form>
  );
}
