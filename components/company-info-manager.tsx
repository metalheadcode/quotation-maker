"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
import { Plus, Edit2, Trash2, Star, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompanyInfoManagerProps {
  onSelect?: (companyInfo: CompanyInfoDB) => void;
}

export function CompanyInfoManager({ onSelect }: CompanyInfoManagerProps) {
  const [companyInfos, setCompanyInfos] = useState<CompanyInfoDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    address: "",
    email: "",
    phone: "",
    isDefault: false,
    logoUrl: "",
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

  const uploadLogo = async (file: File): Promise<string | null> => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("bucket", "company-logos");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload logo");
    }

    const data = await response.json();
    return data.url;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Allowed: JPG, PNG, WebP, SVG");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData({ ...formData, logoUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUploading(true);
      let logoUrl = formData.logoUrl;

      // Upload logo if there's a new file
      if (logoFile) {
        const uploadedUrl = await uploadLogo(logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      const url = editingId
        ? `/api/company-info/${editingId}`
        : "/api/company-info";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          registration_number: formData.registrationNumber,
          address: formData.address,
          email: formData.email,
          phone: formData.phone,
          is_default: formData.isDefault,
          logo_url: logoUrl || null,
        }),
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
    } finally {
      setIsUploading(false);
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
      logoUrl: companyInfo.logoUrl || "",
    });
    setLogoPreview(companyInfo.logoUrl || null);
    setLogoFile(null);
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
      logoUrl: "",
    });
    setEditingId(null);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
                {/* Logo Upload */}
                <div className="grid gap-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <div className="relative">
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          width={80}
                          height={80}
                          className="rounded-lg border object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">Upload</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="text-xs text-muted-foreground">
                      <p>JPG, PNG, WebP, or SVG</p>
                      <p>Max 5MB</p>
                    </div>
                  </div>
                </div>

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
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingId ? "Update" : "Create"
                  )}
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
                <div className="flex items-start gap-4">
                  {info.logoUrl && (
                    <Image
                      src={info.logoUrl}
                      alt={`${info.name} logo`}
                      width={48}
                      height={48}
                      className="rounded-lg border object-contain flex-shrink-0"
                    />
                  )}
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
