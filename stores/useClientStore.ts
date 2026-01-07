import { create } from "zustand";
import { CompanyInfo } from "@/lib/types/quotation";

export interface Client extends CompanyInfo {
  id: string;
  createdAt: string;
  lastUsed?: string;
  isFavorite?: boolean;
}

interface ClientStore {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  addClient: (client: Omit<Client, "id" | "createdAt">) => Promise<Client | null>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  markAsUsed: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getRecentClients: (limit?: number) => Client[];
  getFavoriteClients: () => Client[];
  searchClients: (query: string) => Client[];
}

// Helper to map API response to Client type (API now returns camelCase)
const mapApiClientToClient = (apiClient: {
  id: string;
  name: string;
  registrationNumber?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt?: string | null;
  lastUsed?: string | null;
  isFavorite?: boolean | null;
}): Client => ({
  id: apiClient.id,
  name: apiClient.name,
  registrationNumber: apiClient.registrationNumber || "",
  address: apiClient.address || "",
  email: apiClient.email || "",
  phone: apiClient.phone || "",
  createdAt: apiClient.createdAt || new Date().toISOString(),
  lastUsed: apiClient.lastUsed || undefined,
  isFavorite: apiClient.isFavorite || false,
});

export const useClientStore = create<ClientStore>()((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        if (response.status === 401) {
          set({ clients: [], isLoading: false });
          return;
        }
        throw new Error("Failed to fetch clients");
      }
      const apiClients = await response.json();
      const clients = apiClients.map(mapApiClientToClient);
      set({ clients, isLoading: false });
    } catch (error) {
      console.error("Error fetching clients:", error);
      set({ error: "Failed to fetch clients", isLoading: false });
    }
  },

  addClient: async (clientData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientData.name,
          company: clientData.registrationNumber,
          address: clientData.address,
          email: clientData.email,
          phone: clientData.phone,
          is_favorite: clientData.isFavorite || false,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add client");
      }
      const savedClient = await response.json();
      const newClient = mapApiClientToClient(savedClient);
      set((state) => ({
        clients: [newClient, ...state.clients],
        isLoading: false,
      }));
      return newClient;
    } catch (error) {
      console.error("Error adding client:", error);
      set({ error: "Failed to add client", isLoading: false });
      throw error;
    }
  },

  updateClient: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updates.name,
          company: updates.registrationNumber,
          address: updates.address,
          email: updates.email,
          phone: updates.phone,
          is_favorite: updates.isFavorite,
          last_used_at: updates.lastUsed,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update client");
      }
      const updatedClient = await response.json();
      set((state) => ({
        clients: state.clients.map((client) =>
          client.id === id ? mapApiClientToClient(updatedClient) : client
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating client:", error);
      set({ error: "Failed to update client", isLoading: false });
      throw error;
    }
  },

  deleteClient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete client");
      }
      set((state) => ({
        clients: state.clients.filter((client) => client.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error deleting client:", error);
      set({ error: "Failed to delete client", isLoading: false });
      throw error;
    }
  },

  getClient: (id) => {
    return get().clients.find((client) => client.id === id);
  },

  markAsUsed: async (id) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          last_used_at: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to mark client as used");
      }
      set((state) => ({
        clients: state.clients.map((client) =>
          client.id === id
            ? { ...client, lastUsed: new Date().toISOString() }
            : client
        ),
      }));
    } catch (error) {
      console.error("Error marking client as used:", error);
    }
  },

  toggleFavorite: async (id) => {
    const client = get().clients.find((c) => c.id === id);
    if (!client) return;

    const newFavoriteState = !client.isFavorite;

    // Optimistic update
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, isFavorite: newFavoriteState } : c
      ),
    }));

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_favorite: newFavoriteState,
        }),
      });
      if (!response.ok) {
        // Revert on error
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, isFavorite: !newFavoriteState } : c
          ),
        }));
        throw new Error("Failed to toggle favorite");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  },

  getRecentClients: (limit = 5) => {
    const { clients } = get();
    return [...clients]
      .filter((client) => client.lastUsed)
      .sort(
        (a, b) =>
          new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime()
      )
      .slice(0, limit);
  },

  getFavoriteClients: () => {
    return get().clients.filter((client) => client.isFavorite);
  },

  searchClients: (query) => {
    const { clients } = get();
    const lowerQuery = query.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowerQuery) ||
        client.email.toLowerCase().includes(lowerQuery) ||
        client.phone.includes(query) ||
        (client.registrationNumber &&
          client.registrationNumber.toLowerCase().includes(lowerQuery))
    );
  },
}));
