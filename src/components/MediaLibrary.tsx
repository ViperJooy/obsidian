"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Tv, Music, Video, Folder, Library, Loader2, Play } from "lucide-react";
import { emby } from "@/services/emby";
import { motion } from "motion/react";

interface ViewItem {
  Id: string;
  Name: string;
  CollectionType?: string;
  ImageTags?: any;
  ChildCount?: number;
}

const getIconForCollectionType = (collectionType?: string) => {
  switch (collectionType) {
    case 'movies':
      return Film;
    case 'tvshows':
      return Tv;
    case 'music':
      return Music;
    case 'boxsets':
      return Folder;
    case 'playlists':
      return Library;
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
    default:
      return '/collections';
  }
};

const getGradientForType = (collectionType?: string) => {
  switch (collectionType) {
    case 'movies':
      return 'from-rose-900/40 via-rose-800/20 to-transparent';
    case 'tvshows':
      return 'from-indigo-900/40 via-indigo-800/20 to-transparent';
    case 'music':
      return 'from-emerald-900/40 via-emerald-800/20 to-transparent';
    case 'boxsets':
      return 'from-amber-900/40 via-amber-800/20 to-transparent';
    default:
      return 'from-slate-900/40 via-slate-800/20 to-transparent';
  }
};

export default function MediaLibrary() {
  const navigate = useNavigate();
  const [views, setViews] = useState<ViewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const data = await emby.getViews();
        setViews(data || []);
      } catch (err) {
        console.error("Failed to fetch views:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (emby.isAuthenticated) {
      fetchViews();
    }
  }, []);

  const handleClick = (view: ViewItem) => {
    navigate(getRouteForCollectionType(view.CollectionType, view.Id));
  };

  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
      </div>
    );
  }

  if (views.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary">My Media</h2>
          <p className="text-sm text-text-tertiary mt-1">Browse your libraries</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {views.map((view, index) => {
          const Icon = getIconForCollectionType(view.CollectionType);
          const gradient = getGradientForType(view.CollectionType);
          
          return (
            <motion.div
              key={view.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.08,
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClick(view)}
              className="group cursor-pointer"
            >
              {/* Card Container */}
              <div className={`relative aspect-video rounded-xl overflow-hidden bg-surface border border-border-subtle transition-all duration-300 group-hover:border-accent-primary/30 group-hover:shadow-lg group-hover:shadow-accent-primary/10`}>
                
                {/* Background Image */}
                {view.ImageTags?.Primary ? (
                  <img
                    src={emby.getItemImageUrl(view.Id, 'Primary', { width: 480, height: 270 })}
                    alt={view.Name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon size={48} className="text-text-tertiary/30" />
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Play Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-14 h-14 rounded-full bg-accent-primary/90 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg"
                  >
                    <Play size={24} className="text-white ml-1" fill="white" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-base font-semibold text-text-primary mb-1 drop-shadow-lg">{view.Name}</h3>
                  <div className="flex items-center gap-2">
                    <Icon size={12} className="text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">
                      {view.CollectionType === 'movies' ? 'Movies' : 
                       view.CollectionType === 'tvshows' ? 'TV Shows' :
                       view.CollectionType === 'music' ? 'Music' :
                       view.CollectionType === 'boxsets' ? 'Collections' : 'Library'}
                    </span>
                    {view.ChildCount !== undefined && view.ChildCount > 0 && (
                      <>
                        <span className="text-text-tertiary/50">•</span>
                        <span className="text-xs text-text-tertiary">{view.ChildCount} items</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
