import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { emby } from "@/services/emby";
import MovieCard from "@/components/MovieCard";
import { Loader2, Filter, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

interface LibraryPageProps {
  onMovieClick: (id: string) => void;
  onPlay?: (id: string) => void;
}

// 全局缓存 - 按 id-sortBy-sortOrder 缓存
const cache = new Map<string, { items: any[]; libraryInfo: any }>();

// Session storage key prefix
const STORAGE_KEY_PREFIX = 'library-';

// Get initial values from sessionStorage
const getInitialSortBy = (libraryId?: string) => {
  if (typeof window !== 'undefined' && libraryId) {
    return sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${libraryId}-sortBy`) || "SortName";
  }
  return "SortName";
};

const getInitialSortOrder = (libraryId?: string): "Ascending" | "Descending" => {
  if (typeof window !== 'undefined' && libraryId) {
    const stored = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${libraryId}-sortOrder`);
    if (stored === "Ascending" || stored === "Descending") {
      return stored;
    }
  }
  return "Ascending";
};

export default function LibraryPage({ onMovieClick, onPlay }: LibraryPageProps) {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [libraryInfo, setLibraryInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState(() => getInitialSortBy(id));
  const [sortOrder, setSortOrder] = useState<"Ascending" | "Descending">(() => getInitialSortOrder(id));
  const [isSortByOpen, setIsSortByOpen] = useState(false);
  const [isSortOrderOpen, setIsSortOrderOpen] = useState(false);
  const sortByRef = useRef<HTMLDivElement>(null);
  const sortOrderRef = useRef<HTMLDivElement>(null);

  // Save sort state to sessionStorage
  useEffect(() => {
    if (id) {
      sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${id}-sortBy`, sortBy);
      sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${id}-sortOrder`, sortOrder);
    }
  }, [id, sortBy, sortOrder]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      // 检查缓存
      const cacheKey = `${id}-${sortBy}-${sortOrder}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log("Using cached data for:", cacheKey);
        setItems(cached.items);
        setLibraryInfo(cached.libraryInfo);
        setIsLoading(false);
        return;
      }
      
      console.log("Fetching new data for:", cacheKey);
      setIsLoading(true);
      try {
        const info = await emby.getItem(id);
        setLibraryInfo(info);
        
        const collectionType = info.CollectionType;
        let includeItemTypes = 'Movie';
        
        if (collectionType === 'tvshows') {
          includeItemTypes = 'Series';
        } else if (collectionType === 'music') {
          includeItemTypes = 'MusicAlbum';
        } else if (collectionType === 'boxsets') {
          includeItemTypes = 'BoxSet';
        }
        
        const data = await emby.getItems({
          ParentId: id,
          IncludeItemTypes: includeItemTypes,
          SortBy: sortBy,
          SortOrder: sortOrder,
          Limit: 100
        });
        
        const newItems = data.Items || [];
        setItems(newItems);
        
        // 存入缓存
        cache.set(cacheKey, { items: newItems, libraryInfo: info });
      } catch (err) {
        console.error("Failed to fetch library data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, sortBy, sortOrder]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortByRef.current && !sortByRef.current.contains(event.target as Node)) {
        setIsSortByOpen(false);
      }
      if (sortOrderRef.current && !sortOrderRef.current.contains(event.target as Node)) {
        setIsSortOrderOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{libraryInfo?.Name || "Library"}</h1>
        <p className="text-text-tertiary">{items.length} items</p>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div ref={sortByRef} className="relative">
          <button
            onClick={() => setIsSortByOpen(!isSortByOpen)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm hover:bg-white/10 transition-colors cursor-pointer min-w-[140px]"
          >
            <span>
              {sortBy === "SortName" ? t('sort.name') : 
               sortBy === "DateCreated" ? t('sort.date_added') : 
               sortBy === "ProductionYear" ? t('sort.year') : t('sort.rating')}
            </span>
            <ChevronDown size={14} className={`ml-auto transition-transform ${isSortByOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isSortByOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 w-full bg-surface border border-white/10 rounded-lg shadow-xl overflow-hidden z-10"
              >
                <button
                  onClick={() => { setSortBy("SortName"); setIsSortByOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors ${sortBy === "SortName" ? "text-accent-primary bg-accent-primary/10" : ""}`}
                >
                  {t("sort.name")}
                </button>
                <button
                  onClick={() => { setSortBy("DateCreated"); setIsSortByOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors ${sortBy === "DateCreated" ? "text-accent-primary bg-accent-primary/10" : ""}`}
                >
                  {t("sort.date_added")}
                </button>
                <button
                  onClick={() => { setSortBy("ProductionYear"); setIsSortByOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors ${sortBy === "ProductionYear" ? "text-accent-primary bg-accent-primary/10" : ""}`}
                >
                  {t("sort.year")}
                </button>
                <button
                  onClick={() => { setSortBy("CommunityRating"); setIsSortByOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors ${sortBy === "CommunityRating" ? "text-accent-primary bg-accent-primary/10" : ""}`}
                >
                  {t("sort.rating")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Sort Order Dropdown */}
        <div ref={sortOrderRef} className="relative">
          <button
            onClick={() => setIsSortOrderOpen(!isSortOrderOpen)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm hover:bg-white/10 transition-colors cursor-pointer min-w-[120px]"
          >
            {sortOrder === "Ascending" ? (
              <>
                <ArrowUp size={16} />
                <span>{t('sort.asc')}</span>
              </>
            ) : (
              <>
                <ArrowDown size={16} />
                <span>{t('sort.desc')}</span>
              </>
            )}
            <ChevronDown size={14} className={`ml-auto transition-transform ${isSortOrderOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isSortOrderOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 w-full bg-surface border border-white/10 rounded-lg shadow-xl overflow-hidden z-10"
              >
                <button
                  onClick={() => { setSortOrder("Ascending"); setIsSortOrderOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors ${sortOrder === "Ascending" ? "text-accent-primary bg-accent-primary/10" : ""}`}
                >
                  <ArrowUp size={16} />
                  <span>{t('sort.asc')}</span>
                </button>
                <button
                  onClick={() => { setSortOrder("Descending"); setIsSortOrderOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors ${sortOrder === "Descending" ? "text-accent-primary bg-accent-primary/10" : ""}`}
                >
                  <ArrowDown size={16} />
                  <span>{t('sort.desc')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
      >
        {items.map((item) => (
          <MovieCard key={item.Id} item={item} onClick={onMovieClick} onPlay={onPlay} />
        ))}
      </motion.div>

      {items.length === 0 && (
        <div className="h-64 flex flex-col items-center justify-center text-text-tertiary">
          <Filter size={48} className="mb-4 opacity-20" />
          <p>No items found in this library</p>
        </div>
      )}
    </div>
  );
}
