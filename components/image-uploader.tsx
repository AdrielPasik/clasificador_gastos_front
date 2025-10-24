"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, ImageIcon, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadTicket } from "@/lib/api"
import { useTickets } from "@/hooks/use-tickets"
import { motion, AnimatePresence } from "framer-motion"

export function ImageUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addTicket } = useTickets()

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido (JPG o PNG)")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadTicket(file, debugMode)
      addTicket({
        ...result,
        imageUrl: URL.createObjectURL(file),
      })
      setPreview(null)
      // Mostrar mensaje informativo tras procesar
      setInfoMessage(
        "Ticket procesado. Revisa categoría y monto. Los datos pueden no ser 100% precisos — corrige manualmente si es necesario.",
      )
      // auto-dismiss después de 6 segundos
      setTimeout(() => setInfoMessage(null), 6000)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el ticket. Por favor intenta nuevamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card p-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Subir Ticket</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sube una imagen clara de tu ticket de compra</p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
              className="rounded border-input"
            />
            Modo debug
          </label>
        </div>

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium text-foreground">Procesando ticket...</p>
              <p className="mt-1 text-xs text-muted-foreground">Esto puede tomar unos segundos</p>
            </motion.div>
          ) : preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="mx-auto max-h-64 rounded-xl object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center rounded-xl bg-muted/50 py-12 transition-colors hover:bg-muted"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Arrastra tu ticket aquí</p>
              <p className="mt-1 text-xs text-muted-foreground">o haz clic para seleccionar</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()} className="mt-6" size="lg">
                <ImageIcon className="mr-2 h-4 w-4" />
                Seleccionar imagen
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {infoMessage && (
          <Alert>
            <AlertDescription>{infoMessage}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Para mejores resultados, asegúrate de que el ticket esté bien iluminado, enfocado y
            que el texto sea legible.
          </p>
        </div>
      </div>
    </Card>
  )
}
