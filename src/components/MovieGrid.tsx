"use client";

import React, { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import { ChevronRight, Loader2 } from "lucide-react";
import { emby } from "@/services/emby";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

interface MovieGridProps {
  title: string;
  type: 'latest' | 'resume' | 'all' | 'library';
  parentId?: string;
  collectionType?: string;
  onMovieClick: (id: string) => void;
  onPlay?: (id: string) => void;
}

const getRouteForCollectionType = (collectionType?: string) => {
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

export default function MovieGrid({ title, type, parentId, collectionType, onMovieClick, onPlay }: MovieGridProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let data;
        if (type === 'latest' && parentId) {
          data = await emby.getLatestItems(parentId, 12);
        } else if (type === 'resume') {
          data = await emby.getResumeItems();
        } else if (type === 'library' && parentId) {
          const result = await emby.getItems({ 
            ParentId: parentId, 
            SortBy: 'DateCreated', 
            SortOrder: 'Descending',
            Limit: 12 
          });
          data = result.Items;
        } else if (type === 'latest') {
          data = await emby.getLatestItems(undefined, 12);
        } else {
          data = (await emby.getItems({ IncludeItemTypes: 'Movie', Limit: 12 })).Items;
        }
        setItems(data || []);
      } catch (err) {
        console.error(`Failed to fetch ${type} items:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, parentId]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
      </div>
    );
  }

  if (items.length === 0) return null;

  const handleViewAll = () => {
    if (collectionType) {
      navigate(getRouteForCollectionType(collectionType));
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {collectionType && (
          <button 
            onClick={handleViewAll}
            className="flex items-center gap-2 text-sm font-bold text-accent-primary hover:text-accent-primary/80 transition-colors group"
          >
            View All
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <MovieCard item={item} onClick={onMovieClick} onPlay={onPlay} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
