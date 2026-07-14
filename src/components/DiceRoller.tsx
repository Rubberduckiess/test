import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, RefreshCw, Copy, Sparkles } from 'lucide-react';
import { DiceSettings, DiceType } from '../types';
import { playClick, playRoll, playSuccess } from '../utils/audio';

interface DiceRollerProps {
  onAddHistory: (results: string[], summary: string) => void;
}

const DICE_TYPES: { type: DiceType; label: string }[] = [
  { type: 4, label: 'D4' },
  { type: 6, label: 'D6' },
  { type: 8, label: 'D8' },
  { type: 10, label: 'D10' },
  { type: 12, label: 'D12' },
  { type: 20, label: 'D20' },
  { type: 100, label: 'D100' },
];

export const DiceRoller: React.FC<DiceRollerProps> = ({ onAddHistory }) => {
  const [settings, setSettings] = useState<DiceSettings>({
    diceType: 6,
    customSides: 5,
    isCustom: false,
    count: 2,
  });

  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Temporary rolling numbers for continuous visual feedback
  const [rollFeedback, setRollFeedback] = useState<number[]>([]);

  const handleRoll = () => {
    playClick();
    setIsRolling(true);
    setCopied(false);

    const maxSides = settings.isCustom ? settings.customSides : settings.diceType;
    const duration = 600;
    playRoll(duration);

    // Animate numbers spinning
    const interval = setInterval(() => {
      setRollFeedback(
        Array.from({ length: settings.count }, () => Math.floor(Math.random() * maxSides) + 1)
      );
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      const generated = Array.from(
        { length: settings.count },
        () => Math.floor(Math.random() * maxSides) + 1
      );

      setResults(generated);
      setIsRolling(false);
      playSuccess();

      const summary = `Roll ${settings.count}x ${settings.isCustom ? `D${settings.customSides} (Custom)` : `D${settings.diceType}`}`;
      onAddHistory(generated.map(String), summary);
    }, duration);
  };

  const copyToClipboard = () => {
    if (results.length === 0) return;
    playClick();
    const sum = results.reduce((a, b) => a + b, 0);
    navigator.clipboard.writeText(`Rolls: [${results.join(', ')}] | Total Sum: ${sum}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentMaxSides = settings.isCustom ? settings.customSides : settings.diceType;

  // Helper to render die shapes based on sides
  const renderDieSVG = (val: number, sides: number) => {
    // Return custom shapes based on die type
    let polygonPoints = "20,5 35,35 5,35"; // D4 triangle default
    if (sides === 6) polygonPoints = "5,5 35,5 35,35 5,35"; // Square
    else if (sides === 8) polygonPoints = "20,2 38,20 20,38 2,20"; // Diamond
    else if (sides === 10) polygonPoints = "20,2 37,12 30,35 10,35 3,12"; // Pentagon/Kite
    else if (sides === 12) polygonPoints = "20,2 35,10 35,30 20,38 5,30 5,10"; // Hexagon
    else if (sides === 20) polygonPoints = "20,2 38,10 38,30 20,38 2,30 2,10"; // Hexagon
    else polygonPoints = "20,2 38,15 32,38 8,38 2,15"; // Octagon/Rounded

    return (
      <svg className="w-16 h-16 drop-shadow-md overflow-visible" viewBox="0 0 40 40">
        <polygon
          points={polygonPoints}
          className="fill-black stroke-[#ff4d00] stroke-2 transition-all duration-200"
        />
        <text
          x="20"
          y="24"
          textAnchor="middle"
          className="font-mono font-black fill-white text-[13px] tracking-tighter"
        >
          {val}
        </text>
      </svg>
    );
  };

  const sumTotal = results.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6" id="dice-roller-section">
      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0c0c0c] p-6 border border-white/10 rounded-none shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-[0.2em]">
            <Sliders className="w-4 h-4 text-[#ff4d00]" />
            <span>Select Die Type</span>
          </div>

          {/* Standard Dice Type Selectors */}
          <div className="grid grid-cols-4 gap-2">
            {DICE_TYPES.map((die) => (
              <button
                key={die.type}
                onClick={() => {
                  playClick();
                  setSettings({ ...settings, diceType: die.type, isCustom: false });
                }}
                className={`py-2 px-1 border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 rounded-none ${
                  !settings.isCustom && settings.diceType === die.type
                    ? 'bg-white border-white text-black font-black scale-105 shadow-md'
                    : 'bg-[#111111] border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                }`}
              >
                <span className="text-xs uppercase font-extrabold">{die.label}</span>
                <span className="text-[9px] opacity-70 font-mono">{die.type} sides</span>
              </button>
            ))}

            {/* Custom Sides Button */}
            <button
              onClick={() => {
                playClick();
                setSettings({ ...settings, isCustom: true });
              }}
              className={`py-2 px-1 border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 rounded-none ${
                settings.isCustom
                  ? 'bg-white border-white text-black font-black scale-105 shadow-md'
                  : 'bg-[#111111] border-white/10 text-white/50 hover:border-white/30 hover:text-white'
              }`}
            >
              <span className="text-xs uppercase font-extrabold">Custom</span>
              <span className="text-[9px] opacity-70 font-mono">D{settings.customSides}</span>
            </button>
          </div>

          {/* Custom Sides Input */}
          {settings.isCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#111111] border border-white/10 p-3 rounded-none space-y-2"
            >
              <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-widest">Number of Sides</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="2"
                  max="10000"
                  value={settings.customSides}
                  onChange={(e) => {
                    const val = Math.max(2, parseInt(e.target.value) || 2);
                    setSettings({ ...settings, customSides: val });
                  }}
                  className="w-full bg-[#111111] border border-white/15 text-white font-mono text-sm px-4 py-2 rounded-none focus:outline-none focus:border-[#ff4d00]"
                />
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold shrink-0">Sides (2-10k)</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] text-white/40 block uppercase font-bold tracking-widest">How many dice to roll?</label>
              <span className="font-mono font-bold text-white bg-[#ff4d00] px-2 py-0.5 rounded-none text-xs">
                {settings.count}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={settings.count}
              onChange={(e) => {
                playClick();
                setSettings({ ...settings, count: parseInt(e.target.value) });
              }}
              className="w-full accent-[#ff4d00] bg-white/10 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">
              <span>1 Die</span>
              <span>10 Dice</span>
              <span>20 Dice</span>
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="w-full bg-white text-black hover:bg-[#ff4d00] hover:text-white disabled:bg-white/20 disabled:text-white/40 font-black uppercase tracking-[0.2em] py-3.5 px-4 rounded-none transition-all duration-200 flex items-center justify-center gap-2 select-none"
            >
              <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
              <span>{isRolling ? 'Shaking Dice...' : `Roll ${settings.count}x Dice`}</span>
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
              {settings.isCustom ? `Custom D${settings.customSides}` : `${settings.diceType}-Sided Rolls`}
            </h3>
          </div>
          {results.length > 0 && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 px-3 py-2 rounded-none transition-all duration-200"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Results'}</span>
            </button>
          )}
        </div>

        {/* Generated Dice Grid */}
        <div className="flex-1 flex flex-wrap gap-4 items-center justify-center py-4 z-10 max-h-[220px] overflow-y-auto custom-scrollbar">
          {results.length === 0 && !isRolling ? (
            <p className="text-white/30 text-center font-bold uppercase tracking-wider text-xs my-auto">
              Select die sides, quantity, and click "Roll Dice" to roll.
            </p>
          ) : isRolling ? (
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {rollFeedback.map((val, idx) => (
                <motion.div
                  key={`rolling-${idx}`}
                  animate={{
                    y: [0, -12, 4, -4, 0],
                    rotate: [0, 45, -45, 90, 0],
                  }}
                  transition={{
                    duration: 0.35,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="opacity-70"
                >
                  {renderDieSVG(val, currentMaxSides)}
                </motion.div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {results.map((val, idx) => (
                <motion.div
                  key={`settled-${idx}-${val}`}
                  initial={{ opacity: 0, scale: 0.1, rotate: -180, y: 30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                    delay: Math.min(idx * 0.03, 0.4),
                  }}
                  className="relative group cursor-pointer"
                >
                  {renderDieSVG(val, currentMaxSides)}
                  <div className="absolute inset-0 bg-[#ff4d00]/5 rounded-none filter blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Statistics Total Panel */}
        {results.length > 0 && !isRolling && (
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/40 z-10">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Min Roll</p>
                <p className="font-mono text-white text-sm font-bold">{Math.min(...results)}</p>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Max Roll</p>
                <p className="font-mono text-white text-sm font-bold">{Math.max(...results)}</p>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Avg Roll</p>
                <p className="font-mono text-white text-sm font-bold">
                  {(results.reduce((a, b) => a + b, 0) / results.length).toFixed(1)}
                </p>
              </div>
            </div>

            <div className="bg-[#ff4d00] text-white px-4 py-2 border-0 flex items-center gap-2 rounded-none shadow-[0_0_15px_rgba(255,77,0,0.3)]">
              <span className="text-[9px] font-black uppercase tracking-widest">Sum Total:</span>
              <span className="text-xl font-mono font-black">{sumTotal}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
