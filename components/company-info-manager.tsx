"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyInfoDB } from "@/lib/types/quotation";
import { Plus, Edit2, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface CompanyInfoManagerProps {
  onSelect?: (companyInfo: CompanyInfoDB) => void;
}

export function CompanyInfoManager({ onSelect }: CompanyInfoManagerProps) {
  const [companyInfos, setCompanyInfos] = useState<CompanyInfoDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    address: "",
    email: "",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchCompanyInfos();
  }, []);

  const fetchCompanyInfos = async () => {
    try {
      const response = await fetch("/api/company-info");
      if (response.ok) {
        const data = await response.json();
        setCompanyInfos(data);
      }
    } catch (error) {
      console.error("Error fetching company infos:", error);
      toast.error("Failed to load company information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/company-info/${editingId}`
        : "/api/company-info";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingId
            ? "Company info updated successfully"
            : "Company info created successfully"
        );
        setIsDialogOpen(false);
        resetForm();
        fetchCompanyInfos();
      } else {
        toast.error("Failed to save company info");
      }
    } catch (error) {
      console.error("Error saving company info:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (companyInfo: CompanyInfoDB) => {
    setEditingId(companyInfo.id);
    setFormData({
      name: companyInfo.name,
      registrationNumber: companyInfo.registrationNumber,
      address: companyInfo.address,
      email: companyInfo.email,
      phone: companyInfo.phone,
      isDefault: companyInfo.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this company info?")) {
      return;
    }

    try {
      const response = await fetch(`/api/company-info/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Company info deleted successfully");
        fetchCompanyInfos();
      } else {
        toast.error("Failed to delete company info");
      }
    } catch (error) {
      console.error("Error deleting company info:", error);
      toast.error("An error occurred");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      registrationNumber: "",
      address: "",
      email: "",
      phone: "",
      isDefault: false,
    });
    setEditingId(null);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Company Information</h3>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Company Info
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit" : "Add"} Company Information
                </DialogTitle>
                <DialogDescription>
                  Enter your company details to use in quotations
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="registrationNumber">
                    Registration Number
                  </Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Set as default
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {companyInfos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No company information saved. Click &quot;Add Company Info&quot; to get
            started.
          </div>
        ) : (
          companyInfos.map((info) => (
            <div
              key={info.id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{info.name}</h4>
                    {info.isDefault && (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                  {info.registrationNumber && (
                    <p className="text-sm text-muted-foreground">
                      Reg: {info.registrationNumber}
                    </p>
                  )}
                  <p className="text-sm">{info.address}</p>
                  <p className="text-sm">{info.email}</p>
                  <p className="text-sm">{info.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {onSelect && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelect(info)}
                    >
                      Select
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(info)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(info.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
