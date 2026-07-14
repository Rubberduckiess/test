import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, Sliders } from 'lucide-react';
import { CoinStats } from '../types';
import { playClick, playCoinFlip, playSuccess } from '../utils/audio';

interface CoinFlipperProps {
  onAddHistory: (results: string[], summary: string) => void;
}

export const CoinFlipper: React.FC<CoinFlipperProps> = ({ onAddHistory }) => {
  const [count, setCount] = useState<number>(1);
  const [results, setResults] = useState<'Heads' | 'Tails'[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  
  // Accumulated session statistics
  const [stats, setStats] = useState<CoinStats>({ heads: 0, tails: 0, total: 0 });

  const handleFlip = () => {
    playClick();
    setIsFlipping(true);
    playCoinFlip();

    const duration = 800; // time for flip animation

    setTimeout(() => {
      const flips: ('Heads' | 'Tails')[] = Array.from({ length: count }, () =>
        Math.random() < 0.5 ? 'Heads' : 'Tails'
      );

      setResults(flips);
      
      // Update statistics
      const newHeads = flips.filter((f) => f === 'Heads').length;
      const newTails = flips.filter((f) => f === 'Tails').length;

      setStats((prev) => ({
        heads: prev.heads + newHeads,
        tails: prev.tails + newTails,
        total: prev.total + flips.length,
      }));

      setIsFlipping(false);
      playSuccess();

      const summary = `Flip ${count}x Coin${count > 1 ? 's' : ''}`;
      onAddHistory(flips, summary);
    }, duration);
  };

  const handleResetStats = () => {
    playClick();
    setStats({ heads: 0, tails: 0, total: 0 });
    setResults([]);
  };

  const headsPercentage = stats.total > 0 ? ((stats.heads / stats.total) * 100).toFixed(1) : '0.0';
  const tailsPercentage = stats.total > 0 ? ((stats.tails / stats.total) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6" id="coin-flipper-section">
      {/* Configuration & Session Stats Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0c0c0c] p-6 border border-white/10 rounded-none shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="space-y-4 justify-between flex flex-col">
          <div>
            <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-[0.2em] mb-3">
              <Sliders className="w-4 h-4 text-[#ff4d00]" />
              <span>Coin Configuration</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-white/40 block uppercase font-bold tracking-widest">How many coins to flip?</label>
                  <span className="font-mono font-bold text-white bg-[#ff4d00] px-2 py-0.5 rounded-none text-xs">
                    {count}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={count}
                  onChange={(e) => {
                    playClick();
                    setCount(parseInt(e.target.value));
                  }}
                  className="w-full accent-[#ff4d00] bg-white/10 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">
                  <span>1 Coin</span>
                  <span>5 Coins</span>
                  <span>10 Coins</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleFlip}
            disabled={isFlipping}
            className="w-full bg-white text-black hover:bg-[#ff4d00] hover:text-white disabled:bg-white/20 disabled:text-white/40 font-black uppercase tracking-[0.2em] py-3.5 px-4 rounded-none transition-all duration-200 flex items-center justify-center gap-2 select-none"
          >
            <RefreshCw className={`w-4 h-4 ${isFlipping ? 'animate-spin' : ''}`} />
            <span>{isFlipping ? 'Flipping Coins...' : `Flip ${count} Coin${count > 1 ? 's' : ''}`}</span>
          </button>
        </div>

        {/* Live session statistics */}
        <div className="bg-[#111111] border border-white/10 p-5 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.15em]">Session Statistics</span>
              {stats.total > 0 && (
                <button
                  onClick={handleResetStats}
                  className="text-[9px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/40 px-2.5 py-1.5 rounded-none transition-all duration-200"
                >
                  Reset Stats
                </button>
              )}
            </div>

            {stats.total === 0 ? (
              <p className="text-xs text-white/30 uppercase font-bold tracking-wider pt-2">No coins flipped in this session yet.</p>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-bold uppercase tracking-wider">Heads (🦅)</span>
                  <span className="font-mono font-bold text-[#ff4d00]">{stats.heads} / {stats.total} ({headsPercentage}%)</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-none overflow-hidden flex">
                  <div
                    style={{ width: `${headsPercentage}%` }}
                    className="bg-[#ff4d00] h-full transition-all duration-300"
                  />
                  <div
                    style={{ width: `${tailsPercentage}%` }}
                    className="bg-white h-full transition-all duration-300"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-bold uppercase tracking-wider">Tails (👑)</span>
                  <span className="font-mono font-bold text-white">{stats.tails} / {stats.total} ({tailsPercentage}%)</span>
                </div>
              </div>
            )}
          </div>

          {stats.total > 0 && (
            <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold text-right pt-3 border-t border-white/5 mt-3">
              Total flips: <span className="font-mono font-bold text-[#ff4d00]">{stats.total}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Display Area */}
      <div className="bg-[#0c0c0c] p-6 rounded-none text-white shadow-2xl border border-white/10 relative overflow-hidden min-h-[220px] flex flex-col justify-between">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff4d00]" />
            <h3 className="text-xs font-black tracking-[0.2em] text-white/50 uppercase">
              Coin Flip Result
            </h3>
          </div>
        </div>

        {/* Flipping Stage */}
        <div className="flex-1 flex flex-wrap gap-6 items-center justify-center py-4 z-10 max-h-[240px] overflow-y-auto custom-scrollbar">
          {results.length === 0 && !isFlipping ? (
            <p className="text-white/30 text-center font-bold uppercase tracking-wider text-xs my-auto">
              Configure parameters above and click "Flip Coin" to begin.
            </p>
          ) : isFlipping ? (
            <div className="flex flex-wrap gap-6 items-center justify-center">
              {Array.from({ length: count }).map((_, idx) => (
                <motion.div
                  key={`flipping-${idx}`}
                  animate={{
                    rotateY: [0, 360, 720, 1080, 1440],
                    scale: [1, 1.3, 1.4, 1.1, 1],
                    y: [0, -45, -60, -25, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeOut',
                  }}
                  className="w-20 h-20 rounded-full bg-black border-4 border-[#ff4d00] flex items-center justify-center text-[#ff4d00] shadow-[0_0_15px_rgba(255,77,0,0.4)]"
                >
                  <span className="font-mono font-black text-xl select-none">?</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {results.map((coin, idx) => {
                const isHeads = coin === 'Heads';
                return (
                  <motion.div
                    key={`settled-${idx}-${coin}-${stats.total}`}
                    initial={{ opacity: 0, scale: 0.1, rotateY: 180, y: 30 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 240,
                      damping: 16,
                      delay: Math.min(idx * 0.04, 0.4),
                    }}
                    className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 select-none relative group transition-transform hover:scale-105 shadow-md ${
                      isHeads
                        ? 'bg-black border-[#ff4d00] text-white shadow-[#ff4d00]/10'
                        : 'bg-[#111111] border-white text-white shadow-white/5'
                    }`}
                  >
                    <span className="text-2xl">{isHeads ? '🦅' : '👑'}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                      {coin}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Quick summary tally */}
        {results.length > 0 && !isFlipping && (
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-center gap-6 text-xs text-white/40 z-10 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#ff4d00]" />
              Heads: <strong className="text-white font-mono text-sm ml-1">{results.filter(c => c === 'Heads').length}</strong>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-white" />
              Tails: <strong className="text-white font-mono text-sm ml-1">{results.filter(c => c === 'Tails').length}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
