'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface OrderItem {
  id: string
  image_id: string | null
  media_type_name: string | null
  print_size: string | null
  width: number
  height: number
  option_names: string[] | null
  unit_price: number
  quantity: number
  discount_pct: number | null
  total: number | null
}

interface OrderItemsExpanderProps {
  items: OrderItem[]
}

export default function OrderItemsExpander({ items }: OrderItemsExpanderProps) {
  const [expanded, setExpanded] = useState(false)

  if (items.length === 0) return null

  return (
    <div className="border-t border-border/70">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center gap-1 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
      >
        {expanded ? 'Hide' : 'View'} Items
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border/70 bg-muted/40/50">
          <div className="divide-y divide-zinc-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 sm:px-6"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.media_type_name ?? 'Print'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.print_size ?? `${item.width}×${item.height}"`}
                    {' · '}
                    Qty: {item.quantity}
                  </p>
                  {item.option_names && item.option_names.length > 0 && (
                    <p className="mt-0.5 text-xs text-[color:var(--text-tertiary)]">
                      {item.option_names.join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    ${Number(item.total ?? item.unit_price * item.quantity).toFixed(2)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-muted-foreground">
                      ${Number(item.unit_price).toFixed(2)} each
                    </p>
                  )}
                  {item.discount_pct && Number(item.discount_pct) > 0 && (
                    <p className="text-xs font-medium text-green-600">
                      {Number(item.discount_pct)}% off
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
