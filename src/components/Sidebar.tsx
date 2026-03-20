import React, { useState, useEffect, memo } from "react";
import { 
  Home, 
  Film, 
  Tv, 
  Music, 
  Library, 
  Search, 
  Settings, 
  LogOut,
  ChevronRight,
  Radio,
  ChevronLeft,
  Video,
  Folder
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { emby } from "../services/emby";
import ConfirmModal from "./ConfirmModal";

interface SidebarProps {
  onLogout: () => void;
}

interface ViewItem {
  Id: string;
  Name: string;
  CollectionType?: string;
  ImageTags?: any;
}

interface MenuItemData {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  path: string;
  id?: string;
}

const getIconForCollectionType = (collectionType?: string) => {
  switch (collectionType) {
    case 'movies':
      return Film;
    case 'tvshows':
      return Tv;
    case 'music':
      return Music;
    case 'livetv':
    case 'channels':
      return Radio;
    case 'playlists':
      return Library;
    case 'boxsets':
      return Folder;
    default:
      return Video;
  }
};

const getRouteForCollectionType = (collectionType?: string, id?: string) => {
  if (id) {
    return `/library/${id}`;
  }
  switch (collectionType) {
    case 'movies':
      return '/movies';
    case 'tvshows':
      return '/series';
    case 'music':
      return '/music';
    case 'livetv':
    case 'channels':
      return '/livetv';
    default:
      return '/collections';
  }
};

const sidebarTransition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const };

const MenuItem = memo(({ 
  item, 
  isActive, 
  isCollapsed
}: { 
  item: MenuItemData; 
  isActive: boolean;
  isCollapsed: boolean;
}) => (
  <Link
    to={item.path}
    className="w-full flex items-center px-4 py-3 rounded-xl group relative overflow-hidden"
  >
    <motion.div 
      animate={{ 
        scale: isCollapsed ? 1.1 : 1,
        x: isCollapsed ? 8 : 0
      }}
      transition={sidebarTransition}
      className={`flex-shrink-0 transition-colors duration-200 group-hover:text-on-surface ${isActive ? 'text-accent-primary' : 'text-text-tertiary'}`}
    >
      <item.icon size={20} />
    </motion.div>
    
    <motion.span 
      animate={{ 
        opacity: isCollapsed ? 0 : 1,
        width: isCollapsed ? 0 : "auto",
        marginLeft: isCollapsed ? 0 : 12
      }}
      transition={sidebarTransition}
      className="text-sm font-medium whitespace-nowrap overflow-hidden"
    >
      {item.label}
    </motion.span>

    {isActive && (
      <motion.div 
        layoutId="active-pill"
        className="absolute inset-0 bg-accent-primary/10 border border-accent-primary/20 rounded-xl -z-10"
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      />
    )}
    
    {isActive && isCollapsed && (
      <motion.div 
        layoutId="active-dot"
        className="absolute left-0 w-1 h-6 bg-accent-primary rounded-r-full"
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      />
    )}
  </Link>
));

MenuItem.displayName = 'MenuItem';

export default function Sidebar({ onLogout }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useTheme();
  const [views, setViews] = useState<ViewItem[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const data = await emby.getViews();
        setViews(data || []);
      } catch (err) {
        console.error("Failed to fetch views:", err);
      }
    };
    if (emby.isAuthenticated) {
      fetchViews();
    }
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const dynamicMenuItems: MenuItemData[] = views.map(view => ({
    icon: getIconForCollectionType(view.CollectionType),
    label: view.Name,
    path: getRouteForCollectionType(view.CollectionType, view.Id),
    id: view.Id,
  }));

  const fixedMenuItems: MenuItemData[] = [
    { icon: Home, label: t("menu.home"), path: "/" },
  ];

  const bottomMenuItems: MenuItemData[] = [
    { icon: Search, label: t("menu.search"), path: "/search" },
    { icon: Settings, label: t("menu.settings"), path: "/settings" },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarCollapsed ? 96 : 256 }}
      transition={sidebarTransition}
      className="fixed left-0 top-0 bottom-0 bg-surface/80 backdrop-blur-2xl border-r border-border-subtle flex flex-col z-50 overflow-hidden"
    >
      <div className="p-6 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3 group cursor-pointer overflow-hidden"
          onClick={() => navigate('/')}
        >
          <motion.div 
            animate={{ 
              scale: isSidebarCollapsed ? 1 : 1,
              x: isSidebarCollapsed ? 8 : 0
            }}
            transition={sidebarTransition}
            className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center shadow-lg shadow-accent-primary/20 flex-shrink-0"
          >
            <div className="w-4 h-4 bg-background rounded-sm rotate-45" />
          </motion.div>
          <motion.span 
            animate={{ 
              opacity: isSidebarCollapsed ? 0 : 1, 
              width: isSidebarCollapsed ? 0 : "auto"
            }}
            transition={sidebarTransition}
            className="text-xl font-black tracking-tighter uppercase whitespace-nowrap overflow-hidden"
          >
            Obsidian
          </motion.span>
        </motion.div>
        
        <motion.button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container text-text-secondary hover:bg-surface-container-high hover:text-on-surface flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </motion.button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto no-scrollbar">
        {fixedMenuItems.map((item) => (
          <MenuItem 
            key={item.path} 
            item={item} 
            isActive={location.pathname === item.path}
            isCollapsed={isSidebarCollapsed}
          />
        ))}

        <div className="py-2 px-4">
          <div className="h-px bg-border-subtle" />
        </div>

        {dynamicMenuItems.map((item) => (
          <MenuItem 
            key={item.id || item.path} 
            item={item} 
            isActive={location.pathname === item.path}
            isCollapsed={isSidebarCollapsed}
          />
        ))}

        <div className="py-2 px-4">
          <div className="h-px bg-border-subtle" />
        </div>

        {bottomMenuItems.map((item) => (
          <MenuItem 
            key={item.path} 
            item={item} 
            isActive={location.pathname === item.path}
            isCollapsed={isSidebarCollapsed}
          />
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <motion.button 
          onClick={handleLogoutClick}
          className="w-full flex items-center px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 group overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div 
            animate={{ 
              scale: isSidebarCollapsed ? 1.1 : 1,
              x: isSidebarCollapsed ? 8 : 0
            }}
            transition={sidebarTransition}
            className="flex-shrink-0"
          >
            <LogOut size={20} />
          </motion.div>
          <motion.span 
            animate={{ 
              opacity: isSidebarCollapsed ? 0 : 1,
              width: isSidebarCollapsed ? 0 : "auto",
              marginLeft: isSidebarCollapsed ? 0 : 12
            }}
            transition={sidebarTransition}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {t("menu.logout")}
          </motion.span>
        </motion.button>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title={t('modal.confirm_logout')}
        message={t('modal.logout_msg')}
        confirmText={t('menu.logout')}
      />
    </motion.aside>
  );
}
