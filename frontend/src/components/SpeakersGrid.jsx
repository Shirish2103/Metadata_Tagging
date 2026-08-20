import React from 'react';
import { MessageSquare, AlignLeft, Award } from 'lucide-react';

export default function SpeakersGrid({ speakers }) {
  if (
    !speakers ||
    (Array.isArray(speakers) && speakers.length === 0) ||
    (typeof speakers === 'object' && Object.keys(speakers).length === 0)
  ) {
    return (
      <div className="ui-card rounded-xl p-8 text-center text-slate-400">
        No character speaker statistics extracted for this screenplay.
      </div>
    );
  }

  // Support both Array format [{name, lines, words, gender}] and Object format {NAME: {lines, words}}
  let list = [];
  if (Array.isArray(speakers)) {
    list = speakers.map((sp) => ({
      name: sp.name || sp.speaker || 'Unknown',
      lines: sp.lines || sp.line_count || 0,
      words: sp.words || sp.word_count || 0,
      gender: sp.gender || 'n/a',
    }));
  } else if (typeof speakers === 'object') {
    list = Object.entries(speakers).map(([key, info]) => ({
      name: info?.name || key,
      lines: info?.lines || info?.line_count || 0,
      words: info?.words || info?.word_count || 0,
      gender: info?.gender || 'n/a',
    }));
  }

  list = list.filter((sp) => sp.name && sp.name !== 'Unknown').sort((a, b) => b.lines - a.lines);

  const topSpeakerLines = list[0]?.lines || 1;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Characters & Speakers ({list.length})</h3>
          <p className="text-xs text-slate-400">Dialogue speakers ranked by spoken dialogue frequency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.slice(0, 24).map((sp, idx) => {
          const percentage = Math.round((sp.lines / topSpeakerLines) * 100);

          return (
            <div
              key={idx}
              className="ui-card ui-card-hover rounded-xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                    {sp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {sp.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {sp.gender !== 'n/a' ? sp.gender : 'Character'}
                    </span>
                  </div>
                </div>

                {idx === 0 && (
                  <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Lead Speaker">
                    <Award className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-blue-400" /> {sp.lines} lines
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 font-mono">
                    <AlignLeft className="w-3 h-3 text-slate-400" /> {sp.words} words
                  </span>
                </div>

                <div className="w-full h-1 bg-[#0B0E14] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
