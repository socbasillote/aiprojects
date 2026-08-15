import { useEffect, useRef } from 'react'
import { Transformer } from 'react-konva'

export default function SelectionTransformer({ selectedIds, nodesById }) {
  const ref = useRef(null)
  useEffect(() => {
    const transformer = ref.current
    if (!transformer) return
    const nodes = selectedIds.map((id) => nodesById.current[id]).filter(Boolean)
    transformer.nodes(nodes)
    transformer.getLayer()?.batchDraw()
  }, [selectedIds, nodesById])
  return <Transformer ref={ref} rotateEnabled enabledAnchors={['top-left','top-center','top-right','middle-right','bottom-right','bottom-center','bottom-left','middle-left']} boundBoxFunc={(oldBox, newBox) => newBox.width < 10 || newBox.height < 10 ? oldBox : newBox} />
}
