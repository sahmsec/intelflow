"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from '@/lib/auth-client';
import IntelFlowLogo from '@/components/ui/IntelFlowLogo';
import { Card } from '@/components/ui/card';
import { Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Sign In
        const { error: signInErr } = await authClient.signIn.email({
          email,
          password,
          callbackURL: '/dashboard',
        });
        if (signInErr) {
          setError(signInErr.message || 'Invalid email or password');
        } else {
          router.push('/dashboard');
        }
      } else {
        // Sign Up
        const { error: signUpErr } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: '/dashboard',
        });
        if (signUpErr) {
          setError(signUpErr.message || 'Failed to create account');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#7998db_0%,#cbd6f6_50%,#e5ecf9_75%,#e5ecf9_100%)] dark:bg-[linear-gradient(135deg,#2d124d_0%,#120524_50%,#07010f_75%,#07010f_100%)] p-4 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-white/20 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm backdrop-blur-md mb-4">
            <IntelFlowLogo size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            IntelFlow Pro
          </h1>
          <p className="text-sm font-semibold text-slate-650 dark:text-slate-400 mt-1.5">
            AI-powered Competitor Intelligence
          </p>
        </div>

        <Card className="glass-card p-8 border-none shadow-[0_20px_50px_-12px_rgba(30,41,59,0.08)] relative overflow-hidden">
          {/* Form Tabs */}
          <div className="flex bg-white/30 dark:bg-slate-950/40 p-1 rounded-2xl border border-white/50 dark:border-white/5 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isLogin
                  ? 'bg-white text-slate-950 shadow-md dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isLogin
                  ? 'bg-white text-slate-950 shadow-md dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'signin' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 15 : -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {error && (
                <div className="p-3 text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl">
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4.5 py-3 rounded-2xl bg-white/20 dark:bg-slate-950/20 border border-white/50 dark:border-white/5 text-sm font-semibold text-slate-850 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white/45 dark:focus:bg-slate-950/40 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4.5 py-3 rounded-2xl bg-white/20 dark:bg-slate-950/20 border border-white/50 dark:border-white/5 text-sm font-semibold text-slate-850 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white/45 dark:focus:bg-slate-950/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4.5 py-3 rounded-2xl bg-white/20 dark:bg-slate-950/20 border border-white/50 dark:border-white/5 text-sm font-semibold text-slate-850 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white/45 dark:focus:bg-slate-950/40 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <div className="flex-1 border-t border-slate-500/20" />
            <span className="mx-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 border-t border-slate-500/20" />
          </div>

          {/* Social login buttons */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-white/40 dark:bg-slate-950/40 hover:bg-white/60 dark:hover:bg-slate-950/60 text-slate-800 dark:text-white rounded-2xl text-xs font-bold border border-white/60 dark:border-white/5 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.27 2.705 1.34 6.66l3.926 3.105z"
              />
              <path
                fill="#4285F4"
                d="M24 12.273c0-.818-.073-1.609-.209-2.373H12v4.51h6.727a5.753 5.753 0 0 1-2.49 3.773l3.605 3.59c2.109-1.945 3.327-4.8 3.327-8.155z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.955-1.073 7.945-2.91l-3.605-3.59c-.99.664-2.264 1.064-3.79 1.064-2.91 0-5.382-1.964-6.264-4.609L1.33 17.027A11.995 11.995 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.736 13.955a7.16 7.16 0 0 1 0-4.364L1.33 6.486A11.967 11.967 0 0 0 0 12c0 1.94.464 3.782 1.282 5.418l4.454-3.463z"
              />
            </svg>
            <span>Google</span>
          </button>
        </Card>
      </motion.div>
    </div>
  );
}
