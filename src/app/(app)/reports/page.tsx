"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function ReportsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Reports</h1>
      <p className="text-slate-500 mb-8">Executive summaries and competitive briefs.</p>
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl shadow-slate-200/40 p-8 text-center text-slate-500">
        Reports will be migrated here.
      </div>
    </motion.div>
  );
}
