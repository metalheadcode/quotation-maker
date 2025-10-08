import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CompanyInfo } from "@/lib/types/quotation";

export interface Client extends CompanyInfo {
  id: string;
  createdAt: string;
  lastUsed?: string;
  isFavorite?: boolean;
}

interface ClientStore {
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "createdAt">) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  markAsUsed: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getRecentClients: (limit?: number) => Client[];
  getFavoriteClients: () => Client[];
  searchClients: (query: string) => Client[];
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],

      addClient: (clientData) => {
        const newClient: Client = {
          ...clientData,
          id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
        };
        set((state) => ({
          clients: [...state.clients, newClient],
        }));
      },

      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...updates } : client
          ),
        }));
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        }));
      },

      getClient: (id) => {
        return get().clients.find((client) => client.id === id);
      },

      markAsUsed: (id) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id
              ? { ...client, lastUsed: new Date().toISOString() }
              : client
          ),
        }));
      },

      toggleFavorite: (id) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id
              ? { ...client, isFavorite: !client.isFavorite }
              : client
          ),
        }));
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
    }),
    {
      name: "quotation-clients-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
