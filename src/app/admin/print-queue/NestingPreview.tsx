'use client'

/**
 * Schematic SVG preview of a nesting layout.
 *
 * Renders placed items as colored rectangles on the roll, with order
 * labels when space permits. Items sharing an orderId get the same color.
 *
 * Spec Ref: §4.2.3 (Layout thumbnail preview)
 */

interface Placement {
  orderItemId: string
  orderId: string
  x: number
  y: number
  widthIn: number
  heightIn: number
  rotation: 0 | 90
}

interface NestingPreviewProps {
  placements: Placement[]
  rollWidthIn: number
  totalLengthIn: number
  /** Map of orderId → short label (e.g. "#A1B2C3D4"). Optional. */
  orderLabels?: Record<string, string>
  /** Max rendered width in pixels. Default 380. */
  maxPxWidth?: number
  /** Max rendered height in pixels (component scrolls if exceeded). Default 520. */
  maxPxHeight?: number
}

// Soft pastel palette — distinguishable but not garish
const COLORS = [
  { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' }, // blue
  { fill: '#fce7f3', stroke: '#ec4899', text: '#9d174d' }, // pink
  { fill: '#dcfce7', stroke: '#22c55e', text: '#166534' }, // green
  { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e' }, // amber
  { fill: '#f3e8ff', stroke: '#a855f7', text: '#6b21a8' }, // purple
  { fill: '#ccfbf1', stroke: '#14b8a6', text: '#115e59' }, // teal
  { fill: '#ffedd5', stroke: '#f97316', text: '#9a3412' }, // orange
  { fill: '#e0e7ff', stroke: '#6366f1', text: '#3730a3' }, // indigo
]

/** Deterministically assign a color to each orderId. */
function buildColorMap(placements: Placement[]): Record<string, (typeof COLORS)[number]> {
  const map: Record<string, (typeof COLORS)[number]> = {}
  let i = 0
  for (const p of placements) {
    if (!map[p.orderId]) {
      map[p.orderId] = COLORS[i % COLORS.length]
      i += 1
    }
  }
  return map
}

export default function NestingPreview({
  placements,
  rollWidthIn,
  totalLengthIn,
  orderLabels = {},
  maxPxWidth = 380,
  maxPxHeight = 520,
}: NestingPreviewProps) {
  if (placements.length === 0 || totalLengthIn === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">No layout to preview</p>
      </div>
    )
  }

  // Scale: keep width aspect, constrain to maxPxWidth
  const pxPerIn = maxPxWidth / rollWidthIn
  const svgWidthPx = maxPxWidth
  const svgHeightPx = totalLengthIn * pxPerIn

  const colorMap = buildColorMap(placements)

  // Unique orders, for legend
  const uniqueOrderIds = Array.from(new Set(placements.map((p) => p.orderId)))

  return (
    <div className="space-y-3">
      {/* Preview frame */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">
            {rollWidthIn}″ × {totalLengthIn.toFixed(1)}″
          </span>
          <span>{placements.length} item{placements.length !== 1 ? 's' : ''}</span>
        </div>

        <div
          className="mx-auto overflow-y-auto overflow-x-hidden rounded border border-zinc-200 bg-white"
          style={{ maxHeight: `${maxPxHeight}px`, width: `${svgWidthPx}px` }}
        >
          <svg
            viewBox={`0 0 ${rollWidthIn} ${totalLengthIn}`}
            width={svgWidthPx}
            height={svgHeightPx}
            preserveAspectRatio="xMidYMin meet"
            style={{ display: 'block' }}
          >
            {/* Roll background (paper) */}
            <rect
              x={0}
              y={0}
              width={rollWidthIn}
              height={totalLengthIn}
              fill="#fafafa"
            />

            {/* Placements */}
            {placements.map((p, i) => {
              const color = colorMap[p.orderId]
              const label = orderLabels[p.orderId] ?? `#${p.orderId.slice(0, 6).toUpperCase()}`

              // Font size should be roughly 1/5 the smaller dimension, clamped
              const smaller = Math.min(p.widthIn, p.heightIn)
              const fontIn = Math.max(0.4, Math.min(1.2, smaller * 0.22))
              // Only show text if rectangle is big enough
              const showLabel = p.widthIn >= 2 && p.heightIn >= 1.2

              return (
                <g key={`${p.orderItemId}-${i}`}>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.widthIn}
                    height={p.heightIn}
                    fill={color.fill}
                    stroke={color.stroke}
                    strokeWidth={0.05}
                  />
                  {showLabel && (
                    <text
                      x={p.x + p.widthIn / 2}
                      y={p.y + p.heightIn / 2}
                      fontSize={fontIn}
                      fill={color.text}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="system-ui, sans-serif"
                      fontWeight={600}
                    >
                      {label}
                    </text>
                  )}
                  {p.rotation === 90 && showLabel && (
                    <text
                      x={p.x + p.widthIn - 0.15}
                      y={p.y + 0.35}
                      fontSize={0.35}
                      fill={color.stroke}
                      textAnchor="end"
                      fontFamily="system-ui, sans-serif"
                    >
                      ↻
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Scale hint */}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-[color:var(--text-tertiary)]">
          <span>Roll feeds ↓</span>
        </div>
      </div>

      {/* Legend */}
      {uniqueOrderIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {uniqueOrderIds.map((orderId) => {
            const color = colorMap[orderId]
            const label = orderLabels[orderId] ?? `#${orderId.slice(0, 6).toUpperCase()}`
            return (
              <span
                key={orderId}
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: color.fill,
                  borderColor: color.stroke,
                  color: color.text,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color.stroke }}
                />
                {label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
