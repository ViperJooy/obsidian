"use client";

import React, { useEffect, useState } from "react";
import { Play, Star, Info, Loader2 } from "lucide-react";
import { emby } from "@/services/emby";
import { useTranslation } from "react-i18next";

function formatRuntime(ticks?: number): string {
  if (!ticks) return "";
  const totalMinutes = Math.floor(ticks / 10000000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getVideoFormat(item: any): string {
  if (item.MediaSources && item.MediaSources.length > 0) {
    const source = item.MediaSources[0];
    if (source.MediaStreams) {
      const videoStream = source.MediaStreams.find((s: any) => s.Type === "Video");
      if (videoStream) {
        const height = videoStream.Height || 0;
        if (height >= 2160) return "4K Ultra HD";
        if (height >= 1080) return "1080p HD";
        if (height >= 720) return "720p HD";
        return "SD";
      }
    }
  }
  return "";
}

export default function Hero({ onWatch, onItemClick }: { onWatch: (id: string) => void; onItemClick: (id: string) => void }) {
  const { t } = useTranslation();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const data = await emby.getItems({
          IncludeItemTypes: "Movie",
          SortBy: "Random",
          Limit: 1,
          Fields: "CommunityRating,OfficialRating,ProductionYear,RunTimeTicks,MediaSources,MediaStreams,Overview",
        });
        if (data.Items && data.Items.length > 0) {
          setItem(data.Items[0]);
        }
      } catch (err) {
        console.error("Failed to fetch hero item:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHero();
  }, []);

  if (isLoading) {
    return (
      <div className="relative h-[870px] w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!item) return null;

  const backdropUrl = emby.getItemImageUrl(item.Id, "Backdrop", { width: 1920 });
  const rating = item.CommunityRating || 0;
  const year = item.ProductionYear || "";
  const officialRating = item.OfficialRating || "";
  const runtime = formatRuntime(item.RunTimeTicks);
  const videoFormat = getVideoFormat(item);

  const userData = item.UserData || {};
  const playbackProgress = userData.PlayedPercentage || 0;
  const resumePosition = userData.PlaybackPositionTicks || 0;
  const isResumable = resumePosition > 0;

  const remainingTicks = (item.RunTimeTicks || 0) - resumePosition;
  const remainingMinutes = Math.floor(remainingTicks / 10000000 / 60);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;
  
  // Format remaining time using i18n
  const remainingText = remainingHours > 0 
    ? t('common.time_left_hm', { hours: remainingHours, mins: remainingMins, defaultValue: '剩余 {{hours}}小时 {{mins}}分钟' })
    : t('common.time_left_m', { mins: remainingMins, defaultValue: '剩余 {{mins}}分钟' });

  return (
    <section className="relative h-[870px] w-full overflow-hidden flex items-end px-8 md:px-16 pb-24 text-text-primary">
      <div className="absolute inset-0 z-0 bg-background">
        <img
          src={backdropUrl}
          alt={item.Name}
          className="w-full h-full object-cover opacity-90 dark:opacity-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-y-0 left-0 w-[90%] md:w-[60%] bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase">
            {t('common.featured', '精选内容')}
          </span>
          {rating > 0 && (
            <span className="text-text-secondary flex items-center gap-1 text-sm font-bold">
              <Star size={14} fill="currentColor" className="text-accent-gold" /> {rating.toFixed(1)}
            </span>
          )}
        </div>

        <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter mb-4 leading-none uppercase drop-shadow-sm">
          {item.Name}
        </h1>

        <div className="flex items-center gap-4 text-text-secondary font-medium text-sm mb-8 drop-shadow-sm">
          {year && <span>{year}</span>}
          {officialRating && (
            <span className="px-1.5 py-0.5 border border-outline-variant rounded text-[10px] text-text-secondary">
              {officialRating}
            </span>
          )}
          {runtime && <span>{runtime}</span>}
          {videoFormat && (
            <span className="flex items-center gap-1 text-text-secondary">
              <span className="material-symbols-outlined text-sm">hd</span> {videoFormat}
            </span>
          )}
        </div>

        {isResumable && (
          <div className="mb-10 w-full max-w-md">
            <div className="flex justify-between text-xs text-text-secondary mb-2 font-medium drop-shadow-sm">
              <span>{t('common.continue_watching', '继续观看')} • {remainingText}</span>
              <span className="text-primary font-bold">{Math.round(playbackProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-dim rounded-full shadow-[0_0_10px_rgba(187,158,255,0.5)]"
                style={{ width: `${playbackProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={() => onWatch(item.Id)}
            className="bg-gradient-to-br from-primary to-primary-dim text-on-primary-fixed px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-primary/20"
          >
            <Play size={20} fill="currentColor" />
            {isResumable ? t('common.resume', '继续播放') : t('common.watch', '立即观看')}
          </button>
          <button
            onClick={() => onItemClick(item.Id)}
            className="glass-effect bg-surface/40 backdrop-blur-md px-6 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-surface/60 border border-outline/20 hover:scale-105 transition-all shadow-lg text-text-primary"
          >
            <Info size={20} />
            {t('common.details', '详情')}
          </button>
        </div>
      </div>
    </section>
  );
}