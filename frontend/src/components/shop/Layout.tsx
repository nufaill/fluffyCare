import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import Navbar, { type NavbarProps } from "./Navbar"
import { PetCareSidebar, type SidebarItem } from "./sidebar"

interface LayoutProps {
  children: React.ReactNode
  navbarProps?: Partial<NavbarProps>
  sidebarItems: SidebarItem[]
  sidebarFooterItems?: SidebarItem[]
  onSidebarItemClick?: (item: SidebarItem) => void
}

export function Layout({
  children,
  navbarProps = {},
  sidebarItems,
  sidebarFooterItems = [],
  onSidebarItemClick,
}: LayoutProps) {
  return (
    <div className="relative">
      <SidebarProvider>
        {/* Fixed Sidebar */}
        <PetCareSidebar menuItems={sidebarItems} footerItems={sidebarFooterItems} onItemClick={onSidebarItemClick} />

        {/* Main Content Area */}
        <div className="pl-72 min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Fixed Navbar */}
          <div className="sticky top-0 z-50">
            <Navbar {...navbarProps} />
          </div>

          {/* Scrollable Content */}
          <main className="relative z-10 overflow-x-hidden">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  )
}
