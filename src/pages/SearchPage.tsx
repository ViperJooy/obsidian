import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { emby } from "@/services/emby";
import MovieCard from "@/components/MovieCard";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

export default function SearchPage({ onMovieClick }: { onMovieClick: (id: string) => void }) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const urlQuery = searchParams.get("query");
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await emby.search(query);
        setResults(data.Items || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-start pt-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl px-4"
      >
        <h1 className="text-4xl font-bold text-center mb-2 tracking-tight">{t('search.title')}</h1>
        <p className="text-text-tertiary text-center mb-10">{t('search.desc')}</p>
        
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary/20 via-accent-primary/40 to-accent-primary/20 rounded-3xl blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
          
          <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 group-focus-within:border-accent-primary/50 group-focus-within:bg-white/[0.06] group-focus-within:shadow-2xl group-focus-within:shadow-accent-primary/10">
            <div className="pl-6 pr-3 py-4">
              <motion.div
                animate={{ 
                  rotate: isLoading ? 360 : 0,
                  scale: query ? 1.1 : 1
                }}
                transition={{ 
                  rotate: { duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" },
                  scale: { duration: 0.2 }
                }}
              >
                <SearchIcon className="text-text-tertiary group-focus-within:text-accent-primary transition-colors" size={24} />
              </motion.div>
            </div>
            
            <input 
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent py-5 pr-6 text-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none"
            />
            
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setQuery("")}
                className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>
          
          {query && !isLoading && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-text-tertiary text-center mt-4"
            >
              {t('search.press_enter')}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Results */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-6xl mt-12 px-4"
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="text-accent-primary" size={48} />
            </motion.div>
          </div>
        ) : results.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-tertiary">
                {t("search.found")} <span className="text-accent-primary font-semibold">{results.length}</span> {t("search.results")}
              </p>
              <p className="text-sm text-text-tertiary">
                {t('search.query')} <span className="text-text-primary">"{query}"</span>
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((item, index) => (
                <motion.div
                  key={item.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <MovieCard item={item} onClick={onMovieClick} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : query.trim() ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-64 flex flex-col items-center justify-center text-text-tertiary gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <SearchIcon size={32} className="opacity-30" />
            </div>
            <p className="text-lg">{t('search.no_results')} "{query}"</p>
            <p className="text-sm text-text-tertiary/60">{t('search.try_diff')}</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-64 flex flex-col items-center justify-center text-text-tertiary gap-4"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 flex items-center justify-center"
            >
              <SearchIcon size={40} className="text-accent-primary/50" />
            </motion.div>
            <p className="text-lg">{t('search.start')}</p>
            <p className="text-sm text-text-tertiary/60">{t('search.start_desc')}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {((t('search.tags', { returnObjects: true }) as string[]) || []).map((tag) => (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuery(tag)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-text-tertiary hover:text-white hover:bg-white/10 hover:border-accent-primary/30 transition-all"
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
