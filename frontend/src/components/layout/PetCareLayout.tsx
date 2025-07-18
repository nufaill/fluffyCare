
import React, { useState } from 'react';
import { PetCareSidebar } from '../shop/sidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface PetCareLayoutProps {
  children: React.ReactNode;
  navbar?: React.ReactNode;
}

export function PetCareLayout({ children, navbar }: PetCareLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-background shadow-lg"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <PetCareSidebar 
            isCollapsed={sidebarCollapsed}
            className="fixed top-0 left-0 h-full z-30"
          />
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <PetCareSidebar />
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'
        }`}>
          {/* Navbar */}
          {navbar && (
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
              <div className="flex items-center justify-between p-4">
                <div className="hidden lg:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 lg:ml-4">
                  {navbar}
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
