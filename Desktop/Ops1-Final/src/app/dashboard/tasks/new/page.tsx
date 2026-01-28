'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { submitTask } from '@/lib/api';
import { TaskMode } from '@/lib/types';
import { FileSpreadsheet, Database, Upload, AlertCircle, CheckCircle, ArrowLeft, Send } from 'lucide-react';

export default function NewTaskPage() {
  const router = useRouter();
  const [mode, setMode] = useState<TaskMode>('excel');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await submitTask({ mode, description, file: file || undefined, sqlQuery: sqlQuery || undefined });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/tasks'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Submitted</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/tasks" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit New Task</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <label className="label mb-3">Task Mode</label>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setMode('excel')} className={`p-4 rounded-lg border-2 ${mode === 'excel' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
              <FileSpreadsheet className={`h-8 w-8 mx-auto mb-2 ${mode === 'excel' ? 'text-primary-600' : 'text-gray-400'}`} />
              <p className="font-medium">Excel</p>
            </button>
            <button type="button" onClick={() => setMode('sql')} className={`p-4 rounded-lg border-2 ${mode === 'sql' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
              <Database className={`h-8 w-8 mx-auto mb-2 ${mode === 'sql' ? 'text-primary-600' : 'text-gray-400'}`} />
              <p className="font-medium">SQL</p>
            </button>
          </div>
        </div>

        <div className="card">
          <label className="label">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[100px]" placeholder="Describe what you want to accomplish..." required />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" /><span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
          {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> : <><Send className="h-4 w-4" /> Submit</>}
        </button>
      </form>
    </div>
  );
}
