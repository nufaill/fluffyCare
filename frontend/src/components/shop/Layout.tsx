import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Navbar, type NavbarProps } from "./Navbar"
import { AppSidebar, type SidebarItem } from "./sidebar"
import { Footer, type FooterProps } from "./Footer"

interface LayoutProps {
  children: React.ReactNode
  navbarProps?: Partial<NavbarProps>
  sidebarItems: SidebarItem[]
  sidebarFooterItems?: SidebarItem[]
  footerProps?: Partial<FooterProps>
  onSidebarItemClick?: (item: SidebarItem) => void
}

export function Layout({
  children,
  navbarProps = {},
  sidebarItems,
  sidebarFooterItems = [],
  footerProps = {},
  onSidebarItemClick,
}: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppSidebar menuItems={sidebarItems} footerItems={sidebarFooterItems} onItemClick={onSidebarItemClick} />
        <SidebarInset className="flex-1">
          <Navbar {...navbarProps} />
          <main className="flex-1">{children}</main>
          <Footer {...footerProps} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
