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

/** 🔥 URL fija del backend FastAPI */
const BASE_URL = "https://miticket.duckdns.org"

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

  const url = `${BASE_URL}/api/ocr${debug ? "?debug_tokens=true" : ""}`

  try {
    console.log("[uploadTicket] POST ->", url, {
      field: fileField,
      name: file.name,
      size: file.size,
      type: file.type
    })

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 413) throw new Error("El archivo es demasiado grande. Máximo 10MB.")
      if (response.status === 400) throw new Error("Formato de archivo inválido. Usa JPG o PNG.")

      try {
        const err = await response.json()
        const msg = err?.message || err?.error || JSON.stringify(err)
        throw new Error(`Error del servidor (${response.status}): ${msg}`)
      } catch {
        throw new Error(`Error del servidor (${response.status}).`)
      }
    }

    const data = (await response.json()) as OCRResponse

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
        bbox: [t.left, t.top, t.width, t.height],
      }))
    }

    if (data.monto_debug && Array.isArray(data.monto_debug)) {
      normalized.monto_debug = data.monto_debug.map((d) =>
        typeof d === "string" ? d : JSON.stringify(d)
      )
    }

    return normalized
  } catch (error: any) {
    console.error("Error al subir el ticket:", error)
    if (error instanceof Error) throw error
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté activo.")
  }
}
