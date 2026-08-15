const escapeXml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const escapeCss = (value = '') => String(value).replace(/"/g, '\\"')

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const downloadDataUrl = (dataUrl, filename) => {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export const exportRaster = (stage, document, format = 'png', zoom = 1) => {
  if (!stage) throw new Error('Canvas is not ready yet.')
  const safeZoom = Math.max(0.01, Number(zoom) || 1)
  // The editor stage is visually scaled by `zoom`. Counter-scale the export
  // so the downloaded file is exactly the document canvas dimensions.
  const pixelRatio = 1 / safeZoom
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
  const quality = format === 'jpg' ? 0.92 : undefined
  const dataUrl = stage.toDataURL({
    mimeType,
    quality,
    pixelRatio,
  })
  downloadDataUrl(dataUrl, `design-${Date.now()}.${format}`)
}

const imageToDataUrl = async (src) => {
  if (!src || src.startsWith('data:')) return src
  try {
    const response = await fetch(src, { mode: 'cors' })
    if (!response.ok) return src
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return src
  }
}

const textToSvg = (element) => {
  const fontSize = element.fontSize || 16
  const fontWeight = element.fontWeight || 400
  const fontFamily = escapeCss(element.fontFamily || 'Inter, Arial, sans-serif')
  const fill = escapeXml(element.fill || '#000000')
  const align = element.align || 'left'
  const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start'
  const x = align === 'center' ? (element.width || 0) / 2 : align === 'right' ? (element.width || 0) : 0
  const lines = String(element.text || '').split(/\r?\n/)
  const lineHeight = (element.lineHeight || 1.2) * fontSize
  const tspans = lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join('')
  return `<text x="${x}" y="${fontSize}" text-anchor="${anchor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" letter-spacing="${element.letterSpacing || 0}" fill="${fill}">${tspans}</text>`
}

const elementToSvg = async (element) => {
  const x = Number(element.x) || 0
  const y = Number(element.y) || 0
  const width = Number(element.width) || 0
  const height = Number(element.height) || 0
  const rotation = Number(element.rotation) || 0
  const opacity = element.opacity ?? 1
  const fill = escapeXml(element.fill || 'none')
  const stroke = element.stroke ? ` stroke="${escapeXml(element.stroke)}" stroke-width="${Number(element.strokeWidth) || 0}"` : ''
  const cx = width / 2
  const cy = height / 2
  const transform = `translate(${x} ${y}) rotate(${rotation} ${cx} ${cy})`

  switch (element.type) {
    case 'text':
      return `<g transform="${transform}" opacity="${opacity}">${textToSvg({ ...element, x: 0, y: 0 })}</g>`
    case 'rect':
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${Number(element.cornerRadius) || 0}" fill="${fill}" opacity="${opacity}"${stroke} transform="rotate(${rotation} ${x + cx} ${y + cy})"/>`
    case 'circle': {
      const radius = Number(element.radius) || Math.min(width || 100, height || 100) / 2
      return `<circle cx="${x + radius}" cy="${y + radius}" r="${radius}" fill="${fill}" opacity="${opacity}"${stroke} transform="rotate(${rotation} ${x + radius} ${y + radius})"/>`
    }
    case 'ellipse': {
      const rx = width / 2 || 60
      const ry = height / 2 || 40
      return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}"${stroke} transform="rotate(${rotation} ${x + rx} ${y + ry})"/>`
    }
    case 'line': {
      const points = element.points || [0, 0, width || 100, 0]
      return `<line x1="${points[0] + x}" y1="${points[1] + y}" x2="${points[2] + x}" y2="${points[3] + y}" stroke="${escapeXml(element.stroke || '#111827')}" stroke-width="${Number(element.strokeWidth) || 3}" opacity="${opacity}" transform="rotate(${rotation} ${x + width / 2} ${y + height / 2})"/>`
    }
    case 'image': {
      const href = await imageToDataUrl(element.src)
      return `<image href="${escapeXml(href || '')}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none" opacity="${opacity}" transform="rotate(${rotation} ${x + width / 2} ${y + height / 2})"/>`
    }
    case 'svg':
      return `<image href="${escapeXml(await imageToDataUrl(element.src))}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none" opacity="${opacity}" transform="rotate(${rotation} ${x + width / 2} ${y + height / 2})"/>`
    default:
      return ''
  }
}

export const exportSvg = async (document) => {
  const background = escapeXml(document.canvas.background || '#ffffff')
  const parts = []
  for (const id of document.elementOrder) {
    const element = document.elements[id]
    if (!element || element.visible === false) continue
    parts.push(await elementToSvg(element))
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${document.canvas.width}" height="${document.canvas.height}" viewBox="0 0 ${document.canvas.width} ${document.canvas.height}">\n<rect width="100%" height="100%" fill="${background}"/>\n${parts.join('\n')}\n</svg>`
  downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `design-${Date.now()}.svg`)
}

export const exportSelectedImage = async (element) => {
  if (!element?.src) throw new Error('Select an image layer first.')
  const response = await fetch(element.src, { mode: 'cors' })
  if (!response.ok) throw new Error('The image could not be downloaded.')
  const blob = await response.blob()
  const extension = element.mimeType === 'image/jpeg' ? 'jpg' : element.mimeType === 'image/webp' ? 'webp' : 'png'
  downloadBlob(blob, `${(element.name || 'image').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'image'}.${extension}`)
}

export const exportJson = (document) => {
  downloadBlob(new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' }), `design-${Date.now()}.json`)
}
