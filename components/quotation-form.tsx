"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { QuotationData, QuotationItem } from "@/lib/types/quotation";
import { Plus, Trash2 } from "lucide-react";

interface QuotationFormProps {
  onSubmit: (data: QuotationData) => void;
  initialData?: QuotationData;
}

export default function QuotationForm({ onSubmit, initialData }: QuotationFormProps) {
  const [formData, setFormData] = useState<QuotationData>(
    initialData || {
      quotationNumber: "",
      date: new Date().toISOString().split("T")[0],
      validUntil: "",
      from: {
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
    }
  );

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: "",
      pricePerUnit: 0,
      quantity: 0,
      unit: "Unit",
      total: 0,
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
  };

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== id),
    });
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    const updatedItems = formData.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === "pricePerUnit" || field === "quantity") {
          updatedItem.total = updatedItem.pricePerUnit * updatedItem.quantity;
        }
        return updatedItem;
      }
      return item;
    });

    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - formData.discount + formData.tax + formData.shipping;

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      total,
    });
  };

  const updateSummary = (field: "discount" | "tax" | "shipping", value: number) => {
    const updated = { ...formData, [field]: value };
    updated.total = updated.subtotal - updated.discount + updated.tax + updated.shipping;
    setFormData(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quotation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quotationNumber">Quotation Number</Label>
              <Input
                id="quotationNumber"
                value={formData.quotationNumber}
                onChange={(e) =>
                  setFormData({ ...formData, quotationNumber: e.target.value })
                }
                placeholder="#QUO000001"
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="projectTitle">Project Title</Label>
            <Input
              id="projectTitle"
              value={formData.projectTitle}
              onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
              placeholder="Project Name"
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>From (Your Company)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="fromName">Company Name</Label>
              <Input
                id="fromName"
                value={formData.from.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    from: { ...formData.from, name: e.target.value },
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="fromReg">Registration Number</Label>
              <Input
                id="fromReg"
                value={formData.from.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    from: { ...formData.from, registrationNumber: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="fromAddress">Address</Label>
              <Textarea
                id="fromAddress"
                value={formData.from.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    from: { ...formData.from, address: e.target.value },
                  })
                }
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="fromEmail">Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={formData.from.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    from: { ...formData.from, email: e.target.value },
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="fromPhone">Phone</Label>
              <Input
                id="fromPhone"
                value={formData.from.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    from: { ...formData.from, phone: e.target.value },
                  })
                }
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>To (Client)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="toName">Company Name</Label>
              <Input
                id="toName"
                value={formData.to.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    to: { ...formData.to, name: e.target.value },
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="toReg">Registration Number</Label>
              <Input
                id="toReg"
                value={formData.to.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    to: { ...formData.to, registrationNumber: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="toAddress">Address</Label>
              <Textarea
                id="toAddress"
                value={formData.to.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    to: { ...formData.to, address: e.target.value },
                  })
                }
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="toEmail">Email</Label>
              <Input
                id="toEmail"
                type="email"
                value={formData.to.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    to: { ...formData.to, email: e.target.value },
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="toPhone">Phone</Label>
              <Input
                id="toPhone"
                value={formData.to.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    to: { ...formData.to, phone: e.target.value },
                  })
                }
                required
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Items</span>
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.items.map((item) => (
              <div key={item.id} className="flex gap-3 items-start border-b pb-4">
                <div className="flex-1 grid grid-cols-5 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor={`item-desc-${item.id}`}>Description</Label>
                    <Textarea
                      id={`item-desc-${item.id}`}
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      placeholder="Item description"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-price-${item.id}`}>Price/Unit</Label>
                    <Input
                      id={`item-price-${item.id}`}
                      type="number"
                      step="0.01"
                      value={item.pricePerUnit}
                      onChange={(e) =>
                        updateItem(item.id, "pricePerUnit", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-qty-${item.id}`}>Quantity</Label>
                    <div className="flex gap-1">
                      <Input
                        id={`item-qty-${item.id}`}
                        type="number"
                        step="0.5"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                        }
                        className="w-20"
                      />
                      <Input
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                        placeholder="Unit"
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Total</Label>
                    <div className="h-10 flex items-center font-semibold">
                      {item.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {formData.items.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No items added. Click &ldquo;Add Item&rdquo; to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Subtotal (MYR)</Label>
              <div className="h-10 flex items-center font-semibold">
                {formData.subtotal.toFixed(2)}
              </div>
            </div>
            <div></div>
            <div>
              <Label htmlFor="discount">Discount (MYR)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => updateSummary("discount", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="tax">Tax (MYR)</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                value={formData.tax}
                onChange={(e) => updateSummary("tax", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="shipping">Shipping (MYR)</Label>
              <Input
                id="shipping"
                type="number"
                step="0.01"
                value={formData.shipping}
                onChange={(e) => updateSummary("shipping", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount (MYR):</span>
            <span>{formData.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={formData.bankInfo.bankName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankInfo: { ...formData.bankInfo, bankName: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={formData.bankInfo.accountNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankInfo: { ...formData.bankInfo, accountNumber: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={formData.bankInfo.accountName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankInfo: { ...formData.bankInfo, accountName: e.target.value },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Generate Quotation Preview
        </Button>
      </div>
    </form>
  );
}
