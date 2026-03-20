import React, { useEffect, useState, useRef } from "react";
import { emby } from "@/services/emby";
import MovieCard from "@/components/MovieCard";
import { Loader2, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

// 简单的内存缓存
const cache = new Map<string, any[]>();

// Session storage keys
const STORAGE_KEY_SORT_BY = 'series-sortBy';
const STORAGE_KEY_SORT_ORDER = 'series-sortOrder';

// Get initial values from sessionStorage
const getInitialSortBy = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(STORAGE_KEY_SORT_BY) || "SortName";
  }
  return "SortName";
};

const getInitialSortOrder = (): "Ascending" | "Descending" => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(STORAGE_KEY_SORT_ORDER);
    if (stored === "Ascending" || stored === "Descending") {
      return stored;
    }
  }
  return "Ascending";
};

export default function SeriesPage({ onMovieClick, onPlay }: { onMovieClick: (id: string) => void; onPlay?: (id: string) => void }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState(getInitialSortBy);
  const [sortOrder, setSortOrder] = useState<"Ascending" | "Descending">(getInitialSortOrder);
  const [isSortByOpen, setIsSortByOpen] = useState(false);
  const [isSortOrderOpen, setIsSortOrderOpen] = useState(false);
  const sortByRef = useRef<HTMLDivElement>(null);
  const sortOrderRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Save sort state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_SORT_BY, sortBy);
    sessionStorage.setItem(STORAGE_KEY_SORT_ORDER, sortOrder);
  }, [sortBy, sortOrder]);

  useEffect(() => {
    const fetchSeries = async () => {
      const cacheKey = `${sortBy}-${sortOrder}`;
      const cached = cache.get(cacheKey);
      if (cached && hasLoadedRef.current) {
        setItems(cached);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await emby.getItems({ 
          IncludeItemTypes: 'Series', 
          SortBy: sortBy,
          SortOrder: sortOrder,
          Limit: 50 
        });
        const newItems = data.Items || [];
        setItems(newItems);
        cache.set(cacheKey, newItems);
        hasLoadedRef.current = true;
      } catch (err) {
        console.error("Failed to fetch series:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, [sortBy, sortOrder]);

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{t('library.series')}</h1>
          <p className="text-text-secondary">{t('library.series_desc')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div ref={sortByRef} className="relative">
            <button
              onClick={() => setIsSortByOpen(!isSortByOpen)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer min-w-[140px]"
            >
              <span>
                {sortBy === "SortName" ? t('sort.name') : 
                 sortBy === "PremiereDate" ? t('sort.premiere_date') : t('sort.rating')}
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
                    onClick={() => { setSortBy("PremiereDate"); setIsSortByOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors ${sortBy === "PremiereDate" ? "text-accent-primary bg-accent-primary/10" : ""}`}
                  >
                    {t("sort.premiere_date")}
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
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer min-w-[120px]"
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
                  className="absolute top-full right-0 mt-1 w-full bg-surface border border-white/10 rounded-lg shadow-xl overflow-hidden z-10"
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
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="animate-spin text-accent-primary" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {items.map((item) => (
            <MovieCard key={item.Id} item={item} onClick={onMovieClick} onPlay={onPlay} />
          ))}
        </div>
      )}
    </div>
  );
}
