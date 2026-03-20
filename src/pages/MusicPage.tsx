import React, { useEffect, useState } from "react";
import { emby } from "@/services/emby";
import MovieCard from "@/components/MovieCard";
import { Loader2, Music, User } from "lucide-react";

export default function MusicPage({ onMovieClick }: { onMovieClick: (id: string) => void }) {
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'albums' | 'artists'>('albums');

  useEffect(() => {
    const fetchMusic = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'albums') {
          const data = await emby.getItems({ IncludeItemTypes: 'MusicAlbum', Limit: 50 });
          setAlbums(data.Items || []);
        } else {
          const data = await emby.getArtists({ Limit: 50 });
          setArtists(data.Items || []);
        }
      } catch (err) {
        console.error("Failed to fetch music:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusic();
  }, [activeTab]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Music</h1>
          <p className="text-text-secondary">Your personal soundtrack</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('albums')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'albums' ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'text-text-tertiary hover:text-white'}`}
          >
            <Music size={16} />
            Albums
          </button>
          <button 
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'artists' ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'text-text-tertiary hover:text-white'}`}
          >
            <User size={16} />
            Artists
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="animate-spin text-accent-primary" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {activeTab === 'albums' ? (
            albums.map((item) => (
              <MovieCard key={item.Id} item={item} onClick={onMovieClick} />
            ))
          ) : (
            artists.map((item) => (
              <MovieCard key={item.Id} item={item} onClick={onMovieClick} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
