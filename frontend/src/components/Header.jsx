import React from 'react';
import { Film, Upload, FileText, Activity } from 'lucide-react';

export default function Header({
  mode,
  setMode,
  apiConnected,
}) {
  return (
    <header className="bg-[#121721] border-b border-[#1E2638] px-6 py-3.5 mb-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">ScriptTagger</h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Screenplay Analyzer
              </span>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-[#0B0E14] p-1 rounded-lg border border-[#1E2638] flex items-center gap-1">
            <button
              onClick={() => setMode('corpus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                mode === 'corpus'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Movie Corpus
            </button>

            <button
              onClick={() => setMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                mode === 'upload'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Script
            </button>

            <button
              onClick={() => setMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                mode === 'raw'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Text Input
            </button>
          </div>

          {/* System API Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0E14] border border-[#1E2638] text-xs">
            <span className={`h-2 w-2 rounded-full ${apiConnected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            <span className="text-slate-300 font-medium">
              {apiConnected ? 'System Online' : 'Connecting API...'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
