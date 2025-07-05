
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PetStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export function PetStatsCard({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  icon, 
  className = '' 
}: PetStatsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl transition-all duration-300 pulse-glow ${className}`}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 tech-pattern opacity-20 pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          {title}
        </CardTitle>
        {icon && (
          <div className="p-2 bg-black/5 rounded-lg">
            {icon}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </span>
        </div>
        
        {change && (
          <div className="flex items-center gap-1">
            <Badge
              className={`text-xs px-2 py-1 ${getTrendColor()}`}
            >
              {getTrendIcon()}
              <span className="ml-1">{change}</span>
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
