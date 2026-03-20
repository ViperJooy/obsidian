"use client";

import React, { useEffect, useState } from "react";
import { Play, Loader2, ChevronRight } from "lucide-react";
import { emby } from "@/services/emby";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

function formatRemainingTime(ticks?: number): string {
  if (!ticks) return "";
  const totalMinutes = Math.floor(ticks / 10000000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

function getEpisodeInfo(item: any): string {
  if (item.Type === "Episode") {
    const season = item.ParentIndexNumber || "";
    const episode = item.IndexNumber || "";
    if (season && episode) {
      return `S${season} : E${episode}`;
    }
  }
  return "";
}

export default function ContinueWatching({ onWatch }: { onWatch: (id: string) => void }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResumeItems = async () => {
      try {
        const data = await emby.getResumeItems(12);
        console.log("Resume items:", data);
        setItems(data || []);
      } catch (err) {
        console.error("Failed to fetch resume items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (emby.isAuthenticated) {
      fetchResumeItems();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Continue Watching
          </h2>
        </div>
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-accent-primary" size={32} />
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Continue Watching
          </h2>
        </div>
        <div className="flex items-center justify-center h-40 bg-surface-container/50 rounded-xl border border-outline-variant/20">
          <div className="text-center">
            <p className="text-on-surface-variant text-sm">No items to continue watching</p>
            <p className="text-outline text-xs mt-1">Start watching something and it will appear here</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Continue Watching
        </h2>
        <button 
          onClick={() => navigate('/collections')}
          className="flex items-center gap-2 text-sm font-bold text-accent-primary hover:text-accent-primary/80 transition-colors group"
        >
          View All
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const imageUrl = emby.getItemImageUrl(item.Id, "Thumb", { width: 640 });
            const fallbackUrl = emby.getItemImageUrl(item.Id, "Backdrop", { width: 640 });
            const userData = item.UserData || {};
            const progress = userData.PlayedPercentage || 0;

            const remainingTicks = (item.RunTimeTicks || 0) - (userData.PlaybackPositionTicks || 0);
            const remainingText = formatRemainingTime(remainingTicks);
            const episodeInfo = getEpisodeInfo(item);

            return (
              <motion.div
                key={item.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => onWatch(item.Id)}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-surface border border-border-subtle transition-all duration-300 group-hover:border-accent-primary/30 group-hover:shadow-lg group-hover:shadow-accent-primary/10">
                  <img
                    src={imageUrl}
                    alt={item.Name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackUrl;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-14 h-14 rounded-full bg-accent-primary/90 backdrop-blur-sm flex items-center justify-center border border-outline-variant/30 shadow-lg shadow-accent-primary/30"
                    >
                      <Play size={24} fill="white" className="text-white ml-1" />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-outline-variant/30">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-dim shadow-[0_0_8px_rgba(187,158,255,0.5)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="px-1 space-y-1">
                  <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{item.Name}</h4>
                  <p className="text-xs text-on-surface-variant">
                    {episodeInfo && <span className="text-primary">{episodeInfo}</span>}
                    {episodeInfo && remainingText && " • "}
                    {remainingText}
                  </p>
                </div>
              </motion.div>
            );
          })}
      </div>
    </motion.section>
  );
}