export function normalizeDesignDocument(document) {
  const source = document && typeof document === 'object' ? document : {}
  const canvas = source.canvas && typeof source.canvas === 'object' ? source.canvas : {}
  const rawElements = source.elements
  const elements = {}

  if (Array.isArray(rawElements)) {
    for (const element of rawElements) {
      if (element?.id) elements[element.id] = element
    }
  } else if (rawElements && typeof rawElements === 'object') {
    for (const [id, element] of Object.entries(rawElements)) {
      if (element && typeof element === 'object') elements[id] = { ...element, id: element.id || id }
    }
  }

  const order = Array.isArray(source.elementOrder) ? source.elementOrder.filter((id) => elements[id]) : []
  for (const id of Object.keys(elements)) if (!order.includes(id)) order.push(id)

  return {
    version: Number.isInteger(source.version) && source.version > 0 ? source.version : 1,
    canvas: {
      width: Number(canvas.width) > 0 ? Number(canvas.width) : 1080,
      height: Number(canvas.height) > 0 ? Number(canvas.height) : 1080,
      background: typeof canvas.background === 'string' ? canvas.background : '#ffffff',
    },
    elements,
    elementOrder: order,
  }
}
