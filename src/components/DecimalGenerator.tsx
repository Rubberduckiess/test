import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, RefreshCw, Copy, Sparkles, AlertCircle } from 'lucide-react';
import { DecimalSettings } from '../types';
import { playClick, playRoll, playSuccess } from '../utils/audio';

interface DecimalGeneratorProps {
  onAddHistory: (results: string[], summary: string) => void;
}

export const DecimalGenerator: React.FC<DecimalGeneratorProps> = ({ onAddHistory }) => {
  const [settings, setSettings] = useState<DecimalSettings>({
    min: 0,
    max: 1,
    count: 1,
    decimalPlaces: 2,
  });

  const [results, setResults] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setError(null);
    setCopied(false);
    playClick();

    if (settings.min > settings.max) {
      setError('Minimum value cannot be greater than maximum value.');
      return;
    }

    setIsGenerating(true);
    playRoll(400);

    setTimeout(() => {
      const generated: number[] = [];

      for (let i = 0; i < settings.count; i++) {
        const rand = Math.random() * (settings.max - settings.min) + settings.min;
        // Fix to specific decimal places
        const formatted = parseFloat(rand.toFixed(settings.decimalPlaces));
        generated.push(formatted);
      }

      setResults(generated);
      setIsGenerating(false);
      playSuccess();

      const summary = `Decimal [${settings.min}, ${settings.max}] (dp: ${settings.decimalPlaces})`;
      onAddHistory(generated.map(n => n.toFixed(settings.decimalPlaces)), summary);
    }, 450);
  };

  const copyToClipboard = () => {
    if (results.length === 0) return;
    playClick();
    navigator.clipboard.writeText(results.map(n => n.toFixed(settings.decimalPlaces)).join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateMinMax = (minVal: number, maxVal: number) => {
    playClick();
    setSettings((prev) => ({ ...prev, min: minVal, max: maxVal }));
  };

  const stats = results.length > 0 ? {
    min: Math.min(...results).toFixed(settings.decimalPlaces),
    max: Math.max(...results).toFixed(settings.decimalPlaces),
    sum: results.reduce((a, b) => a + b, 0).toFixed(settings.decimalPlaces),
    avg: (results.reduce((a, b) => a + b, 0) / results.length).toFixed(settings.decimalPlaces),
  } : null;

  return (
    <div className="space-y-6" id="decimal-generator-section">
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
                step="any"
                value={settings.min}
                onChange={(e) => setSettings({ ...settings, min: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#111111] border border-white/15 text-white font-mono text-sm px-4 py-2.5 rounded-none focus:outline-none focus:border-[#ff4d00] transition-all duration-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase font-bold tracking-widest">Maximum</label>
              <input
                type="number"
                step="any"
                value={settings.max}
                onChange={(e) => setSettings({ ...settings, max: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#111111] border border-white/15 text-white font-mono text-sm px-4 py-2.5 rounded-none focus:outline-none focus:border-[#ff4d00] transition-all duration-200"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold self-center mr-1">Presets:</span>
            <button
              onClick={() => updateMinMax(0, 1)}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#181818] hover:bg-[#ff4d00] hover:text-white border border-white/5 hover:border-transparent text-white/70 transition-all duration-200"
            >
              0.0 - 1.0
            </button>
            <button
              onClick={() => updateMinMax(0, 100)}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#181818] hover:bg-[#ff4d00] hover:text-white border border-white/5 hover:border-transparent text-white/70 transition-all duration-200"
            >
              0.0 - 100.0
            </button>
            <button
              onClick={() => updateMinMax(-1, 1)}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#181818] hover:bg-[#ff4d00] hover:text-white border border-white/5 hover:border-transparent text-white/70 transition-all duration-200"
            >
              -1.0 to 1.0
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
              <span>Precision Setup</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-white/40 block uppercase font-bold tracking-widest">Decimal Places (dp)</label>
                  <span className="font-mono font-bold text-white bg-[#ff4d00] px-2 py-0.5 rounded-none text-xs">
                    {settings.decimalPlaces}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={settings.decimalPlaces}
                  onChange={(e) => {
                    playClick();
                    setSettings({ ...settings, decimalPlaces: parseInt(e.target.value) });
                  }}
                  className="w-full accent-[#ff4d00] bg-white/10 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">
                  <span>1 (0.0)</span>
                  <span>4 (0.0000)</span>
                  <span>8 (0.00000000)</span>
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
              <span>{isGenerating ? 'Generating...' : 'Generate Decimals'}</span>
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
              Configure parameters above and click "Generate Decimals" to begin.
            </p>
          ) : isGenerating ? (
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-[#ff4d00] border-t-transparent rounded-none"
              />
              <span className="text-white/70 text-xs font-mono tracking-[0.2em] font-black animate-pulse">
                ROLLING DECIMALS...
              </span>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {results.map((num, idx) => {
                const isSingle = results.length === 1;
                const formattedNum = num.toFixed(settings.decimalPlaces);
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
                          ? 'text-5xl md:text-[85px] font-black tracking-tighter text-[#ff4d00] py-4 px-8 border border-white/5 bg-black/40 rounded-none shadow-[inset_0_0_20px_rgba(255,77,0,0.1)]'
                          : 'text-base h-12 px-3 bg-black/50 hover:bg-[#ff4d00] hover:text-white text-white border border-white/10 rounded-none transition-all duration-150 cursor-pointer'
                      }`}
                  >
                    {formattedNum}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Stats Panel */}
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
