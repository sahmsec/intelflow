"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Activity, Bell, FileText, Settings, Menu, X, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ui/ThemeToggle';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, title: 'Overview', exact: true },
  { href: '/competitors', icon: Users, title: 'Competitors' },
  { href: '/insights', icon: Activity, title: 'AI Insights' },
  { href: '/reports', icon: FileText, title: 'Reports' },
  { href: '/alerts', icon: Bell, title: 'Alerts' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#7998db_0%,#cbd6f6_30%,#e5ecf9_55%,#e5ecf9_100%)] dark:bg-[linear-gradient(135deg,#0c051f_0%,#020005_45%,#020005_100%)] text-slate-800 dark:text-slate-100 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm text-slate-700 dark:bg-slate-900/50 dark:border-white/10 dark:text-slate-200"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="md:hidden fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[90px] border-r border-white/20 dark:border-white/5 bg-white/10 dark:bg-slate-950/20 backdrop-blur-2xl flex flex-col items-center pt-4 pb-6 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link href="/dashboard" className="mb-5 p-3 text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1 group">
          <Rocket size={24} className="group-hover:-translate-y-1 transition-transform" />
        </Link>
        
        <nav className="flex-1 flex flex-col gap-2 w-full px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-250 ${
                isActive(item.href, item.exact)
                  ? 'bg-white/70 text-slate-800 border border-white/80 shadow-[0_8px_20px_rgba(31,38,135,0.04)] backdrop-blur-md dark:bg-slate-800/40 dark:text-slate-100 dark:border-white/10 dark:shadow-none'
                  : 'text-slate-700/80 hover:bg-white/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/20 dark:hover:text-slate-200'
              }`}
              title={item.title}
            >
              <item.icon size={20} />
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/20 dark:border-white/10 w-full px-4 flex flex-col gap-4 items-center">
          <ThemeToggle />

          <Link
            href="/settings"
            onClick={closeMenu}
            className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-250 ${
              isActive('/settings')
                ? 'bg-white/70 text-slate-800 border border-white/80 shadow-[0_8px_20px_rgba(31,38,135,0.04)] backdrop-blur-md dark:bg-slate-800/40 dark:text-slate-100 dark:border-white/10 dark:shadow-none'
                : 'text-slate-700/80 hover:bg-white/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/20 dark:hover:text-slate-200'
            }`}
            title="Settings"
          >
            <Settings size={20} />
          </Link>

          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold text-sm shadow-md cursor-pointer border border-white/20 dark:border-white/10">
            S
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 p-6 pt-16 md:pt-6 md:px-8 md:pb-8 lg:pt-8 lg:px-12 lg:pb-12 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
