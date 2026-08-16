const SERVER_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '')

export const ELEMENT_TYPES = Object.freeze({
  TEXT: 'text', RECT: 'rect', CIRCLE: 'circle', ELLIPSE: 'ellipse', LINE: 'line', IMAGE: 'image', SVG: 'svg', GROUP: 'group',
})

export const createBaseElement = (overrides = {}) => ({
  id: crypto.randomUUID(), type: ELEMENT_TYPES.RECT, name: 'Shape', x: 0, y: 0, width: 100, height: 100,
  rotation: 0, opacity: 1, visible: true, locked: false, ...overrides,
})

export const createDefaultDocument = () => ({
  version: 1,
  canvas: { width: 1080, height: 1080, background: '#ffffff' },
  elements: {},
  elementOrder: [],
})

export function normalizeDesignDocument(document) {
  const source = document && typeof document === 'object' ? document : {}
  const canvas = source.canvas && typeof source.canvas === 'object' ? source.canvas : {}
  const rawElements = source.elements
  let elements = {}

  if (Array.isArray(rawElements)) {
    for (const element of rawElements) {
      if (element?.id) elements[element.id] = { ...element, ...(typeof element.src === 'string' && element.src.startsWith('/uploads/') ? { src: `${SERVER_ORIGIN}${element.src}` } : {}) }
    }
  } else if (rawElements && typeof rawElements === 'object') {
    elements = Object.fromEntries(Object.entries(rawElements).map(([id, element]) => [id, { ...element, ...(typeof element?.src === 'string' && element.src.startsWith('/uploads/') ? { src: `${SERVER_ORIGIN}${element.src}` } : {}) }]))
  }

  const elementOrder = Array.isArray(source.elementOrder)
    ? source.elementOrder.filter((id) => Boolean(elements[id]))
    : Object.keys(elements)

  for (const id of Object.keys(elements)) {
    if (!elementOrder.includes(id)) elementOrder.push(id)
  }

  return {
    version: Number.isInteger(source.version) && source.version > 0 ? source.version : 1,
    canvas: {
      width: Number(canvas.width) > 0 ? Number(canvas.width) : 1080,
      height: Number(canvas.height) > 0 ? Number(canvas.height) : 1080,
      background: typeof canvas.background === 'string' ? canvas.background : '#ffffff',
    },
    elements,
    elementOrder,
  }
}
