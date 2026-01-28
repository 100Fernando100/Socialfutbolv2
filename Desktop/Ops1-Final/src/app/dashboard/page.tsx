'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredUser } from '@/lib/auth';
import { getDashboardStats, getRecentActivity } from '@/lib/api';
import { DashboardStats, ActivityItem, User } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import {
  ListTodo,
  CheckCircle,
  Clock,
  AlertTriangle,
  PlusCircle,
  Cog,
  ArrowRight,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const storedUser = getStoredUser();
      setUser(storedUser);

      try {
        const [statsData, activityData] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(5),
        ]);
        setStats(statsData);
        setActivities(activityData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'task_blocked':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'task_created':
        return <PlusCircle className="h-5 w-5 text-blue-500" />;
      case 'config_updated':
        return <Cog className="h-5 w-5 text-purple-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.clientName || 'User'}
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your automation tasks
          </p>
        </div>
        <Link href="/dashboard/tasks/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasks Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.tasksToday || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListTodo className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.tasksPending || 0}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.tasksCompleted || 0}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Blocked</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.tasksBlocked || 0}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/tasks/new" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <PlusCircle className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900">Submit New Task</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link href="/dashboard/configuration" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Cog className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900">View Configuration</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link href="/dashboard/audit" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900">Audit Receipts</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/dashboard/tasks" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
          </div>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
