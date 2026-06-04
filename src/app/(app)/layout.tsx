"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Activity, Bell, FileText, Settings, Menu, X, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="fixed top-[15%] left-[20%] w-[400px] h-[400px] bg-slate-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 pointer-events-none" />
      <div className="fixed bottom-[10%] right-[15%] w-[600px] h-[600px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-5 pointer-events-none" />

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-sm"
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
            className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[90px] border-r border-slate-200 bg-slate-50/80 backdrop-blur-xl flex flex-col items-center py-6 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link href="/dashboard" className="mb-8 p-3 text-slate-900 flex flex-col items-center gap-1 group">
          <Rocket size={24} className="group-hover:-translate-y-1 transition-transform" />
        </Link>

        <nav className="flex-1 flex flex-col gap-2 w-full px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive(item.href, item.exact)
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:bg-white/50 hover:text-slate-900'
              }`}
              title={item.title}
            >
              <item.icon size={20} />
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200 w-full px-4 flex flex-col gap-4 items-center">
          <Link
            href="/settings"
            onClick={closeMenu}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isActive('/settings')
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:bg-white/50 hover:text-slate-900'
            }`}
            title="Settings"
          >
            <Settings size={20} />
          </Link>

          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm cursor-pointer">
            S
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 p-6 pt-20 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
