"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Globe, Palette, LogOut, UserPlus, ChevronDown, Settings, Search, ArrowLeft, Sun, Moon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { emby } from "../services/emby";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "motion/react";
import ConfirmModal from "./ConfirmModal";

type ModalType = 'logout' | 'switchAccount' | null;

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { isSidebarCollapsed, accent, setAccent, mode, setMode } = useTheme();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const isHomePage = location.pathname === "/";

  const colors = [
    { name: "Cinema Red", value: "rose" },
    { name: "Indigo Night", value: "indigo" },
    { name: "Emerald", value: "emerald" },
    { name: "Golden Hour", value: "amber" },
    { name: "Ocean Blue", value: "blue" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await emby.getItem(emby.userId!);
        setUserInfo(user);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    if (emby.userId) fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmAction = () => {
    emby.logout();
    window.location.reload();
  };

  const openLogoutModal = () => {
    setIsMenuOpen(false);
    setActiveModal('logout');
  };

  const openSwitchAccountModal = () => {
    setIsMenuOpen(false);
    setActiveModal('switchAccount');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 h-20 z-40 px-10 flex items-center justify-between bg-gradient-to-b from-background to-transparent backdrop-blur-sm transition-all duration-500 ${
          isSidebarCollapsed ? "left-24" : "left-64"
        }`}
      >
        <div className="flex items-center">
          {!isHomePage && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-all text-text-secondary hover:text-on-surface"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles..."
              className="bg-surface-container-high border-none rounded-lg pl-10 pr-4 py-2 w-64 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary transition-all"
            />
          </form>

          <div ref={langMenuRef} className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-all text-text-secondary hover:text-on-surface"
            >
              <Globe size={18} />
              <span className="text-xs font-medium">{i18n.language === "en" ? "English" : "中文"}</span>
              <ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1 w-32 bg-surface border border-border-subtle rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <button
                    onClick={() => { i18n.changeLanguage("zh"); setIsLangMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-container-high transition-colors ${i18n.language === "zh" ? "text-accent-primary bg-accent-primary/10" : ""}`}
                  >
                    中文
                  </button>
                  <button
                    onClick={() => { i18n.changeLanguage("en"); setIsLangMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-container-high transition-colors ${i18n.language === "en" ? "text-accent-primary bg-accent-primary/10" : ""}`}
                  >
                    English
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 pl-4 border-l border-border-subtle group"
            >
              <div className="text-right">
                <p className="text-sm font-semibold">{userInfo?.Name || "Guest"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container border border-border-subtle flex items-center justify-center overflow-hidden transition-all hover:border-accent-primary/50">
                {userInfo?.PrimaryImageTag ? (
                  <img
                    src={emby.getItemImageUrl(userInfo.Id, 'Primary', { width: 80, height: 80 })}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-text-secondary" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-surface/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-border-subtle">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {mode === 'dark' ? <Moon size={16} className="text-text-tertiary" /> : <Sun size={16} className="text-text-tertiary" />}
                        <span className="text-xs text-text-tertiary uppercase tracking-wider font-medium">{t('topbar.theme_mode')}</span>
                      </div>
                      <button
                        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                        className="relative w-12 h-6 rounded-full bg-surface-container-high transition-colors duration-300"
                      >
                        <motion.div
                          animate={{ x: mode === 'dark' ? 2 : 26 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-accent-primary flex items-center justify-center shadow-sm"
                        >
                          {mode === 'dark' ? <Moon size={10} className="text-white" /> : <Sun size={10} className="text-white" />}
                        </motion.div>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border-b border-border-subtle">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette size={16} className="text-text-tertiary" />
                      <span className="text-xs text-text-tertiary uppercase tracking-wider font-medium">Accent Color</span>
                    </div>
                    <div className="flex gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setAccent(color.value as any)}
                          className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                            accent === color.value
                              ? "ring-2 ring-white ring-offset-2 ring-offset-surface scale-110"
                              : "hover:scale-110 opacity-70 hover:opacity-100"
                          }`}
                          style={{
                            backgroundColor:
                              color.value === "rose" ? "#E11D48" :
                              color.value === "indigo" ? "#4338CA" :
                              color.value === "emerald" ? "#22C55E" :
                              color.value === "amber" ? "#CA8A04" :
                              "#3B82F6"
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => { navigate('/settings'); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface-container-high hover:text-on-surface transition-all"
                    >
                      <Settings size={18} />
                      <span className="text-sm">{t('topbar.settings')}</span>
                    </button>
                    <button
                      onClick={openSwitchAccountModal}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-surface-container-high hover:text-on-surface transition-all"
                    >
                      <UserPlus size={18} />
                      <span className="text-sm">{t('topbar.switch_account')}</span>
                    </button>
                    <button
                      onClick={openLogoutModal}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
                    >
                      <LogOut size={18} />
                      <span className="text-sm">{t('topbar.logout')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={activeModal === 'logout'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirmAction}
        title={t('modal.confirm_logout')}
        message={t('modal.logout_msg')}
        confirmText={t('menu.logout')}
      />

      <ConfirmModal
        isOpen={activeModal === 'switchAccount'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirmAction}
        title={t('modal.switch_account')}
        message={t('modal.switch_msg')}
        confirmText={t('topbar.switch_account')}
        variant="primary"
      />
    </>
  );
}