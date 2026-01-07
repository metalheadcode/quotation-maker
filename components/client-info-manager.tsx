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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Star, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { useClientStore, Client } from "@/stores/useClientStore";

export function ClientInfoManager() {
  const clients = useClientStore((state) => state.clients);
  const isLoading = useClientStore((state) => state.isLoading);
  const fetchClients = useClientStore((state) => state.fetchClients);
  const addClient = useClientStore((state) => state.addClient);
  const updateClient = useClientStore((state) => state.updateClient);
  const deleteClient = useClientStore((state) => state.deleteClient);
  const toggleFavorite = useClientStore((state) => state.toggleFavorite);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    address: "",
    email: "",
    phone: "",
    isFavorite: false,
  });

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Client name is required");
      return;
    }

    try {
      setIsSaving(true);

      if (editingId) {
        await updateClient(editingId, {
          name: formData.name,
          registrationNumber: formData.registrationNumber,
          address: formData.address,
          email: formData.email,
          phone: formData.phone,
          isFavorite: formData.isFavorite,
        });
        toast.success("Client updated successfully");
      } else {
        await addClient({
          name: formData.name,
          registrationNumber: formData.registrationNumber,
          address: formData.address,
          email: formData.email,
          phone: formData.phone,
          isFavorite: formData.isFavorite,
        });
        toast.success("Client created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to save client");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      registrationNumber: client.registrationNumber || "",
      address: client.address || "",
      email: client.email || "",
      phone: client.phone || "",
      isFavorite: client.isFavorite || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      await deleteClient(id);
      toast.success("Client deleted successfully");
    } catch {
      toast.error("Failed to delete client");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
    } catch {
      toast.error("Failed to update favorite status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      registrationNumber: "",
      address: "",
      email: "",
      phone: "",
      isFavorite: false,
    });
    setEditingId(null);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (isLoading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Clients</h3>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit" : "Add"} Client
                </DialogTitle>
                <DialogDescription>
                  Enter client details for your quotations
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Company or individual name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="registrationNumber">
                    Company Registration Number
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
                    placeholder="e.g., 123456-A"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Client address"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="client@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+60 12-345 6789"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFavorite"
                    checked={formData.isFavorite}
                    onChange={(e) =>
                      setFormData({ ...formData, isFavorite: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isFavorite" className="cursor-pointer">
                    Mark as favorite
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No clients saved yet. Click &quot;Add Client&quot; to get started.
            </p>
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{client.name}</h4>
                    {client.isFavorite && (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                  {client.registrationNumber && (
                    <p className="text-sm text-muted-foreground">
                      Reg: {client.registrationNumber}
                    </p>
                  )}
                  {client.address && (
                    <p className="text-sm whitespace-pre-line">{client.address}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {client.email && <span>{client.email}</span>}
                    {client.phone && <span>{client.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToggleFavorite(client.id)}
                    title={client.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        client.isFavorite
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(client)}
                    title="Edit client"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(client.id)}
                    title="Delete client"
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
