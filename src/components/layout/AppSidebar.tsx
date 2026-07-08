import { ChevronRight, LayoutDashboard, Package, Tags, Car } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { SidebarUserMenu } from '@/components/layout/SidebarUserMenu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const mainNavItems = [{ title: 'Inicio', href: '/', icon: LayoutDashboard }]

const articlesSubItems = [
  { title: 'Catálogo', href: '/articulos', icon: Package },
  { title: 'Categorías', href: '/articulos/categorias', icon: Tags },
  { title: 'Marcas y modelos', href: '/articulos/marcas-modelos', icon: Car },
]

export function AppSidebar() {
  const location = useLocation()
  const isArticlesSection = location.pathname.startsWith('/articulos')

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <img
                  src="/icon-192x192.png"
                  alt=""
                  className="aspect-square size-8 rounded-lg object-cover"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Repuestos Taller</span>
                  <span className="truncate text-xs text-muted-foreground">Inventario</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.href}
                      end={item.href === '/'}
                      className={({ isActive }) => (isActive ? 'bg-sidebar-accent' : undefined)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <Collapsible asChild defaultOpen={isArticlesSection}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Artículos">
                      <Package />
                      <span>Artículos</span>
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {articlesSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === item.href}
                          >
                            <NavLink to={item.href} end={item.href === '/articulos'}>
                              <item.icon />
                              <span>{item.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
