import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, RefreshCw, Copy, Sparkles, AlertCircle } from 'lucide-react';
import { IntegerSettings } from '../types';
import { playClick, playRoll, playSuccess } from '../utils/audio';

interface IntegerGeneratorProps {
  onAddHistory: (results: string[], summary: string) => void;
}

export const IntegerGenerator: React.FC<IntegerGeneratorProps> = ({ onAddHistory }) => {
  const [settings, setSettings] = useState<IntegerSettings>({
    min: 1,
    max: 100,
    count: 1,
    allowDuplicates: true,
    sort: 'none',
  });

  const [results, setResults] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setError(null);
    setCopied(false);
    playClick();

    // Validations
    if (settings.min > settings.max) {
      setError('Minimum value cannot be greater than maximum value.');
      return;
    }

    const rangeSize = settings.max - settings.min + 1;
    if (!settings.allowDuplicates && settings.count > rangeSize) {
      setError(`Cannot generate ${settings.count} unique numbers in a range of size ${rangeSize}.`);
      return;
    }

    setIsGenerating(true);
    playRoll(400);

    setTimeout(() => {
      const generated: number[] = [];

      if (settings.allowDuplicates) {
        for (let i = 0; i < settings.count; i++) {
          const num = Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
          generated.push(num);
        }
      } else {
        const pool = Array.from({ length: rangeSize }, (_, i) => settings.min + i);
        // Fisher-Yates shuffle
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        for (let i = 0; i < settings.count; i++) {
          generated.push(pool[i]);
        }
      }

      // Sort
      if (settings.sort === 'asc') {
        generated.sort((a, b) => a - b);
      } else if (settings.sort === 'desc') {
        generated.sort((a, b) => b - a);
      }

      setResults(generated);
      setIsGenerating(false);
      playSuccess();

      // Log to history
      const summary = `Integer [${settings.min}, ${settings.max}] (Count: ${settings.count})`;
      onAddHistory(generated.map(String), summary);
    }, 450);
  };

  const copyToClipboard = () => {
    if (results.length === 0) return;
    playClick();
    navigator.clipboard.writeText(results.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick settings tuning
  const updateMinMax = (minVal: number, maxVal: number) => {
    playClick();
    setSettings((prev) => ({ ...prev, min: minVal, max: maxVal }));
  };

  // Statistics calculation
  const stats = results.length > 0 ? {
    min: Math.min(...results),
    max: Math.max(...results),
    sum: results.reduce((a, b) => a + b, 0),
    avg: parseFloat((results.reduce((a, b) => a + b, 0) / results.length).toFixed(2)),
  } : null;

  return (
    <div className="space-y-6" id="integer-generator-section">
      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0c0c0c] p-6 border border-white/10 rounded-none shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-[0.2em]">
            <Sliders className="w-4 h-4 text-[#ff4d00]" />
            <span>Range & Count</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase font-bold tracking-widest">Minimum</label>
              <input
                type="number"
                value={settings.min}
                onChange={(e) => setSettings({ ...settings, min: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#111111] border border-white/15 text-white font-mono text-sm px-4 py-2.5 rounded-none focus:outline-none focus:border-[#ff4d00] transition-all duration-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase font-bold tracking-widest">Maximum</label>
              <input
                type="number"
                value={settings.max}
                onChange={(e) => setSettings({ ...settings, max: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#111111] border border-white/15 text-white font-mono text-sm px-4 py-2.5 rounded-none focus:outline-none focus:border-[#ff4d00] transition-all duration-200"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold self-center mr-1">Presets:</span>
            <button
              onClick={() => updateMinMax(1, 10)}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#181818] hover:bg-[#ff4d00] hover:text-white border border-white/5 hover:border-transparent text-white/70 transition-all duration-200"
            >
              1 - 10
            </button>
            <button
              onClick={() => updateMinMax(1, 100)}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#181818] hover:bg-[#ff4d00] hover:text-white border border-white/5 hover:border-transparent text-white/70 transition-all duration-200"
            >
              1 - 100
            </button>
            <button
              onClick={() => updateMinMax(1, 1000)}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#181818] hover:bg-[#ff4d00] hover:text-white border border-white/5 hover:border-transparent text-white/70 transition-all duration-200"
            >
              1 - 1000
            </button>
            <button
              onClick={() => updateMinMax(-50, 50)}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#181818] hover:bg-[#ff4d00] hover:text-white border border-white/5 hover:border-transparent text-white/70 transition-all duration-200"
            >
              -50 to 50
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest block">How many numbers?</label>
              <span className="font-mono font-bold text-white bg-[#ff4d00] px-2 py-0.5 rounded-none text-xs">
                {settings.count}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="250"
              value={settings.count}
              onChange={(e) => setSettings({ ...settings, count: parseInt(e.target.value) })}
              className="w-full accent-[#ff4d00] bg-white/10 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">
              <span>1</span>
              <span>100</span>
              <span>250</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-[0.2em] mb-3">
              <Sliders className="w-4 h-4 text-[#ff4d00]" />
              <span>Generation Preferences</span>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.allowDuplicates}
                  onChange={(e) => {
                    playClick();
                    setSettings({ ...settings, allowDuplicates: e.target.checked });
                  }}
                  className="w-4 h-4 mt-0.5 accent-[#ff4d00] text-[#ff4d00] bg-[#111111] border-white/20 focus:ring-0"
                />
                <div className="text-xs">
                  <p className="text-white/80 font-bold group-hover:text-white transition-colors uppercase tracking-wider">Allow duplicates</p>
                  <p className="text-white/40">If disabled, all generated numbers will be unique</p>
                </div>
              </label>

              <div>
                <label className="text-[10px] text-white/40 block mb-1.5 uppercase font-bold tracking-widest">Sort results</label>
                <div className="grid grid-cols-3 gap-1 bg-[#111111] p-1 border border-white/10 rounded-none">
                  {(['none', 'asc', 'desc'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        playClick();
                        setSettings({ ...settings, sort: mode });
                      }}
                      className={`text-[10px] py-1.5 font-black uppercase tracking-widest transition-all ${
                        settings.sort === mode
                          ? 'bg-white text-black'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {mode === 'none' ? 'None' : mode === 'asc' ? 'Asc' : 'Desc'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3">
            {error && (
              <div className="flex items-start gap-2 text-rose-400 bg-rose-950/20 border border-rose-800/40 px-3 py-2.5 rounded-none text-xs mb-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-white text-black hover:bg-[#ff4d00] hover:text-white disabled:bg-white/20 disabled:text-white/40 font-black uppercase tracking-[0.2em] py-3.5 px-4 rounded-none transition-all duration-200 flex items-center justify-center gap-2 select-none"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate Numbers'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Display Area */}
      <div className="bg-[#0c0c0c] p-6 rounded-none text-white shadow-2xl border border-white/10 relative overflow-hidden min-h-[220px] flex flex-col justify-between">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff4d00]" />
            <h3 className="text-xs font-black tracking-[0.2em] text-white/50 uppercase">Results</h3>
          </div>
          {results.length > 0 && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 px-3 py-2 rounded-none transition-all duration-200"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy All'}</span>
            </button>
          )}
        </div>

        {/* Generated Numbers List */}
        <div className="flex-1 flex flex-wrap gap-2.5 items-center justify-center py-4 z-10 max-h-[220px] overflow-y-auto custom-scrollbar">
          {results.length === 0 && !isGenerating ? (
            <p className="text-white/30 text-center font-bold uppercase tracking-wider text-xs my-auto">
              Configure parameters above and click "Generate Numbers" to begin.
            </p>
          ) : isGenerating ? (
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-[#ff4d00] border-t-transparent rounded-none"
              />
              <span className="text-white/70 text-xs font-mono tracking-[0.2em] font-black animate-pulse">
                ROLLING NUMBERS...
              </span>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {results.map((num, idx) => {
                const isSingle = results.length === 1;
                return (
                  <motion.div
                    key={`${num}-${idx}`}
                    initial={{ opacity: 0, scale: 0.3, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 18,
                      delay: isSingle ? 0 : Math.min(idx * 0.015, 0.4),
                    }}
                    className={`flex items-center justify-center font-mono font-black select-all select-text
                      ${
                        isSingle
                          ? 'text-7xl md:text-[110px] font-black tracking-tighter text-[#ff4d00] py-4 px-8 border border-white/5 bg-black/40 rounded-none shadow-[inset_0_0_20px_rgba(255,77,0,0.1)]'
                          : 'text-2xl h-14 min-w-[4rem] px-4 bg-black/50 hover:bg-[#ff4d00] hover:text-white text-white border border-white/10 rounded-none transition-all duration-150 cursor-pointer'
                      }`}
                  >
                    {num}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Stats Panel (when results generated) */}
        {results.length > 0 && !isGenerating && stats && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-2 text-center text-xs text-white/40 z-10">
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Min</p>
              <p className="font-mono text-white text-sm font-bold">{stats.min}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Max</p>
              <p className="font-mono text-white text-sm font-bold">{stats.max}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Average</p>
              <p className="font-mono text-white text-sm font-bold">{stats.avg}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Sum</p>
              <p className="font-mono text-white text-sm font-bold">{stats.sum}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
