"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function ReportsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 font-sans mb-1">Reports</h1>
        <p className="text-slate-700/80 font-medium">Executive summaries and competitive briefs.</p>
      </div>
      <div className="glass-card p-12 text-center text-slate-650 font-bold shadow-sm">
        Reports will be migrated here.
      </div>
    </motion.div>
  );
}
