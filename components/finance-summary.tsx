"use client"

import { Card } from "@/components/ui/card"
import { useTickets } from "@/hooks/use-tickets"
import { TrendingUp, Receipt, Calendar } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function FinanceSummary() {
  const { tickets, setFilterCategory } = useTickets()

  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.monto, 0)
  const averageAmount = tickets.length > 0 ? totalAmount / tickets.length : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  // Group tickets by merchant for chart
  const merchantData = tickets.reduce(
    (acc, ticket) => {
      const existing = acc.find((item) => item.merchant === ticket.merchant)
      if (existing) {
        existing.total += ticket.monto
        existing.count += 1
      } else {
        acc.push({ merchant: ticket.merchant, total: ticket.monto, count: 1 })
      }
      return acc
    },
    [] as Array<{ merchant: string; total: number; count: number }>,
  )

  // Group tickets by category for chart
  const categoryData = tickets.reduce(
    (acc, ticket) => {
      const cat = ticket.category || "Sin categoría"
      const existing = acc.find((item) => item.category === cat)
      if (existing) {
        existing.total += ticket.monto
        existing.count += 1
      } else {
        acc.push({ category: cat, total: ticket.monto, count: 1 })
      }
      return acc
    },
    [] as Array<{ category: string; total: number; count: number }>,
  )

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-90">Total Gastado</p>
          <p className="text-4xl font-bold">{formatCurrency(totalAmount)}</p>
          <div className="flex items-center gap-2 text-sm opacity-75">
            <Receipt className="h-4 w-4" />
            <span>{tickets.length} tickets procesados</span>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl bg-card p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Estadísticas</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Promedio</span>
              </div>
              <span className="font-semibold text-foreground">{formatCurrency(averageAmount)}</span>
            </div>
            {/* Se eliminó la tarjeta de "Último ticket" por petición del usuario */}
          </div>
        </div>
      </Card>

      {categoryData.length > 0 && (
        <Card className="rounded-2xl bg-card p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Por Categoría</h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={12} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {categoryData.map((item) => (
                <button
                  key={item.category}
                  onClick={() => setFilterCategory(item.category === "Sin categoría" ? null : item.category)}
                  className="flex w-full items-center justify-between rounded-lg bg-muted/50 p-3 text-left hover:brightness-95"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} {item.count === 1 ? "ticket" : "tickets"}
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">{formatCurrency(item.total)}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {merchantData.length > 0 && (
        <Card className="rounded-2xl bg-card p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Por Comercio</h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={merchantData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="merchant" tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={12} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {merchantData.map((item) => (
                <div key={item.merchant} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="font-medium text-foreground">{item.merchant}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} {item.count === 1 ? "ticket" : "tickets"}
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
