import { cn } from '@/lib/utils'

export function Label({ className, children, ...props }) {
  return (
    <label
      className={cn(
        'text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none flex items-center justify-between',
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}
