import React from 'react';
import { Film, MessageSquare, AlignLeft, Smile, Frown, Meh, Tag } from 'lucide-react';

export default function OverviewCards({ meta }) {
  if (!meta) return null;

  const overall = meta.overall || {};
  const genres = meta.genres || [];
  const sentiment = overall.sentiment || {};
  const emotion = overall.emotion || {};

  const getSentimentIcon = (label) => {
    if (label === 'positive') return <Smile className="w-4 h-4 text-emerald-400" />;
    if (label === 'negative') return <Frown className="w-4 h-4 text-rose-400" />;
    return <Meh className="w-4 h-4 text-amber-400" />;
  };

  const getSentimentColor = (label) => {
    if (label === 'positive') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (label === 'negative') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="space-y-4 mb-8 animate-fade-in">
      {/* Title & Genre Badges Header */}
      <div className="ui-card rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {meta.title || 'Untitled Screenplay'}
              </h2>
              {meta.imdb_id && (
                <span className="px-2.5 py-0.5 text-xs font-mono text-slate-300 rounded bg-[#0B0E14] border border-[#1E2638]">
                  IMDb: {meta.imdb_id}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Source: {meta.source || 'Script Corpus'} · Metadata Extraction Analysis
            </p>
          </div>

          {/* Predicted Genre Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {genres.length > 0 ? (
              genres.map((g, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20"
                >
                  <Tag className="w-3 h-3 text-blue-400" />
                  {g.genre}
                  <span className="text-[10px] opacity-75 font-mono">{(g.score * 100).toFixed(0)}%</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No genres classified</span>
            )}
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scenes Card */}
        <div className="ui-card ui-card-hover rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Scenes</span>
            <div className="p-2 rounded bg-blue-500/10 text-blue-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{overall.num_scenes || 0}</span>
            <span className="text-xs text-slate-400 ml-2">scenes</span>
          </div>
        </div>

        {/* Dialogue Lines Card */}
        <div className="ui-card ui-card-hover rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Dialogue Lines</span>
            <div className="p-2 rounded bg-purple-500/10 text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">
              {overall.num_dialogue_lines?.toLocaleString() || 0}
            </span>
            <span className="text-xs text-slate-400 ml-2">lines</span>
          </div>
        </div>

        {/* Total Words Card */}
        <div className="ui-card ui-card-hover rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Words</span>
            <div className="p-2 rounded bg-cyan-500/10 text-cyan-400">
              <AlignLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">
              {overall.num_words?.toLocaleString() || 0}
            </span>
            <span className="text-xs text-slate-400 ml-2">words</span>
          </div>
        </div>

        {/* Overall Sentiment Card */}
        <div className="ui-card ui-card-hover rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Tone</span>
            <div className="p-2 rounded bg-slate-800">
              {getSentimentIcon(sentiment.label)}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getSentimentColor(sentiment.label)} capitalize`}>
                {sentiment.label || 'neutral'}
              </span>
              <span className="text-xs font-mono text-slate-400 ml-2">
                {(sentiment.compound || 0).toFixed(2)}
              </span>
            </div>
            {emotion.label && (
              <span className="text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                {emotion.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
