import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/Progress';

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  url: string;
  isActive?: boolean;
  badge?: string | number;
  isNew?: boolean;
  subItems?: Omit<SidebarItem, 'subItems'>[];
}

interface AppSidebarProps {
  className?: string;
  menuItems: SidebarItem[];
  footerItems?: SidebarItem[];
  onItemClick?: (item: SidebarItem) => void;
  userProgress?: {
    level: number;
    xp: number;
    maxXp: number;
  };
}

export function AppSidebar({
  className = '',
  menuItems,
  footerItems = [],
  onItemClick,
  userProgress = { level: 5, xp: 750, maxXp: 1000 },
}: AppSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemClick = (item: SidebarItem, event: React.MouseEvent) => {
    if (item.subItems) {
      event.preventDefault();
      setExpandedItems((prev) =>
        prev.includes(item.title) 
          ? prev.filter((title) => title !== item.title) 
          : [...prev, item.title]
      );
    } else if (onItemClick) {
      event.preventDefault();
      onItemClick(item);
    }
  };

  return (
    <div className={`flex flex-col h-screen w-64 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300 ${className}`}>
      {/* Header with User Progress */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Level {userProgress.level}</span>
          </div>
          <Progress 
            value={(userProgress.xp / userProgress.maxXp) * 100} 
            className="h-2 bg-white/20" 
          />
          <p className="text-xs mt-1 opacity-90">
            {userProgress.xp}/{userProgress.maxXp} XP
          </p>
        </div>
      </div>

      {/* Main Menu Content */}
      <div className="flex-1 overflow-y-auto px-2">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.title}>
              {/* Main Menu Item */}
              <a
                href={item.url}
                onClick={(e) => handleItemClick(item, e)}
                className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:shadow-sm rounded-lg ${
                  item.isActive
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-700'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.isActive
                        ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span>{item.title}</span>
                  {item.isNew && (
                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-2 py-0.5 border-0">
                      New
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {item.subItems && (
                    <ChevronRight
                      className={`h-4 w-4 transition-transform text-gray-400 dark:text-gray-500 ${
                        expandedItems.includes(item.title) ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </div>
              </a>

              {/* Sub Items */}
              {item.subItems && expandedItems.includes(item.title) && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <a
                      key={subItem.title}
                      href={subItem.url}
                      onClick={(e) => handleItemClick(subItem, e)}
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors duration-200 rounded-lg ${
                        subItem.isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <subItem.icon className="h-3 w-3" />
                      <span>{subItem.title}</span>
                      {subItem.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {subItem.badge}
                        </Badge>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Items */}
      {footerItems.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <nav className="space-y-1">
            {footerItems.map((item) => (
              <a
                key={item.title}
                href={item.url}
                onClick={(e) => handleItemClick(item, e)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg"
              >
                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-600">
                  <item.icon className="h-4 w-4" />
                </div>
                <span>{item.title}</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}