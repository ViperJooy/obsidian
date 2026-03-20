import React, { useEffect, useState } from "react";
import { emby } from "@/services/emby";
import { Loader2, Tv, Play } from "lucide-react";
import { motion } from "motion/react";

export default function LiveTvPage({ onChannelClick }: { onChannelClick: (id: string) => void }) {
  const [channels, setChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      try {
        const data = await emby.getChannels();
        setChannels(data.Items || []);
      } catch (err) {
        console.error("Failed to fetch channels:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Live TV</h1>
        <p className="text-text-secondary">Watch live broadcasts and channels</p>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="animate-spin text-accent-primary" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {channels.map((channel) => (
            <motion.div 
              key={channel.Id}
              whileHover={{ y: -4 }}
              onClick={() => onChannelClick(channel.Id)}
              className="glass-dark p-4 rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all group"
            >
              <div className="w-16 h-16 bg-surface rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                <img 
                  src={emby.getItemImageUrl(channel.Id, 'Primary', { width: 100 })} 
                  alt={channel.Name}
                  className="w-full h-full object-contain p-2"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{channel.Name}</h3>
                <p className="text-xs text-text-tertiary truncate">
                  {channel.CurrentProgram?.Name || "No program information"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={18} fill="currentColor" className="text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
