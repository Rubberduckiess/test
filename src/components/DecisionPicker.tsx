import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, Sliders, AlertCircle, Trash2, HelpCircle, ListChecks } from 'lucide-react';
import { DecisionSettings } from '../types';
import { playClick, playRoll, playSuccess } from '../utils/audio';

interface DecisionPickerProps {
  onAddHistory: (results: string[], summary: string) => void;
}

const TEMPLATES = [
  { name: 'Yes / No / Maybe', items: ['Yes', 'No', 'Maybe'] },
  { name: 'What to Eat', items: ['Pizza 🍕', 'Burgers 🍔', 'Sushi 🍣', 'Salad 🥗', 'Tacos 🌮', 'Pasta 🍝'] },
  { name: 'Who Goes First?', items: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
  { name: 'Coin Stand-in', items: ['Heads 🦅', 'Tails 👑'] },
];

export const DecisionPicker: React.FC<DecisionPickerProps> = ({ onAddHistory }) => {
  const [inputText, setInputText] = useState<string>(
    "Coffee ☕\nTea 🍵\nHot Chocolate 🍫\nMatcha Latte 🍵"
  );
  
  const [settings, setSettings] = useState<DecisionSettings>({
    options: [],
    drawCount: 1,
    allowDuplicates: false,
  });

  const [results, setResults] = useState<string[]>([]);
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse lines to options list
  const getParsedOptions = (text: string): string[] => {
    return text
      .split('\n')
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);
  };

  const handlePick = () => {
    setError(null);
    playClick();

    const currentOptions = getParsedOptions(inputText);
    if (currentOptions.length === 0) {
      setError('Please enter at least one option (one per line).');
      return;
    }

    if (!settings.allowDuplicates && settings.drawCount > currentOptions.length) {
      setError(`Cannot draw ${settings.drawCount} unique items because you only provided ${currentOptions.length} option(s).`);
      return;
    }

    setIsPicking(true);
    playRoll(500);

    setTimeout(() => {
      const pool = [...currentOptions];
      const drawn: string[] = [];

      if (settings.allowDuplicates) {
        for (let i = 0; i < settings.drawCount; i++) {
          const randIdx = Math.floor(Math.random() * pool.length);
          drawn.push(pool[randIdx]);
        }
      } else {
        // Fisher-Yates shuffle the pool and take the first N elements
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        for (let i = 0; i < settings.drawCount; i++) {
          drawn.push(pool[i]);
        }
      }

      setResults(drawn);
      setIsPicking(false);
      playSuccess();

      const summary = `Decision Picker (Picked ${settings.drawCount} of ${currentOptions.length})`;
      onAddHistory(drawn, summary);
    }, 550);
  };

  const loadTemplate = (items: string[]) => {
    playClick();
    setInputText(items.join('\n'));
    setResults([]);
    setError(null);
  };

  const handleClear = () => {
    playClick();
    setInputText('');
    setResults([]);
    setError(null);
  };

  const parsedCount = getParsedOptions(inputText).length;

  return (
    <div className="space-y-6" id="decision-picker-section">
      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0c0c0c] p-6 border border-white/10 rounded-none shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-white font-black text-xs uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[#ff4d00]" />
              <span>Input Options</span>
            </span>
            <span className="font-mono bg-[#ff4d00] text-white px-2 py-0.5 rounded-none text-[10px]">
              {parsedCount} {parsedCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter choices here...&#10;One choice per line"
            className="w-full h-36 bg-[#111111] border border-white/15 text-white text-sm p-4 rounded-none focus:outline-none focus:border-[#ff4d00] transition-all font-sans leading-relaxed resize-none custom-scrollbar"
          />

          <div className="flex justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  onClick={() => loadTemplate(tmpl.items)}
                  className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-[#111111] hover:bg-white hover:text-black border border-white/10 text-white/70 rounded-none transition-all duration-200"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleClear}
              className="text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/40 px-2.5 py-1.5 rounded-none transition-all duration-200 flex items-center gap-1.5 self-start shrink-0"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-[0.2em] mb-3">
              <Sliders className="w-4 h-4 text-[#ff4d00]" />
              <span>Draw Parameters</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-white/40 block uppercase font-bold tracking-widest">How many options to draw?</label>
                  <span className="font-mono font-bold text-white bg-[#ff4d00] px-2 py-0.5 rounded-none text-xs">
                    {settings.drawCount}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={Math.max(1, parsedCount)}
                  disabled={parsedCount === 0}
                  value={settings.drawCount}
                  onChange={(e) => {
                    playClick();
                    setSettings({ ...settings, drawCount: parseInt(e.target.value) });
                  }}
                  className="w-full accent-[#ff4d00] bg-white/10 disabled:opacity-40 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">
                  <span>1 Item</span>
                  <span>Max items</span>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.allowDuplicates}
                  onChange={(e) => {
                    playClick();
                    setSettings({ ...settings, allowDuplicates: e.target.checked });
                  }}
                  className="w-4 h-4 border-white/15 bg-[#111111] accent-[#ff4d00] focus:ring-0 rounded-none cursor-pointer"
                />
                <div>
                  <p className="text-white/80 font-bold uppercase tracking-wider text-[11px] group-hover:text-white transition-colors">Allow duplicate draws</p>
                  <p className="text-[10px] text-white/40">The same choice can be picked multiple times</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-3">
            {error && (
              <div className="flex items-start gap-2 text-rose-400 bg-rose-950/20 border border-rose-800/40 px-3.5 py-2.5 rounded-none text-xs mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handlePick}
              disabled={isPicking || parsedCount === 0}
              className="w-full bg-white text-black hover:bg-[#ff4d00] hover:text-white disabled:bg-white/20 disabled:text-white/40 font-black uppercase tracking-[0.2em] py-3.5 px-4 rounded-none transition-all duration-200 flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isPicking ? 'animate-spin' : ''}`} />
              <span>{isPicking ? 'Mixing Options...' : `Pick ${settings.drawCount} Winner${settings.drawCount > 1 ? 's' : ''}`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Display Area */}
      <div className="bg-[#0c0c0c] p-6 rounded-none text-white shadow-2xl border border-white/10 relative overflow-hidden min-h-[220px] flex flex-col justify-between">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff4d00]" />
            <h3 className="text-xs font-black tracking-[0.2em] text-white/50 uppercase">
              Selected Winners
            </h3>
          </div>
        </div>

        {/* Drawn Winners Panel */}
        <div className="flex-1 flex flex-col gap-3 items-center justify-center py-4 z-10 max-h-[220px] overflow-y-auto custom-scrollbar">
          {results.length === 0 && !isPicking ? (
            <div className="text-white/30 text-center text-xs font-bold uppercase tracking-wider my-auto flex flex-col items-center gap-2">
              <HelpCircle className="w-6 h-6 text-white/20" />
              <span>Your choices will appear here once drawn.</span>
            </div>
          ) : isPicking ? (
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                className="w-8 h-8 border-4 border-[#ff4d00] border-t-transparent rounded-none"
              />
              <span className="text-[#ff4d00] text-xs font-mono tracking-widest animate-pulse uppercase font-black">
                Selecting at random...
              </span>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-2">
              <AnimatePresence mode="popLayout">
                {results.map((winner, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <motion.div
                      key={`${winner}-${idx}`}
                      initial={{ opacity: 0, scale: 0.8, x: -30 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        delay: Math.min(idx * 0.08, 0.5),
                      }}
                      className={`flex items-center justify-between p-4 rounded-none border transition-all duration-200 ${
                        isFirst
                          ? 'bg-black border-[#ff4d00] shadow-[0_0_15px_rgba(255,77,0,0.15)]'
                          : 'bg-[#111111] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`w-6 h-6 rounded-none font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                          isFirst ? 'bg-[#ff4d00] text-white shadow-sm' : 'bg-white/5 text-white/50 border border-white/10'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={`truncate font-bold ${isFirst ? 'text-white text-base' : 'text-white/80 text-sm'}`}>
                          {winner}
                        </span>
                      </div>
                      {isFirst && (
                        <span className="text-[9px] font-black uppercase bg-[#ff4d00] text-white px-2.5 py-1 rounded-none tracking-widest shrink-0">
                          🏆 Winner
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
