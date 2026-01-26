import React from 'react';
import { Artist } from '../../types';
import { User } from 'lucide-react';

interface ArtistProfileProps {
  artist: Artist;
}

const ArtistProfile: React.FC<ArtistProfileProps> = ({ artist }) => {
  return (
    <section className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
        <User size={12} /> 画家プロフィール
      </h3>
      <div className="flex items-center gap-3 mb-3">
        <img
          src={artist.avatar}
          className="w-8 h-8 rounded-full object-cover border border-slate-700"
          alt={artist.name}
        />
        <span className="text-xs font-bold text-slate-300">{artist.name}</span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-6">
        {artist.bio}
      </p>
    </section>
  );
};

export default ArtistProfile;
