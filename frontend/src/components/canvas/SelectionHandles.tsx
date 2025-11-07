interface SelectionHandlesProps {
  onResizeMouseDown: (e: React.MouseEvent, handle: string) => void
}

export default function SelectionHandles({ onResizeMouseDown }: SelectionHandlesProps) {
  return (
    <>
      <div
        className="resize-handle resize-n"
        onMouseDown={(e) => onResizeMouseDown(e, 'n')}
      />
      <div
        className="resize-handle resize-s"
        onMouseDown={(e) => onResizeMouseDown(e, 's')}
      />
      <div
        className="resize-handle resize-e"
        onMouseDown={(e) => onResizeMouseDown(e, 'e')}
      />
      <div
        className="resize-handle resize-w"
        onMouseDown={(e) => onResizeMouseDown(e, 'w')}
      />
      <div
        className="resize-handle resize-ne"
        onMouseDown={(e) => onResizeMouseDown(e, 'ne')}
      />
      <div
        className="resize-handle resize-nw"
        onMouseDown={(e) => onResizeMouseDown(e, 'nw')}
      />
      <div
        className="resize-handle resize-se"
        onMouseDown={(e) => onResizeMouseDown(e, 'se')}
      />
      <div
        className="resize-handle resize-sw"
        onMouseDown={(e) => onResizeMouseDown(e, 'sw')}
      />
    </>
  )
}
