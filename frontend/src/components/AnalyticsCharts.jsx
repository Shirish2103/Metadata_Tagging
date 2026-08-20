import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function AnalyticsCharts({ segments }) {
  if (!segments || segments.length === 0) return null;

  // Prepare Sentiment Trajectory Data
  const sentimentData = segments.map((s, idx) => ({
    scene: `S${s.segment_id || idx + 1}`,
    compound: Number(((s.sentiment || {}).compound || 0).toFixed(2)),
    heading: s.heading || `Scene ${idx + 1}`,
  }));

  // Prepare Emotion Distribution Data
  const emotionCounts = {};
  segments.forEach((s) => {
    const label = (s.emotion || {}).label || 'neutral';
    emotionCounts[label] = (emotionCounts[label] || 0) + 1;
  });

  const emotionData = Object.entries(emotionCounts).map(([label, count]) => ({
    emotion: label.toUpperCase(),
    count,
  }));

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#64748B'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 animate-fade-in">
      
      {/* Chart 1: Sentiment Trajectory */}
      <div className="ui-card rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Sentiment Trajectory Across Scenes
              </h3>
              <p className="text-xs text-slate-400">VADER Compound Score (-1.0 Negative to +1.0 Positive)</p>
            </div>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" vertical={false} />
                <XAxis dataKey="scene" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[-1, 1]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121721',
                    borderColor: '#1E2638',
                    borderRadius: '8px',
                    color: '#E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`Score: ${val}`, 'Sentiment']}
                  labelFormatter={(lbl) => `${lbl}`}
                />
                <Area
                  type="monotone"
                  dataKey="compound"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#sentimentGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 2: Emotion Distribution Bar Chart */}
      <div className="ui-card rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Emotion Distribution
              </h3>
              <p className="text-xs text-slate-400">Frequency of detected emotions across screenplay scenes</p>
            </div>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" vertical={false} />
                <XAxis dataKey="emotion" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121721',
                    borderColor: '#1E2638',
                    borderRadius: '8px',
                    color: '#E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val} scenes`, 'Count']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
