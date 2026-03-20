import React, { useEffect, useState } from "react";
import { emby } from "@/services/emby";
import { 
  Play, 
  Plus, 
  Star, 
  Clock, 
  Calendar, 
  Loader2,
  Info,
  Heart,
  Share2,
  ChevronRight,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MovieCard from "@/components/MovieCard";
import { useTranslation } from "react-i18next";

interface ItemDetailsPageProps {
  itemId: string;
  onBack: () => void;
  onWatch: (id: string) => void;
}

export default function ItemDetailsPage({ itemId, onBack, onWatch }: ItemDetailsPageProps) {
  const { t } = useTranslation();
  const [item, setItem] = useState<any>(null);
  const [similarItems, setSimilarItems] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const [isHoveringPoster, setIsHoveringPoster] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const [itemData, similarData] = await Promise.all([
          emby.getItem(itemId),
          emby.getSimilarItems(itemId, 6)
        ]);
        setItem(itemData);
        setSimilarItems(similarData.Items || []);
        setIsFavorite(itemData.UserData?.IsFavorite || false);
        setIsPlayed(itemData.UserData?.Played || false);

        if (itemData.Type === 'Series') {
          const seasonsData = await emby.getSeasons(itemId);
          setSeasons(seasonsData || []);
          if (seasonsData && seasonsData.length > 0) {
            setSelectedSeasonId(seasonsData[0].Id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch item details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [itemId]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (selectedSeasonId) {
        try {
          const episodesData = await emby.getEpisodes(itemId, selectedSeasonId);
          setEpisodes(episodesData || []);
        } catch (err) {
          console.error("Failed to fetch episodes:", err);
        }
      }
    };
    fetchEpisodes();
  }, [selectedSeasonId, itemId]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <Loader2 className="animate-spin text-accent-primary" size={64} />
        </motion.div>
      </div>
    );
  }

  if (!item) return null;

  const backdropUrl = emby.getItemImageUrl(item.Id, 'Backdrop', { width: 1920 });
  const posterUrl = emby.getItemImageUrl(item.Id, 'Primary', { width: 600 });
  const rating = item.CommunityRating || item.CriticRating || 0;
  const runtime = item.RunTimeTicks ? Math.floor(item.RunTimeTicks / 600000000) : null;
  const resumePositionTicks = item.UserData?.PlaybackPositionTicks || 0;
  const isResumable = resumePositionTicks > 0;
  const resumeMinutes = Math.floor(resumePositionTicks / 10000000 / 60);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await emby.unmarkAsFavorite(item.Id);
      } else {
        await emby.markAsFavorite(item.Id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleTogglePlayed = async () => {
    try {
      if (isPlayed) {
        await emby.markAsUnplayed(item.Id);
      } else {
        await emby.markAsPlayed(item.Id);
      }
      setIsPlayed(!isPlayed);
    } catch (err) {
      console.error('Failed to toggle played status:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen pb-24"
    >
      <div className="absolute top-0 inset-x-0 h-[80vh] -z-10 overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.2 }}
          src={backdropUrl} 
          className="w-full h-full object-cover blur-md"
          alt="Backdrop"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="pt-12 space-y-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-[280px] flex-shrink-0"
          >
            <motion.div 
              className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative cursor-pointer"
              onMouseEnter={() => setIsHoveringPoster(true)}
              onMouseLeave={() => setIsHoveringPoster(false)}
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={posterUrl} 
                className="w-full h-full object-cover transition-transform duration-700" 
                style={{ transform: isHoveringPoster ? 'scale(1.08)' : 'scale(1)' }}
                alt={item.Name} 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <AnimatePresence>
                {isHoveringPoster && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-4 left-4 right-4 flex gap-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); onWatch(item.Id); }}
                      className="flex-1 bg-white/90 backdrop-blur-sm text-black py-2 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm hover:bg-white transition-colors"
                    >
                      <Play size={16} fill="currentColor" />
                      {isResumable ? t('common.resume', '继续播放') : t('common.watch', '播放')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
                      className={`w-10 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors ${
                        isFavorite ? 'bg-rose-500/90 text-white' : 'bg-white/90 text-black hover:bg-white'
                      }`}
                    >
                      <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {item.OfficialRating && (
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10 cursor-default hover:bg-white/15 transition-colors"
                  >
                    {item.OfficialRating}
                  </motion.span>
                )}
                {rating > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 text-accent-gold font-bold bg-accent-gold/10 px-3 py-1.5 rounded-lg cursor-default"
                  >
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm">{rating.toFixed(1)}</span>
                  </motion.div>
                )}
                {isPlayed && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    {t('common.played', '已观看')}
                  </motion.span>
                )}
              </div>
              
              <motion.h1 
                className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                {item.Name}
              </motion.h1>

              <div className="flex items-center gap-6 text-text-secondary text-sm font-medium">
                <motion.div 
                  whileHover={{ scale: 1.05, color: '#ffffff' }}
                  className="flex items-center gap-2 cursor-default"
                >
                  <Calendar size={16} />
                  {item.ProductionYear}
                </motion.div>
                {runtime && (
                  <motion.div 
                    whileHover={{ scale: 1.05, color: '#ffffff' }}
                    className="flex items-center gap-2 cursor-default"
                  >
                    <Clock size={16} />
                    {t("common.minutes", { count: runtime })}
                  </motion.div>
                )}
                <motion.div 
                  whileHover={{ scale: 1.05, color: '#ffffff' }}
                  className="flex items-center gap-2 cursor-default"
                >
                  <Info size={16} />
                  {item.Type === 'Movie' ? t('menu.movies', '电影') : item.Type === 'Series' ? t('menu.series', '电视剧') : item.Type}
                </motion.div>
              </div>
            </div>

            <motion.p 
              className="text-base md:text-lg text-text-secondary leading-relaxed max-w-3xl cursor-default"
              whileHover={{ color: 'rgba(255,255,255,0.8)' }}
            >
              {item.Overview}
            </motion.p>

            <div className="flex items-center gap-3 flex-wrap">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 10px 40px -10px rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onWatch(item.Id)}
                className="bg-white text-black px-8 py-3.5 rounded-xl flex items-center gap-2.5 font-semibold hover:bg-accent-primary hover:text-white transition-all duration-300 group shadow-lg shadow-white/10"
              >
                <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                {isResumable ? t('common.resume_from', { minutes: resumeMinutes, defaultValue: `继续播放 (${resumeMinutes}分钟)` }) : t('common.watch', '播放')}
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 glass rounded-xl flex items-center justify-center transition-all duration-300 group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.15, boxShadow: isFavorite ? "0 0 20px rgba(244,63,94,0.4)" : "0 0 20px rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleFavorite}
                className={`w-12 h-12 glass rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isFavorite ? 'text-rose-500 bg-rose-500/20 shadow-lg shadow-rose-500/20' : 'hover:bg-white/10'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} className="transition-transform duration-300" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.15, boxShadow: isPlayed ? "0 0 20px rgba(16,185,129,0.4)" : "0 0 20px rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={handleTogglePlayed}
                className={`w-12 h-12 glass rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isPlayed ? 'text-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/20' : 'hover:bg-white/10'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 glass rounded-xl flex items-center justify-center transition-all duration-300 group"
              >
                <Share2 size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              </motion.button>
            </div>

            {item.Type === 'Series' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-8 pt-8"
              >
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                  {seasons.length > 0 ? seasons.map((season) => (
                    <motion.button
                      key={season.Id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSeasonId(season.Id)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        selectedSeasonId === season.Id
                          ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/30"
                          : "bg-white/10 text-text-secondary hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {season.Name}
                    </motion.button>
                  )) : (
                    <div className="text-text-tertiary text-sm italic">{t('details.no_seasons', '暂无季数信息')}</div>
                  )}
                </div>

                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {episodes.length > 0 ? episodes.map((episode, index) => (
                      <motion.div
                        key={episode.Id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onWatch(episode.Id)}
                        className="group flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-white/5 transition-all duration-300 cursor-pointer"
                      >
                        <div className="w-44 aspect-video rounded-xl overflow-hidden flex-shrink-0 relative">
                          <img 
                            src={emby.getItemImageUrl(episode.Id, 'Primary', { width: 320 })} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={episode.Name}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                            >
                              <Play size={24} fill="white" className="ml-0.5" />
                            </motion.div>
                          </div>
                          {episode.UserData?.PlaybackPositionTicks > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                              <div 
                                className="h-full bg-accent-primary" 
                                style={{ width: `${(episode.UserData.PlaybackPositionTicks / (episode.RunTimeTicks || 1)) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="font-medium text-white/90 truncate group-hover:text-white transition-colors">
                              {t('details.episode', { number: episode.IndexNumber, name: episode.Name, defaultValue: `第${episode.IndexNumber}集 - ${episode.Name}` })}
                            </h4>
                            {episode.RunTimeTicks && (
                              <span className="text-xs text-text-tertiary whitespace-nowrap bg-white/5 px-2 py-1 rounded">
                                {t('common.minutes', { count: Math.floor(episode.RunTimeTicks / 600000000), defaultValue: `${Math.floor(episode.RunTimeTicks / 600000000)} 分钟` })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-tertiary line-clamp-2 group-hover:text-text-secondary transition-colors">
                            {episode.Overview}
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-text-tertiary group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </motion.div>
                    )) : (
                      <div className="text-center py-12 text-text-tertiary italic">{t('details.select_season', '选择季数查看剧集')}</div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {item.People && item.People.length > 0 && (
              <div className="space-y-4 pt-8">
                <h3 className="text-lg font-semibold tracking-tight text-white/90">{t('details.cast', '演员阵容')}</h3>
                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                  {item.People.slice(0, 10).map((person: any, index: number) => (
                    <motion.div 
                      key={person.Id} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={{ y: -8 }}
                      className="flex-shrink-0 w-24 text-center space-y-2 cursor-pointer group"
                    >
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-lg group-hover:border-accent-primary/50 group-hover:shadow-accent-primary/20 transition-all duration-300">
                        <img 
                          src={emby.getItemImageUrl(person.Id, 'Primary', { width: 200 })} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          alt={person.Name}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-xs font-bold truncate group-hover:text-white transition-colors">{person.Name}</p>
                      <p className="text-[10px] text-text-tertiary truncate group-hover:text-text-secondary transition-colors">{person.Role}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {similarItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8 pt-12"
          >
            <h2 className="text-xl font-semibold tracking-tight text-white/90">{t('details.similar', '相似推荐')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {similarItems.map((similar) => (
                <MovieCard key={similar.Id} item={similar} onClick={(id) => onWatch(id)} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
