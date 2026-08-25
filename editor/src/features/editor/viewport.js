export function screenToDocument({ clientX, clientY, rect, zoom, panX, panY }) {
  return {
    x: (clientX - rect.left - panX) / zoom,

    y: (clientY - rect.top - panY) / zoom,
  };
}

export function documentToScreen({ x, y, rect, zoom, panX, panY }) {
  return {
    x: rect.left + panX + x * zoom,

    y: rect.top + panY + y * zoom,
  };
}

export function documentToViewport(value, zoom) {
  return value * zoom;
}

export function viewportToDocument(value, zoom) {
  return value / zoom;
}

export function clampZoom(zoom) {
  return Math.min(3, Math.max(0.25, zoom));
}
