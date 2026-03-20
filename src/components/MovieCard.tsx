"use client";

import React from "react";
import { Play, Star } from "lucide-react";
import { motion } from "motion/react";
import { emby } from "@/services/emby";

interface MovieCardProps {
  item: any;
  onClick: (id: string) => void;
  onPlay?: (id: string) => void;
}

export default function MovieCard({ item, onClick, onPlay }: MovieCardProps) {
  const imageUrl = emby.getItemImageUrl(item.Id, 'Primary', { width: 400 });
  const rating = item.CommunityRating || item.CriticRating || 0;
  const year = item.ProductionYear || "";
  const genre = (item.Genres || []).slice(0, 2).join(", ");

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item.Id)}
      className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-surface cursor-pointer"
    >
      {/* Poster */}
      <img 
        src={imageUrl} 
        alt={item.Name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        {/* Rating & Year */}
        <div className="flex items-center gap-2 mb-2">
          {rating > 0 && (
            <div className="flex items-center gap-1 bg-accent-amber/20 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-accent-amber">
              <Star size={10} fill="currentColor" />
              {rating.toFixed(1)}
            </div>
          )}
          <span className="text-[10px] text-text-tertiary font-medium">{year}</span>
        </div>
        
        {/* Title & Genre */}
        <h3 className="text-sm font-semibold mb-1 line-clamp-1 text-text-primary">{item.Name}</h3>
        {genre && <p className="text-[10px] text-text-tertiary mb-3">{genre}</p>}

        {/* Play Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onPlay) {
              onPlay(item.Id);
            } else {
              onClick(item.Id);
            }
          }}
          className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Play size={14} fill="currentColor" />
          Watch Now
        </button>
      </div>

      {/* Hover Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent-primary/50 rounded-xl transition-colors duration-300 pointer-events-none" />
      
      {/* Hover Glow */}
      <div className="absolute -inset-1 bg-accent-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
    </motion.div>
  );
}
