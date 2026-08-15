import { forwardRef, useEffect, useState } from 'react'
import { Text, Rect, Circle, Ellipse, Line, Image as KonvaImage, Group } from 'react-konva'

const useImage = (src) => {
  const [image, setImage] = useState(null)
  useEffect(() => {
    if (!src) return
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.src = src
    return () => { img.onload = null }
  }, [src])
  return image
}

const DesignElementRenderer = forwardRef(function DesignElementRenderer({ element, onSelect, onDoubleClick, onTransformEnd }, ref) {
  if (!element.visible) return null
  const common = {
    ref,
    id: element.id,
    x: element.x,
    y: element.y,
    rotation: element.rotation || 0,
    opacity: element.opacity ?? 1,
    draggable: !element.locked,
    onClick: (event) => onSelect(element.id, event.evt.shiftKey),
    onTap: (event) => onSelect(element.id, event.evt.shiftKey),
    onDragEnd: (event) => onTransformEnd(element.id, { x: event.target.x(), y: event.target.y() }),
    onTransformEnd: (event) => {
      const node = event.target
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      node.scaleX(1)
      node.scaleY(1)
      onTransformEnd(element.id, {
        x: node.x(), y: node.y(), rotation: node.rotation(),
        width: Math.max(10, node.width() * scaleX),
        height: Math.max(10, node.height() * scaleY),
      })
    },
  }

  switch (element.type) {
    case 'text':
      return <Text {...common} text={element.text} width={element.width} fontFamily={element.fontFamily} fontSize={element.fontSize} fontStyle={element.fontWeight >= 700 ? 'bold' : 'normal'} fill={element.fill} align={element.align || 'left'} lineHeight={element.lineHeight || 1.2} letterSpacing={element.letterSpacing || 0} onDblClick={() => onDoubleClick(element.id)} onDblTap={() => onDoubleClick(element.id)} />
    case 'rect':
      return <Rect {...common} width={element.width} height={element.height} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth || 0} cornerRadius={element.cornerRadius || 0} />
    case 'circle':
      return <Circle {...common} radius={element.radius || Math.min(element.width || 100, element.height || 100) / 2} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth || 0} />
    case 'ellipse':
      return <Ellipse {...common} radiusX={(element.width || 120) / 2} radiusY={(element.height || 80) / 2} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth || 0} />
    case 'line':
      return <Line {...common} points={element.points || [0, 0, element.width || 100, 0]} stroke={element.stroke || '#111827'} strokeWidth={element.strokeWidth || 3} />
    case 'image':
    case 'svg': {
      const image = useImage(element.src)
      return image ? <KonvaImage {...common} image={image} width={element.width} height={element.height} /> : null
    }
    case 'group':
      return <Group {...common} />
    default:
      return null
  }
})

export default DesignElementRenderer
