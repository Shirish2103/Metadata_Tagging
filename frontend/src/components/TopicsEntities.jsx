import React from 'react';
import { Tag, MapPin, User, Building, Box, Sparkles } from 'lucide-react';

export default function TopicsEntities({ topics, entities }) {
  const topicList = topics || [];
  const entityList = entities || [];

  // Group entities by label
  const groupedEntities = {};
  entityList.forEach((e) => {
    const label = e.label || 'OTHER';
    if (!groupedEntities[label]) groupedEntities[label] = new Set();
    groupedEntities[label].add(e.text);
  });

  const getEntityIcon = (label) => {
    if (label === 'PERSON') return <User className="w-3.5 h-3.5 text-blue-400" />;
    if (label === 'GPE' || label === 'LOC' || label === 'LOCATION') return <MapPin className="w-3.5 h-3.5 text-emerald-400" />;
    if (label === 'ORG' || label === 'ORGANIZATION') return <Building className="w-3.5 h-3.5 text-amber-400" />;
    return <Box className="w-3.5 h-3.5 text-cyan-400" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 animate-fade-in">
      
      {/* Key Topics Column */}
      <div className="ui-card rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-400" />
            Key Topics & Keywords
          </h3>
          <p className="text-xs text-slate-400">TF-IDF & KeyBERT extracted semantic terms</p>
        </div>

        {topicList.length > 0 ? (
          <div className="space-y-2">
            {topicList.slice(0, 12).map((t, idx) => (
              <div key={idx} className="bg-[#0B0E14] rounded-lg p-2.5 border border-[#1E2638] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-slate-200 capitalize">{t.keyword}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1 bg-[#1E2638] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (t.score || 0.5) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                    {(t.score || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic p-4 text-center">No topics extracted</div>
        )}
      </div>

      {/* Named Entities Column */}
      <div className="ui-card rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Named Entities (NER)
          </h3>
          <p className="text-xs text-slate-400">Extracted People, Locations, & Organizations</p>
        </div>

        {Object.keys(groupedEntities).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(groupedEntities).map(([label, set], idx) => {
              const items = Array.from(set);

              return (
                <div key={idx} className="bg-[#0B0E14] rounded-lg p-3 border border-[#1E2638]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {getEntityIcon(label)}
                    {label} ({items.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {items.slice(0, 15).map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-[#121721] text-slate-300 border border-[#1E2638]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic p-4 text-center">No entities extracted</div>
        )}
      </div>

    </div>
  );
}
