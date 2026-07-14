import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Hash,
  Sliders,
  Dices,
  Coins,
  ListChecks,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { AppMode, HistoryItem } from './types';
import { IntegerGenerator } from './components/IntegerGenerator';
import { DecimalGenerator } from './components/DecimalGenerator';
import { DiceRoller } from './components/DiceRoller';
import { CoinFlipper } from './components/CoinFlipper';
import { DecisionPicker } from './components/DecisionPicker';
import { HistoryLog } from './components/HistoryLog';
import { setMute, playClick } from './utils/audio';

export default function App() {
  const [activeMode, setActiveMode] = useState<AppMode>('integer');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isMuted, setIsMutedState] = useState<boolean>(false);
  const [copiedQuickNum, setCopiedQuickNum] = useState<boolean>(false);
  const [quickNum, setQuickNum] = useState<number | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('rng_suite_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history from localStorage', e);
      }
    }

    const savedMute = localStorage.getItem('rng_suite_mute');
    if (savedMute) {
      const parsedMute = savedMute === 'true';
      setIsMutedState(parsedMute);
      setMute(parsedMute);
    }
  }, []);

  // Sync mute state changes
  const handleToggleMute = () => {
    const newState = !isMuted;
    setIsMutedState(newState);
    setMute(newState);
    localStorage.setItem('rng_suite_mute', String(newState));
    playClick();
  };

  const handleAddHistory = (results: string[], summary: string) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      mode: activeMode,
      summary,
      results,
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 50); // Keep last 50 items
      localStorage.setItem('rng_suite_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('rng_suite_history');
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('rng_suite_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Instant Single Roll Quick Tool
  const generateQuickNum = () => {
    playClick();
    const num = Math.floor(Math.random() * 100) + 1;
    setQuickNum(num);
    setCopiedQuickNum(false);

    // Save to history too!
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      mode: 'integer',
      summary: 'Quick Roll (1-100)',
      results: [String(num)],
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 50);
      localStorage.setItem('rng_suite_history', JSON.stringify(updated));
      return updated;
    });
  };

  const copyQuickNum = () => {
    if (quickNum === null) return;
    playClick();
    navigator.clipboard.writeText(String(quickNum));
    setCopiedQuickNum(true);
    setTimeout(() => setCopiedQuickNum(false), 2000);
  };

  const TABS = [
    { id: 'integer' as AppMode, label: 'Integer', icon: Hash, desc: 'Whole numbers' },
    { id: 'decimal' as AppMode, label: 'Decimal', icon: Sliders, desc: 'Precise floats' },
    { id: 'dice' as AppMode, label: 'Dice', icon: Dices, desc: 'RPG & board dice' },
    { id: 'coin' as AppMode, label: 'Coin', icon: Coins, desc: 'Binary coin flips' },
    { id: 'decision' as AppMode, label: 'Decision', icon: ListChecks, desc: 'Pick from list' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative overflow-x-hidden select-none" id="app-root">
      {/* Structural Grid Overlay Lines */}
      <div className="grid-line-vertical left-[4%] md:left-[8%]" />
      <div className="grid-line-vertical right-[4%] md:right-[8%]" />
      <div className="grid-line-horizontal top-20" />
      <div className="grid-line-horizontal bottom-20" />

      {/* Main Header */}
      <header className="border-b border-white/10 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-40 h-20 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#ff4d00] p-2 text-white font-black shadow-[0_0_15px_rgba(255,77,0,0.4)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline">
                <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
                  RNG
                </h1>
                <span className="text-[10px] text-white/40 font-mono ml-2 tracking-widest uppercase">
                  SYSTEM_V4.2
                </span>
              </div>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.3em]">
                High-Entropy Sequence Processor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Roll Indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-[#0c0c0c] p-1 border border-white/10">
              <button
                onClick={generateQuickNum}
                className="text-[10px] uppercase tracking-widest font-black px-3 py-1.5 bg-white text-black hover:bg-[#ff4d00] hover:text-white transition-all duration-200"
              >
                Quick 1-100
              </button>
              <AnimatePresence mode="popLayout">
                {quickNum !== null && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={copyQuickNum}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 cursor-pointer text-[#ff4d00] font-mono text-xs font-black transition-colors"
                    title="Click to copy"
                  >
                    <span>{quickNum}</span>
                    {copiedQuickNum ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleToggleMute}
              className={`p-2 border transition-all duration-200 ${
                isMuted
                  ? 'bg-rose-950/40 border-rose-800/40 text-rose-500 hover:bg-rose-950/60'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-8 z-10 relative">
        
        {/* Navigation Tabs */}
        <div className="bg-[#0c0c0c] p-1 border border-white/10 grid grid-cols-5 gap-1 select-none">
          {TABS.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClick();
                  setActiveMode(tab.id);
                }}
                className={`relative py-3.5 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer group ${
                  isActive ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                id={`tab-${tab.id}`}
              >
                <IconComponent
                  className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 transition-all duration-200 ${
                    isActive
                      ? 'text-[#ff4d00] scale-105'
                      : 'text-white/40 group-hover:text-white/80'
                  }`}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  {tab.label}
                </span>
                <span className="hidden md:inline text-[9px] uppercase tracking-wider font-medium opacity-50 mt-0.5">
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Layout with decorative sidebars */}
        <div className="flex gap-4 items-stretch">
          {/* Left Decorative Sidebar */}
          <div className="hidden xl:flex w-12 items-center justify-center shrink-0 border-r border-white/5 select-none py-4">
            <div className="sidebar-text">PSEUDO_RANDOM_GENERATION_SEQUENCE</div>
          </div>

          {/* Dynamic Content Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main active Generator Module */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMode}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeMode === 'integer' && (
                    <IntegerGenerator onAddHistory={handleAddHistory} />
                  )}
                  {activeMode === 'decimal' && (
                    <DecimalGenerator onAddHistory={handleAddHistory} />
                  )}
                  {activeMode === 'dice' && (
                    <DiceRoller onAddHistory={handleAddHistory} />
                  )}
                  {activeMode === 'coin' && (
                    <CoinFlipper onAddHistory={handleAddHistory} />
                  )}
                  {activeMode === 'decision' && (
                    <DecisionPicker onAddHistory={handleAddHistory} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* History Logger Panel */}
            <div className="lg:col-span-1">
              <HistoryLog
                history={history}
                onClearHistory={handleClearHistory}
                onRemoveItem={handleRemoveHistoryItem}
              />
            </div>
          </div>

          {/* Right Decorative Sidebar */}
          <div className="hidden xl:flex w-12 items-center justify-center shrink-0 border-l border-white/5 select-none py-4">
            <div className="sidebar-text" style={{ transform: 'rotate(0deg)' }}>
              LATENCY: 0.0004ms / ENTR: 0.982
            </div>
          </div>
        </div>
      </main>

      {/* Elegant Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-6 text-xs text-white/40 h-20 flex items-center z-10 relative">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-2">
            <span className="uppercase tracking-wider text-[10px] font-bold text-white/30">System Entropy:</span>
            <span className="font-mono bg-white/5 border border-white/10 text-white/60 px-2 py-0.5 rounded-none text-[10px]">
              crypto.getRandomValues
            </span>
          </p>
          <p className="text-[10px] uppercase tracking-wider font-bold text-white/30">
            Click on generated results to copy them instantly.
          </p>
        </div>
      </footer>
    </div>
  );
}
