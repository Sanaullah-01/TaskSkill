import { StatCard } from '@/features/dashboard/components/StatCard';
import { RecentTasksWidget } from '@/features/dashboard/components/RecentTasksWidget';
import { RecentActivityWidget } from '@/features/dashboard/components/RecentActivityWidget';
import { QuickAddButton } from '@/features/dashboard/components/QuickAddButton';
import { ListTodo, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Tasks" 
          value={124} 
          icon={<ListTodo className="h-4 w-4 text-muted-foreground" />} 
          delay={0.1}
          description="from last month"
          trend="up"
          trendValue="+12%"
        />
        <StatCard 
          title="Pending" 
          value={18} 
          icon={<Clock className="h-4 w-4 text-muted-foreground" />} 
          delay={0.2}
          description="from last week"
          trend="down"
          trendValue="-2%"
        />
        <StatCard 
          title="Completed" 
          value={82} 
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />} 
          delay={0.3}
          description="from last month"
          trend="up"
          trendValue="+8%"
        />
        <StatCard 
          title="Overdue" 
          value={4} 
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />} 
          delay={0.4}
          description="needs immediate attention"
          trend="neutral"
        />
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <RecentTasksWidget />
        <RecentActivityWidget />
      </div>

      <QuickAddButton />
    </div>
  );
}
