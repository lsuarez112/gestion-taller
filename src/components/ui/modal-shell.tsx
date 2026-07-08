import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ModalShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  headerActions?: React.ReactNode
  className?: string
  bodyClassName?: string
}

export function ModalShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  headerActions,
  className,
  bodyClassName,
}: ModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={className}>
        {(title || description || headerActions) && (
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5 text-left">
                {title ? <DialogTitle className="text-xl">{title}</DialogTitle> : null}
                {description ? <DialogDescription>{description}</DialogDescription> : null}
              </div>
              {headerActions ? (
                <div className="flex shrink-0 items-center">{headerActions}</div>
              ) : null}
            </div>
          </DialogHeader>
        )}

        <div
          className={cn(
            '-mx-4 no-scrollbar max-h-[min(60vh,calc(100dvh-14rem))] overflow-y-auto px-4',
            bodyClassName,
          )}
        >
          {children}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          {footer}
          <DialogClose asChild>
            <Button variant="outline" className="ml-auto shrink-0 cursor-pointer">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
