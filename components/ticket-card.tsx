"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Edit2, Check, X, Eye } from "lucide-react"
import { useTickets, type Ticket } from "@/hooks/use-tickets"
import { motion } from "framer-motion"

interface TicketCardProps {
  ticket: Ticket
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [editedTicket, setEditedTicket] = useState(ticket)
  const { updateTicket, removeTicket } = useTickets()

  const handleSave = () => {
    updateTicket(ticket.id, editedTicket)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTicket(ticket)
    setIsEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Card className="overflow-hidden rounded-2xl bg-card">
        <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr]">
          <div className="relative">
            <img
              src={ticket.imageUrl || "/placeholder.svg"}
              alt="Ticket"
              className="h-full w-full rounded-xl object-cover"
            />
            {ticket.tokens && ticket.tokens.length > 0 && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-2 right-2"
                onClick={() => setShowDebug(!showDebug)}
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {isEditing ? (
                  <Input
                    value={editedTicket.merchant}
                    onChange={(e) => setEditedTicket({ ...editedTicket, merchant: e.target.value })}
                    className="text-xl font-bold"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">{ticket.merchant}</h3>
                    {ticket.category && <Badge>{ticket.category}</Badge>}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedTicket.fecha}
                      onChange={(e) => setEditedTicket({ ...editedTicket, fecha: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    <span>{new Date(ticket.fecha).toLocaleDateString("es-AR")}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeTicket(ticket.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                <DollarSign className="h-5 w-5 text-primary" />
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editedTicket.monto}
                    onChange={(e) =>
                      setEditedTicket({
                        ...editedTicket,
                        monto: Number.parseFloat(e.target.value),
                      })
                    }
                    className="h-8 w-32"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">{formatCurrency(ticket.monto)}</span>
                )}
              </div>
              <Badge variant="secondary">{ticket.monto_raw}</Badge>
            </div>

            {showDebug && ticket.monto_debug && ticket.monto_debug.length > 0 && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs font-medium text-foreground">Debug Info:</p>
                <div className="mt-2 space-y-1">
                  {ticket.monto_debug.map((debug, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">
                      {debug}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {ticket.texto && (
              <details className="rounded-lg bg-muted/50 p-3">
                <summary className="cursor-pointer text-xs font-medium text-foreground">Ver texto completo</summary>
                <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{ticket.texto}</p>
              </details>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
