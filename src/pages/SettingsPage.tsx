import React, { useState } from "react";
import { 
  User, 
  Globe, 
  Palette, 
  Shield, 
  Bell, 
  Monitor, 
  Smartphone, 
  HelpCircle,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Languages,
  Paintbrush,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "motion/react";
import { emby } from "../services/emby";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { accent, setAccent, mode, setMode } = useTheme();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const themes = [
    { id: 'rose', color: '#E11D48', label: 'Cinema Red' },
    { id: 'indigo', color: '#4338CA', label: 'Indigo Night' },
    { id: 'emerald', color: '#22C55E', label: 'Deep Emerald' },
    { id: 'amber', color: '#CA8A04', label: 'Golden Hour' },
    { id: 'blue', color: '#3B82F6', label: 'Ocean Blue' },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '简体中文', flag: '🇨🇳' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);
    
    if (newPassword.length < 6) {
      setPasswordError(t('settings.pwd_len_err'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.pwd_match_err'));
      return;
    }
    
    try {
      await emby.updatePassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err) {
      setPasswordError(t('settings.pwd_fail'));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-12 pb-24"
    >
      {/* Hero Header */}
      <div className="relative h-64 rounded-[40px] overflow-hidden flex items-end p-12 group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/40 via-background to-background -z-10" />
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[url('https://picsum.photos/seed/abstract/1200/400')] bg-cover bg-center mix-blend-overlay opacity-20 group-hover:scale-110 transition-transform duration-1000" 
        />
        <div className="space-y-2">
          <motion.h1 
            variants={itemVariants}
            className="text-5xl font-black tracking-tighter uppercase italic"
          >
            {t("menu.settings")}
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-text-tertiary font-medium tracking-widest uppercase text-xs"
          >
            Customize your cinematic experience
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Appearance */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <section className="bg-surface/60 backdrop-blur-2xl rounded-[32px] p-8 border border-border-subtle space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                <Palette size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t("settings.appearance")}</h2>
                <p className="text-sm text-text-tertiary">Personalize the look and feel</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-bold text-text-secondary uppercase tracking-widest">Accent Color</label>
                <div className="flex flex-wrap gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setAccent(theme.id as any)}
                      className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                        accent === theme.id
                          ? "bg-accent-primary/10 border-accent-primary shadow-xl shadow-accent-primary/10"
                          : "bg-surface-container border-transparent hover:bg-surface-container-high"
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-full shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: theme.color }}
                      >
                        {accent === theme.id && <Check size={20} className="text-white" />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                  className="p-6 rounded-2xl bg-surface-container border border-border-subtle hover:bg-surface-container-high transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                      {mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${mode === 'dark' ? 'bg-accent-primary' : 'bg-outline-variant'}`}>
                      <motion.div
                        animate={{ x: mode === 'dark' ? 22 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-3 h-3 bg-on-surface rounded-full"
                      />
                    </div>
                  </div>
                  <h4 className="font-bold">{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</h4>
                  <p className="text-xs text-text-tertiary">{mode === 'dark' ? 'Cinematic dark theme' : 'Bright light theme'}</p>
                </button>
                <div className="p-6 rounded-2xl bg-surface-container border border-border-subtle group cursor-pointer opacity-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                      <Monitor size={20} />
                    </div>
                  </div>
                  <h4 className="font-bold">Glassmorphism</h4>
                  <p className="text-xs text-text-tertiary">Enabled by default</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface/60 backdrop-blur-2xl rounded-[32px] p-8 border border-border-subtle space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t("settings.language")}</h2>
                <p className="text-sm text-text-tertiary">Choose your preferred language</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${
                    i18n.language === lang.code
                      ? "bg-accent-primary/10 border-accent-primary/50"
                      : "bg-surface-container border-transparent hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-bold">{lang.label}</span>
                  </div>
                  {i18n.language === lang.code && <Check size={20} className="text-accent-primary" />}
                </button>
              ))}
            </div>
          </section>
        </motion.div>

        {/* Right Column: Security & Info */}
        <motion.div variants={itemVariants} className="space-y-8">
          <section className="glass-dark rounded-[32px] p-8 border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Account & Security</h3>
            <div className="space-y-2">
              {[
                { icon: Lock, label: t('settings.change_password'), color: "text-rose-500", action: () => setIsChangingPassword(true) },
                { icon: Shield, label: "Privacy Settings", color: "text-emerald-500" },
                { icon: Bell, label: "Notifications", color: "text-amber-500" },
                { icon: Smartphone, label: "Device Management", color: "text-blue-500" },
                { icon: HelpCircle, label: "Support & FAQ", color: "text-purple-500" },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-high transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-text-tertiary group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[32px] p-8 bg-accent-primary/10 border border-accent-primary/20">
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-bold">Obsidian Premium</h3>
              <p className="text-sm text-text-secondary">You are currently enjoying all premium features of Obsidian Cinematic.</p>
              <button className="w-full py-3 rounded-xl bg-accent-primary text-white font-bold text-sm shadow-lg shadow-accent-primary/20 hover:scale-105 transition-transform">
                Manage Subscription
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent-primary/20 blur-3xl rounded-full" />
          </section>

          <div className="text-center space-y-1">
            <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">Obsidian Cinematic v1.0.0</p>
            <p className="text-[10px] text-text-tertiary">Made with ❤️ for cinephiles</p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isChangingPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsChangingPassword(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-surface border border-border-subtle rounded-3xl p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-primary/20 flex items-center justify-center">
                  <Lock size={32} className="text-accent-primary" />
                </div>
                <h2 className="text-2xl font-bold">{t('settings.change_password')}</h2>
                <p className="text-sm text-text-tertiary">{t('settings.new_password')}</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('settings.new_password')}
                    className="w-full bg-surface-container border border-border-subtle rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-accent-primary/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('settings.confirm_password')}
                  className="w-full bg-surface-container border border-border-subtle rounded-xl px-4 py-3 focus:outline-none focus:border-accent-primary/50 transition-colors"
                />

                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-rose-500 text-center"
                  >
                    {passwordError}
                  </motion.p>
                )}

                {passwordSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-emerald-500 text-center"
                  >
                    {t('settings.pwd_success')}
                  </motion.p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1 py-3 rounded-xl bg-surface-container border border-border-subtle font-medium hover:bg-surface-container-high transition-colors"
                >
                  {t("settings.cancel")}
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChangePassword}
                  className="flex-1 py-3 rounded-xl bg-accent-primary text-white font-bold shadow-lg shadow-accent-primary/20 hover:bg-accent-primary/90 transition-colors"
                >
                  {t("settings.confirm")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
