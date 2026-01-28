'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTasks } from '@/lib/api';
import { Task } from '@/lib/types';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import { PlusCircle, Filter, Search, ChevronLeft, ChevronRight, FileSpreadsheet, Database, ExternalLink } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);
      try {
        const response = await getTasks(currentPage, 10, statusFilter || undefined);
        setTasks(response.items);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, [currentPage, statusFilter]);

  const filteredTasks = tasks.filter((task) => task.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your automation tasks</p>
        </div>
        <Link href="/dashboard/tasks/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> New Task
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-40">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><p className="font-medium text-gray-900">{task.description}</p></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {task.mode === 'excel' ? <FileSpreadsheet className="h-4 w-4 text-green-600" /> : <Database className="h-4 w-4 text-blue-600" />}
                      <span className="capitalize">{task.mode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>{task.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(task.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
