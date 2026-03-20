import React, { useEffect, useState } from "react";
import { emby } from "@/services/emby";
import MovieCard from "@/components/MovieCard";
import { Loader2, Library } from "lucide-react";

export default function CollectionsPage({ onMovieClick }: { onMovieClick: (id: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      try {
        const data = await emby.getItems({ IncludeItemTypes: 'BoxSet', Limit: 50 });
        setItems(data.Items || []);
      } catch (err) {
        console.error("Failed to fetch collections:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Collections</h1>
          <p className="text-text-secondary">Curated sets of your favorite media</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="animate-spin text-accent-primary" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {items.map((item) => (
            <MovieCard key={item.Id} item={item} onClick={onMovieClick} />
          ))}
        </div>
      )}
    </div>
  );
}
