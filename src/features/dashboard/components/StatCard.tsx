'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  delay?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatCard({ title, value, icon: Icon, description, delay = 0, trend, trendValue }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {trendValue && (
                <span
                  className={cn(
                    "mr-1 font-medium",
                    trend === 'up' && "text-emerald-500",
                    trend === 'down' && "text-red-500",
                    trend === 'neutral' && "text-muted-foreground"
                  )}
                >
                  {trendValue}
                </span>
              )}
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
