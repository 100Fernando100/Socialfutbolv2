'use client';

import { useEffect, useState } from 'react';
import { getConfiguration } from '@/lib/api';
import { ClientConfiguration } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Cog, FileText, CheckCircle, Clock, ChevronDown, ChevronRight, Database, Shield } from 'lucide-react';

export default function ConfigurationPage() {
  const [config, setConfig] = useState<ClientConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Data Access', 'Security']));

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getConfiguration();
        setConfig(data);
      } catch (error) {
        console.error('Failed to load config:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const toggleCategory = (cat: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(cat)) newSet.delete(cat);
    else newSet.add(cat);
    setExpandedCategories(newSet);
  };

  const rulesByCategory = config?.rules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, typeof config.rules>) || {};

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuration Rules</h1>
        <p className="text-gray-500 mt-1">Compliance rules extracted from your PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card"><div className="flex items-center gap-4"><div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center"><FileText className="h-5 w-5 text-primary-600" /></div><div><p className="text-sm text-gray-500">Source</p><p className="font-medium">{config?.pdfSource || 'N/A'}</p></div></div></div>
        <div className="card"><div className="flex items-center gap-4"><div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-gray-500">Rules</p><p className="font-medium">{config?.rules.length || 0}</p></div></div></div>
        <div className="card"><div className="flex items-center gap-4"><div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center"><Clock className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-gray-500">Updated</p><p className="font-medium">{config?.lastUpdated ? formatDateTime(config.lastUpdated) : 'Never'}</p></div></div></div>
      </div>

      <div className="space-y-4">
        {Object.entries(rulesByCategory).map(([category, rules]) => (
          <div key={category} className="card p-0 overflow-hidden">
            <button onClick={() => toggleCategory(category)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {category.toLowerCase().includes('security') ? <Shield className="h-5 w-5" /> : <Database className="h-5 w-5" />}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">{category}</h3>
                  <p className="text-sm text-gray-500">{rules.length} rules</p>
                </div>
              </div>
              {expandedCategories.has(category) ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
            </button>
            {expandedCategories.has(category) && (
              <div className="border-t">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                    <p className="text-gray-900">{rule.rule}</p>
                    <p className="text-sm text-gray-500 mt-1">Source: {rule.source}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
