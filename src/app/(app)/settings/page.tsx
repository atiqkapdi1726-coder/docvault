'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useState } from 'react';
import { useAppStore } from '@/lib/stores/appStore';
import { useTheme } from '@/components/ui/ThemeProvider';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, User, Bell, Shield, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAppStore();
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState({
    email: true,
    documentUpdates: true,
    comments: true,
    activityFeed: false,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">Manage your account settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-56 flex-shrink-0">
            <div className="card p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] font-medium'
                      : 'hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Profile</h2>
                  <div className="flex items-center gap-4">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {user?.displayName?.[0] || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user?.displayName}</p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Appearance</h2>
                  <div className="flex items-center justify-between p-4 bg-[rgb(var(--muted))] rounded-lg">
                    <div className="flex items-center gap-3">
                      {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">Toggle dark mode theme</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        darkMode ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--muted))] border border-[rgb(var(--border))]'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  {([
                    { key: 'email', label: 'Email notifications' },
                    { key: 'documentUpdates', label: 'Document updates' },
                    { key: 'comments', label: 'Comments' },
                    { key: 'activityFeed', label: 'Activity feed' },
                  ] as const).map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-[rgb(var(--muted))] rounded-lg">
                      <p className="font-medium text-sm">{label}</p>
                      <button
                        onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          notifications[key] ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--muted))] border border-[rgb(var(--border))]'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            notifications[key] ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Security</h2>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    Manage your password and security settings through Firebase Auth.
                  </p>
                  <div className="p-4 bg-[rgb(var(--muted))] rounded-lg">
                    <p className="font-medium text-sm mb-1">Account Provider</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {user?.email ? 'Email/Password or Google' : 'Not signed in'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
