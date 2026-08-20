import React, { useState } from 'react';
import { Download, Copy, Check, FileJson } from 'lucide-react';

export default function JsonViewer({ meta, title, imdbId }) {
  const [copied, setCopied] = useState(false);

  if (!meta) return null;

  const jsonString = JSON.stringify(meta, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${imdbId || title || 'script'}.metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ui-card rounded-xl p-5 space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1E2638] pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileJson className="w-4 h-4 text-blue-400" />
            Raw Metadata JSON
          </h3>
          <p className="text-xs text-slate-400">Complete structured output JSON object</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#0B0E14] hover:bg-slate-800 text-slate-300 border border-[#1E2638] transition-colors w-full sm:w-auto justify-center"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors w-full sm:w-auto justify-center"
          >
            <Download className="w-3.5 h-3.5" />
            Download .json
          </button>
        </div>
      </div>

      <div className="bg-[#0B0E14] rounded-lg p-4 border border-[#1E2638] max-h-[500px] overflow-auto">
        <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
          {jsonString}
        </pre>
      </div>
    </div>
  );
}
