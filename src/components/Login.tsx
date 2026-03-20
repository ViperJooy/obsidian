"use client";

import React, { useState, useEffect } from "react";
import { emby } from "@/services/emby";
import { motion } from "motion/react";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginProps {
  onLoginSuccess: () => void;
}

interface EmbyUser {
  Id: string;
  Name: string;
  PrimaryImageTag?: string;
  HasPassword: boolean;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [users, setUsers] = useState<EmbyUser[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const publicUsers = await emby.getUsers();
      setUsers(publicUsers.slice(0, 4));
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await emby.authenticate(username, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (user: EmbyUser) => {
    setIsLoading(true);
    setError(null);
    setUsername(user.Name);

    try {
      await emby.authenticate(user.Name, "");
      onLoginSuccess();
    } catch (err: any) {
      console.error("Quick login failed:", err);
      setError(`Quick login failed for ${user.Name}. Please use manual login.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-background">
        <div className="absolute inset-0 grid grid-cols-4 gap-4 p-8 opacity-40 scale-110">
          <div className="space-y-4">
            <img className="rounded-xl w-full h-64 object-cover" alt="Dark cinematic movie poster collage piece" src="/images/login-bg/01-poster-collage.jpg" />
            <img className="rounded-xl w-full h-80 object-cover" alt="Atmospheric film still with purple lighting" src="/images/login-bg/02-purple-lighting.jpg" />
            <img className="rounded-xl w-full h-72 object-cover" alt="Classic cinema reel in monochrome" src="/images/login-bg/03-cinema-reel.jpg" />
          </div>
          
          <div className="space-y-4 pt-12">
            <img className="rounded-xl w-full h-80 object-cover" alt="Neon sci-fi cityscape movie still" src="/images/login-bg/04-scifi-cityscape.jpg" />
            <img className="rounded-xl w-full h-64 object-cover" alt="Abstract purple and blue lighting" src="/images/login-bg/05-abstract-lighting.jpg" />
            <img className="rounded-xl w-full h-96 object-cover" alt="Dramatic silhouette of a film director" src="/images/login-bg/06-film-director.jpg" />
          </div>
          
          <div className="space-y-4 -pt-8">
            <img className="rounded-xl w-full h-72 object-cover" alt="Vintage movie theater popcorn and drink" src="/images/login-bg/07-popcorn-drink.jpg" />
            <img className="rounded-xl w-full h-64 object-cover" alt="Close up of a 35mm film strip" src="/images/login-bg/08-film-strip.jpg" />
            <img className="rounded-xl w-full h-80 object-cover" alt="Cyberpunk character portrait in shadows" src="/images/login-bg/09-cyberpunk.jpg" />
          </div>
          
          <div className="space-y-4 pt-20">
            <img className="rounded-xl w-full h-96 object-cover" alt="Action sequence still with sparks" src="/images/login-bg/10-action-sparks.jpg" />
            <img className="rounded-xl w-full h-72 object-cover" alt="Elegant theater stage curtains" src="/images/login-bg/11-theater-curtains.jpg" />
          </div>
        </div>
        
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent to-surface z-10"
        />
        
        <div className="absolute bottom-16 left-16 z-20">
          <h2 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface mb-2">
            CURATE YOUR<br />UNIVERSE.
          </h2>
          <p className="text-on-surface-variant text-lg max-w-sm">
            Access your entire media collection in obsidian-grade fidelity.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[40%] bg-surface flex flex-col justify-center items-center px-8 sm:px-12 md:px-20 relative">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <span className="font-headline text-3xl font-black tracking-tighter text-primary uppercase">
              OBSIDIAN
            </span>
            <p className="text-on-surface-variant mt-2 text-sm tracking-widest uppercase">
              Media Core
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/50 placeholder:text-outline transition-all"
                  placeholder="Enter your identity"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-12 text-on-surface focus:ring-2 focus:ring-primary/50 placeholder:text-outline transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-none bg-surface-container-high text-primary focus:ring-offset-surface focus:ring-primary transition-all"
                />
                <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-primary-fixed-dim hover:text-primary transition-colors font-medium"
              >
                Forgot Access?
              </a>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-xs font-medium bg-red-400/10 p-3 rounded-xl border border-red-400/20"
              >
                {error}
              </motion.p>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary-fixed font-bold py-4 rounded-full shadow-[0_0_20px_rgba(187,158,255,0.3)] hover:shadow-[0_0_30px_rgba(187,158,255,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin mx-auto" />
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          {users.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                  Quick Access
                </span>
                <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {users.map((user) => (
                  <div
                    key={user.Id}
                    onClick={() => handleQuickLogin(user)}
                    className="group cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="relative">
                      <img
                        className="w-14 h-14 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all p-0.5 opacity-60 group-hover:opacity-100"
                        alt={`User avatar ${user.Name} profile`}
                        src={emby.getUserImageUrl(user.Id, { width: 112, height: 112, tag: user.PrimaryImageTag })}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Name)}&background=BB9EFF&color=000&size=112`;
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary">
                      {user.Name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="absolute bottom-8 w-full flex justify-between px-20 text-[10px] font-bold text-outline-variant uppercase tracking-widest">
          <span>Version 4.8.1.0</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>Server Status: Online</span>
          </div>
        </footer>
      </div>
    </div>
  );
}