"use client";

import React, { useEffect, useState } from "react";
import Hero from "./Hero";
import ContinueWatching from "./ContinueWatching";
import MediaLibrary from "./MediaLibrary";
import MovieGrid from "./MovieGrid";
import { emby } from "@/services/emby";

interface ViewItem {
  Id: string;
  Name: string;
  CollectionType?: string;
}

interface HomePageProps {
  onWatch: (id: string) => void;
  onItemClick: (id: string) => void;
}

export default function HomePage({ onWatch, onItemClick }: HomePageProps) {
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

  return (
    <div className="space-y-8">
      <Hero onWatch={onWatch} onItemClick={onItemClick} />

      <MediaLibrary />

      <ContinueWatching onWatch={onWatch} />

      {!isLoading &&
        views.map((view) => (
          <MovieGrid
            key={view.Id}
            title={`Latest in ${view.Name}`}
            type="latest"
            parentId={view.Id}
            collectionType={view.CollectionType}
            onMovieClick={onItemClick}
            onPlay={onWatch}
          />
        ))}
    </div>
  );
}