// api.ts

export interface OCRToken {
  text: string
  conf: number
  left: number
  top: number
  width: number
  height: number
}

export interface MontoDebugItem {
  chosen?: string
  parsed?: number | null
  method?: string
  [k: string]: any
}

export interface OCRResponse {
  fecha: string | null
  monto: number | null
  monto_raw?: string | null
  merchant?: string | null
  texto: string
  texto_clean?: string
  texto_lines: string[]
  tokens?: OCRToken[]
  monto_debug?: MontoDebugItem[]
  category?: string
  category_debug?: any
}

// Forma que espera el frontend (coercida/normalizada)
export interface FrontendOCR {
  fecha: string
  monto: number
  monto_raw: string
  merchant: string
  texto: string
  texto_lines: string[]
  tokens?: Array<{ text: string; confidence: number; bbox: number[] }>
  monto_debug?: string[]
  category?: string
}

/**
 * Sube una imagen de ticket al servidor para que el backend procese el OCR.
 * @param file Imagen del ticket (solo JPG o PNG)
 * @param debug Modo debug opcional para ver tokens del OCR
 */
export async function uploadTicket(
  file: File,
  debug = false,
  fileField = "file"
): Promise<FrontendOCR> {
  const formData = new FormData()
  formData.append(fileField, file)

  // Construimos la URL base usando variables públicas (Next.js: NEXT_PUBLIC_*)
  // Preferimos NEXT_PUBLIC_API_URL si está definida; si no, usamos NEXT_PUBLIC_BACKEND_HOST y PORT
  // Accedemos a variables de entorno de forma segura desde el cliente/servidor
  const env = (globalThis as any)?.process?.env || (globalThis as any)?.__env || {}
  const publicUrl = env.NEXT_PUBLIC_API_URL
  const host = env.NEXT_PUBLIC_BACKEND_HOST || env.BACKEND_HOST || "127.0.0.1"
  const port = env.NEXT_PUBLIC_BACKEND_PORT || env.BACKEND_PORT || "8000"
  const baseUrl = (publicUrl && publicUrl.replace(/\/$/, "")) || `http://${host}:${port}`

  const url = `${baseUrl}/api/ocr${debug ? "?debug_tokens=true" : ""}`

  try {
    // Log para depuración: muestra en la consola del navegador la URL y metadatos del archivo
    try {
      console.log("[uploadTicket] POST ->", url, { field: fileField, name: file.name, size: file.size, type: file.type })
    } catch (e) {
      // en entornos donde console o file no estén disponibles, ignoramos
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      // Tratamos errores conocidos
      if (response.status === 413) throw new Error("El archivo es demasiado grande. Máximo 10MB.")
      if (response.status === 400) throw new Error("Formato de archivo inválido. Usa JPG o PNG.")

      // Intentamos extraer mensaje del body (si el backend lo devuelve)
      try {
        const err = await response.json()
        const msg = err?.message || err?.error || JSON.stringify(err)
        throw new Error(`Error del servidor (${response.status}): ${msg}`)
      } catch (e) {
        throw new Error(`Error del servidor (${response.status}).`) 
      }
    }

    const data = (await response.json()) as OCRResponse

    // Normalizamos la respuesta para que el frontend (zustand/use-tickets) tenga siempre
    // valores no nulos y el formato de tokens que ya usa la app.
    const normalized: FrontendOCR = {
      fecha: data.fecha ?? new Date().toISOString(),
      monto: data.monto ?? 0,
      monto_raw: data.monto_raw ?? "",
      merchant: data.merchant ?? "",
      texto: data.texto ?? "",
      texto_lines: data.texto_lines ?? [],
      category: data.category,
    }

    if (data.tokens && Array.isArray(data.tokens)) {
      normalized.tokens = data.tokens.map((t) => ({
        text: t.text,
        confidence: t.conf,
        // bbox: [left, top, width, height] — la app espera un array de números
        bbox: [t.left, t.top, t.width, t.height],
      }))
    }

    if (data.monto_debug && Array.isArray(data.monto_debug)) {
      normalized.monto_debug = data.monto_debug.map((d) => (typeof d === "string" ? d : JSON.stringify(d)))
    }

    return normalized
  } catch (error: any) {
    console.error("Error al subir el ticket:", error)
    // Si es un Error creado arriba, lo reenviamos; si es fallo de red, damos mensaje amigable
    if (error instanceof Error) throw error
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté activo.")
  }
}
