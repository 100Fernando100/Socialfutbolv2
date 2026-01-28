'use client';

import { useState, useEffect } from 'react';
import { getStoredUser } from '@/lib/auth';
import { User } from '@/lib/types';
import { User as UserIcon, Mail, Bell, Shield, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);

  useEffect(() => { setUser(getStoredUser()); }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserIcon className="h-5 w-5 text-gray-400" /> Profile</h2>
        <div className="space-y-4">
          <div><label className="label">Client Name</label><input type="text" value={user?.clientName || ''} className="input bg-gray-50" disabled /></div>
          <div><label className="label">Email</label><input type="email" value={user?.email || ''} className="input bg-gray-50" disabled /></div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-gray-400" /> Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div><p className="font-medium">Email Notifications</p><p className="text-sm text-gray-500">Receive notifications via email</p></div>
            <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="h-5 w-5" />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div><p className="font-medium">Task Alerts</p><p className="text-sm text-gray-500">Get notified on task completion</p></div>
            <input type="checkbox" checked={taskAlerts} onChange={(e) => setTaskAlerts(e.target.checked)} className="h-5 w-5" />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {saved && <span className="flex items-center gap-2 text-green-600"><CheckCircle className="h-4 w-4" /> Saved</span>}
        <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2">
          {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> : <><Save className="h-4 w-4" /> Save</>}
        </button>
      </div>
    </div>
  );
}
