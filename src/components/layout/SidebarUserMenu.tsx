import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { toastMessages } from '@/lib/messages'

export function SidebarUserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { state } = useSidebar()

  const email = user?.email ?? 'Usuario'
  const collapsedTooltip = `${email} · Cerrar sesión`

  async function handleSignOut() {
    await signOut()
    toast.info(toastMessages.auth.signedOut)
    navigate('/login', { replace: true })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="grid gap-2 px-1 group-data-[collapsible=icon]:hidden">
          <p className="truncate px-2 text-xs text-muted-foreground" title={email}>
            {email}
          </p>
          <SidebarMenuButton
            className="cursor-pointer"
            tooltip={undefined}
            onClick={() => void handleSignOut()}
          >
            <LogOut />
            <span>Cerrar sesión</span>
          </SidebarMenuButton>
        </div>

        <SidebarMenuButton
          className="hidden cursor-pointer group-data-[collapsible=icon]:flex"
          tooltip={state === 'collapsed' ? collapsedTooltip : undefined}
          onClick={() => void handleSignOut()}
        >
          <LogOut />
          <span className="sr-only">Cerrar sesión</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
