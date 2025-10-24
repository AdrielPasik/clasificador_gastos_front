"use client"

import { ImageUploader } from "@/components/image-uploader"
import { TicketCard } from "@/components/ticket-card"
import { FinanceSummary } from "@/components/finance-summary"
import { useTickets } from "@/hooks/use-tickets"
import { Receipt, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { tickets, clearTickets, filterCategory, setFilterCategory } = useTickets()

  const visibleTickets = filterCategory ? tickets.filter((t) => t.category === filterCategory) : tickets

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Receipt className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestor de Gastos</h1>
                <p className="text-sm text-muted-foreground">Procesamiento OCR de tickets</p>
              </div>
            </div>
            {tickets.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearTickets} className="gap-2 bg-transparent">
                <Trash2 className="h-4 w-4" />
                Limpiar todo
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ImageUploader />

            {visibleTickets.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Tickets Procesados ({visibleTickets.length})</h2>
                  {filterCategory && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Filtrando por:</p>
                      <p className="text-sm font-medium">{filterCategory}</p>
                      <Button size="sm" variant="ghost" onClick={() => setFilterCategory(null)}>
                        Mostrar todo
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {visibleTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              </div>
            )}

            {tickets.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No hay tickets procesados</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sube tu primer ticket para comenzar a analizar tus gastos
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <FinanceSummary />
          </div>
        </div>
      </main>
    </div>
  )
}
