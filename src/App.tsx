import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import MovieGrid from './components/MovieGrid';
import HomePage from './components/HomePage';
import WatchPage from './pages/WatchPage';
import MoviesPage from './pages/MoviesPage';
import SeriesPage from './pages/SeriesPage';
import MusicPage from './pages/MusicPage';
import CollectionsPage from './pages/CollectionsPage';
import SearchPage from './pages/SearchPage';
import LiveTvPage from './pages/LiveTvPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import SettingsPage from './pages/SettingsPage';
import LibraryPage from './pages/LibraryPage';
import Login from './components/Login';
import { emby } from './services/emby';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './i18n';

// Wrapper to fix the ID passing in Routes
function ItemDetailsWrapper({ onBack, onWatch }: { onBack: () => void, onWatch: (id: string) => void }) {
  const { id } = useParams();
  return <ItemDetailsPage itemId={id!} onBack={onBack} onWatch={onWatch} />;
}

function WatchWrapper({ onBack }: { onBack: () => void }) {
  const { id } = useParams();
  return <WatchPage itemId={id!} onBack={onBack} />;
}

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarCollapsed } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(emby.isAuthenticated);

  const handleWatch = (id: string) => {
    navigate(`/watch/${id}`);
  };

  const handleItemClick = (id: string) => {
    navigate(`/details/${id}`);
  };

  const handleLogout = () => {
    emby.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const isWatchPage = location.pathname.startsWith('/watch/');

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-accent-primary/30 overflow-x-hidden">
      {!isWatchPage && <Sidebar onLogout={handleLogout} />}
      {!isWatchPage && <TopBar />}
      
      <AnimatePresence mode="wait">
        {!isWatchPage ? (
          <motion.div
            key="main-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <main className={`transition-all duration-700 ease-[0.22, 1, 0.36, 1] pt-20 min-h-screen flex flex-col ${isSidebarCollapsed ? "pl-24" : "pl-64"}`}>
              <div className="px-10 py-8 flex-1 flex flex-col">
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={location.pathname}
                      initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -30, scale: 0.96, filter: "blur(8px)" }}
                      transition={{ 
                        duration: 0.4, 
                        ease: [0.25, 0.46, 0.45, 0.94],
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.35 },
                        filter: { duration: 0.3 }
                      }}
                    >
                    <Routes location={location}>
                      <Route path="/" element={
                        <HomePage onWatch={handleWatch} onItemClick={handleItemClick} />
                      } />
                      <Route path="/movies" element={<MoviesPage onMovieClick={handleItemClick} onPlay={handleWatch} />} />
                      <Route path="/series" element={<SeriesPage onMovieClick={handleItemClick} onPlay={handleWatch} />} />
                      <Route path="/music" element={<MusicPage onMovieClick={handleItemClick} />} />
                      <Route path="/collections" element={<CollectionsPage onMovieClick={handleItemClick} />} />
                      <Route path="/search" element={<SearchPage onMovieClick={handleItemClick} />} />
                      <Route path="/livetv" element={<LiveTvPage onChannelClick={handleWatch} />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/library/:id" element={<LibraryPage onMovieClick={handleItemClick} onPlay={handleWatch} />} />
                      <Route path="/details/:id" element={<ItemDetailsWrapper onBack={() => navigate(-1)} onWatch={handleWatch} />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <footer className="mt-24 pb-12 border-t border-border-subtle pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-accent-primary rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-background rounded-sm rotate-45" />
                    </div>
                    <span className="text-lg font-bold tracking-tighter uppercase">Obsidian</span>
                  </div>
                  <p className="text-xs text-text-tertiary">© 2026 Obsidian Cinematic. Powered by Emby.</p>
                </footer>
              </div>
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="watch-layout"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              <Route path="/watch/:id" element={<WatchWrapper onBack={() => navigate(-1)} />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decorative Glows */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-accent-primary/5 blur-[120px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-accent-gold/5 blur-[100px] rounded-full -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none" />
    </div>
  );
}

// Need to import useParams
export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <MainApp />
      </Router>
    </ThemeProvider>
  );
}

