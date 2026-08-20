import React, { useState } from 'react';
import { Film, MapPin, Clock, Users, MessageSquare, Tag } from 'lucide-react';

export default function SceneExplorer({ segments }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!segments || segments.length === 0) {
    return (
      <div className="ui-card rounded-xl p-8 text-center text-slate-400">
        No scene segments parsed for this script.
      </div>
    );
  }

  const currentScene = segments[selectedIndex] || segments[0];
  const dialogueLines = currentScene.dialogue || [];
  const topics = currentScene.topics || [];
  const sentiment = currentScene.sentiment || {};
  const emotion = currentScene.emotion || {};

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Scene Picker Bar */}
      <div className="ui-card rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Film className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300">Select Scene ({segments.length} total):</span>
        </div>

        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          className="w-full sm:w-96 bg-[#0B0E14] text-slate-100 text-xs rounded-lg px-3 py-2 border border-[#1E2638] focus:outline-none focus:border-blue-500 font-mono"
        >
          {segments.map((s, idx) => (
            <option key={idx} value={idx}>
              Scene {s.segment_id || idx + 1}: {s.heading || `Scene ${idx + 1}`} ({s.start} - {s.end})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Scene Detail Card */}
      <div className="ui-card rounded-xl p-6 space-y-6">
        
        {/* Scene Heading Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2638] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
              <span>Scene #{currentScene.segment_id || selectedIndex + 1}</span>
              <span>·</span>
              <span className="flex items-center gap-1 font-mono text-slate-400">
                <Clock className="w-3 h-3" /> {currentScene.start} – {currentScene.end}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {currentScene.heading || 'UNNAMED SCENE'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {currentScene.location && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#0B0E14] text-slate-300 border border-[#1E2638]">
                <MapPin className="w-3 h-3 text-blue-400" />
                {currentScene.location}
              </span>
            )}
            {currentScene.time_of_day && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#0B0E14] text-slate-300 border border-[#1E2638]">
                <Clock className="w-3 h-3 text-amber-400" />
                {currentScene.time_of_day}
              </span>
            )}
          </div>
        </div>

        {/* Scene Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Speakers */}
          <div className="bg-[#0B0E14] rounded-lg p-3.5 border border-[#1E2638]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase mb-2">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Speakers
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentScene.speakers && currentScene.speakers.length > 0 ? (
                currentScene.speakers.map((sp, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {sp}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No speakers identified</span>
              )}
            </div>
          </div>

          {/* Key Topics */}
          <div className="bg-[#0B0E14] rounded-lg p-3.5 border border-[#1E2638]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase mb-2">
              <Tag className="w-3.5 h-3.5 text-cyan-400" /> Topics
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topics.length > 0 ? (
                topics.slice(0, 5).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {t.keyword}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No topics extracted</span>
              )}
            </div>
          </div>

          {/* Sentiment */}
          <div className="bg-[#0B0E14] rounded-lg p-3.5 border border-[#1E2638]">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 uppercase mb-2">
              <span>Tone & Score</span>
              <span className="font-mono text-slate-300">{(sentiment.compound || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                {sentiment.label || 'neutral'}
              </span>
              {emotion.label && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {emotion.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scene Dialogues List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Dialogue Breakdown ({dialogueLines.length} lines)
            </h4>
          </div>

          {dialogueLines.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {dialogueLines.map((d, i) => (
                <div
                  key={i}
                  className="bg-[#0B0E14] rounded-lg p-3 border border-[#1E2638] flex items-start gap-3"
                >
                  <div className="h-7 w-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0 font-mono">
                    {(d.speaker || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-300">
                        {d.speaker || 'UNKNOWN'}
                      </span>
                      {d.parenthetical && (
                        <span className="text-[11px] text-slate-400 italic">
                          ({d.parenthetical})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed font-sans">
                      {d.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0B0E14] rounded-lg p-4 text-center text-xs text-slate-400 border border-[#1E2638]">
              Dialogue lines not cached for this scene.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
