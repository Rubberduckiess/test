import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Trash2, Copy, Check, Clock } from 'lucide-react';
import { HistoryItem } from '../types';
import { playClick } from '../utils/audio';

interface HistoryLogProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({
  history,
  onClearHistory,
  onRemoveItem,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (item: HistoryItem) => {
    playClick();
    navigator.clipboard.writeText(item.results.join(', '));
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#0c0c0c] p-6 border border-white/10 rounded-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-full flex flex-col justify-between max-h-[640px]" id="history-log-section">
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#ff4d00]" />
            <h2 className="font-black text-white text-xs uppercase tracking-[0.2em]">Roll History</h2>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => {
                playClick();
                onClearHistory();
              }}
              className="text-[9px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/40 px-2.5 py-1.5 rounded-none transition-all duration-200 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        <div className="overflow-y-auto pr-1 space-y-3 max-h-[480px] custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-16 text-white/30 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-6 h-6 text-white/10 mx-auto mb-2" />
              <span>No generations yet. Spin a wheel, flip a coin, or roll a die to populate!</span>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#111111] border border-white/10 p-4 rounded-none relative group hover:border-white/20 transition-all duration-200"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white bg-[#ff4d00] px-2 py-0.5 rounded-none">
                        {item.mode}
                      </span>
                      <p className="text-xs font-bold text-white/90 mt-1.5">{item.summary}</p>
                    </div>
                    <span className="text-[9px] text-white/30 font-mono">{item.timestamp}</span>
                  </div>

                  {/* Generated results values formatted beautifully */}
                  <div className="mt-2 text-white font-mono text-sm font-bold truncate select-all">
                    {item.results.join(', ')}
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(item)}
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-none flex items-center gap-1 transition-all duration-200 ${
                        copiedId === item.id 
                          ? 'bg-green-600 text-white' 
                          : 'bg-[#ff4d00] text-white hover:bg-white hover:text-black'
                      }`}
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        playClick();
                        onRemoveItem(item.id);
                      }}
                      className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-rose-400 bg-white/5 hover:bg-rose-950/20 border border-white/10 hover:border-rose-800/40 px-2 py-1 rounded-none flex items-center gap-1 transition-all duration-200 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="pt-3 border-t border-white/10 text-[9px] text-white/30 font-bold uppercase tracking-widest text-center">
          Logged {history.length} operations.
        </div>
      )}
    </div>
  );
};
