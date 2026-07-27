'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, PresentationChart, DownloadSimple } from '@phosphor-icons/react';
import { useAppSelector } from '@/redux/hooks';

export default function DashboardPage() {
  const tasks = useAppSelector((state) => state.tasks.items);
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to TaskSkill</h1>
        <p className="text-muted-foreground">Here is an overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-primary/10 via-background to-secondary/30 border border-primary/20 rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <DownloadSimple className="w-5 h-5 text-primary" />
              TaskSkill Chrome Extension
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Access your tasks from anywhere on the web. Syncs instantly with your account.
            </p>
          </div>
          <div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-background rounded-lg border p-4 shadow-inner">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Developer Mode Installation</h4>
                <p className="text-xs text-muted-foreground max-w-[400px]">
                  Download the ZIP, extract it, and load it via <code className="bg-secondary px-1 py-0.5 rounded text-foreground font-mono">chrome://extensions</code> by turning on Developer Mode and clicking "Load unpacked".
                </p>
              </div>
              <a 
                href="/taskskill-extension.zip" 
                download
                className="shrink-0 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
              >
                <DownloadSimple className="w-4 h-4 mr-2 weight-bold" />
                Download Extension
              </a>
            </div>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl p-6 border flex flex-col justify-between aspect-video md:col-span-2">
          <div>
            <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <PresentationChart className="w-5 h-5 text-primary" weight="fill" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Your Workflow is Active</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Keep track of your projects and manage tasks efficiently with the new minimalist interface.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/tasks"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Go to Tasks Board <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl p-6 border flex flex-col justify-between aspect-video md:aspect-auto">
          <div>
            <div className="bg-amber-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-amber-500" weight="fill" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Pending</h3>
            <div className="text-3xl font-bold tracking-tighter mt-4">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks in progress</p>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl p-6 border flex flex-col justify-between aspect-video md:aspect-auto">
          <div>
            <div className="bg-emerald-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-500" weight="fill" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Completed</h3>
            <div className="text-3xl font-bold tracking-tighter mt-4">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks done</p>
          </div>
        </div>
      </div>
    </div>
  );
}
