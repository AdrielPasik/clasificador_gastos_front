"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Ticket {
  id: string
  fecha: string
  monto: number
  monto_raw: string
  merchant: string
  texto: string
  texto_lines: string[]
  imageUrl: string
  tokens?: Array<{
    text: string
    confidence: number
    bbox: number[]
  }>
  monto_debug?: string[]
  category?: string
  category_debug?: any
}

interface TicketsState {
  tickets: Ticket[]
  addTicket: (ticket: Omit<Ticket, "id">) => void
  updateTicket: (id: string, ticket: Partial<Ticket>) => void
  removeTicket: (id: string) => void
  clearTickets: () => void
  // Filtrado por categoría
  filterCategory: string | null
  setFilterCategory: (category: string | null) => void
}

export const useTickets = create<TicketsState>()(
  persist(
    (set) => ({
      tickets: [],
      addTicket: (ticket) =>
        set((state) => ({
          tickets: [
            {
              ...ticket,
              id: Date.now().toString(),
            },
            ...state.tickets,
          ],
        })),
      updateTicket: (id, updatedTicket) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) => (ticket.id === id ? { ...ticket, ...updatedTicket } : ticket)),
        })),
      removeTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.filter((ticket) => ticket.id !== id),
        })),
        clearTickets: () => set({ tickets: [], filterCategory: null }),
        // filter state
        filterCategory: null,
        setFilterCategory: (category) => set({ filterCategory: category }),
    }),
    {
      name: "tickets-storage",
    },
  ),
)
