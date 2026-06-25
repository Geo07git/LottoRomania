import React, { useState, useMemo, useEffect } from "react";
import { 
  LOTO_PRESETS, 
  generateMockHistory, 
  computeNumberStatistics, 
  predictLotoNumbers, 
  LotoGame,
  LotoDraw,
  LotoPreset
} from "./lotoData";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  RotateCcw, 
  Play, 
  Sliders, 
  Compass, 
  Calendar, 
  Hash, 
  Zap, 
  Info,
  CheckCircle2,
  ListFilter
} from "lucide-react";

interface LotoPredictorsTabProps {
  importedDraws?: Record<LotoGame, LotoDraw[]>;
  onDrawsUpdated?: (game: LotoGame, draws: LotoDraw[]) => void;
}

export const LotoPredictorsTab: React.FC<LotoPredictorsTabProps> = ({ 
  importedDraws, 
  onDrawsUpdated 
}) => {
  const [selectedGame, setSelectedGame] = useState<LotoGame>("loto649");
  const [modelWeights, setModelWeights] = useState({
    freq: 35,
    recency: 35,
    markov: 20,
    trend: 10
  });
  const [appliedWeights, setAppliedWeights] = useState({
    freq: 35,
    recency: 35,
    markov: 20,
    trend: 10
  });
  const [isRecalculating, setIsRecalculating] = useState(false);

  const hasChanges = useMemo(() => {
    return (
      modelWeights.freq !== appliedWeights.freq ||
      modelWeights.recency !== appliedWeights.recency ||
      modelWeights.markov !== appliedWeights.markov ||
      modelWeights.trend !== appliedWeights.trend
    );
  }, [modelWeights, appliedWeights]);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setAppliedWeights(modelWeights);
      setIsRecalculating(false);
    }, 650);
  };

  const handleResetWeights = () => {
    const defaults = { freq: 35, recency: 35, markov: 20, trend: 10 };
    setModelWeights(defaults);
    setAppliedWeights(defaults);
  };

  // Auto-update applied weights when selectedGame changes to keep it seamless
  useEffect(() => {
    setAppliedWeights(modelWeights);
  }, [selectedGame]);

  const preset = LOTO_PRESETS[selectedGame];
  
  // Choose correct source of draws: imported files or preset fallback sampleDraws
  const activeDraws = useMemo(() => {
    if (importedDraws && importedDraws[selectedGame] && importedDraws[selectedGame].length > 0) {
      return importedDraws[selectedGame];
    }
    return preset.sampleDraws;
  }, [importedDraws, selectedGame, preset]);

  // Compute stats based on current histories
  const stats = useMemo(() => {
    return computeNumberStatistics(activeDraws, preset.totalNumbers);
  }, [activeDraws, preset]);

  // Derive top hot/cold numbers
  const hotNumbers = useMemo(() => {
    return [...stats].sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  }, [stats]);

  const coldNumbers = useMemo(() => {
    return [...stats]
      .filter(x => x.frequency > 0)
      .sort((a, b) => b.lastDrawnGaps - a.lastDrawnGaps)
      .slice(0, 5);
  }, [stats]);

  // Make prediction
  const predictionResult = useMemo(() => {
    // Normalise weights to sum to 1.0
    const totalWeights = appliedWeights.freq + appliedWeights.recency + appliedWeights.markov + appliedWeights.trend || 1;
    const normWeights = {
      freq: appliedWeights.freq / totalWeights,
      recency: appliedWeights.recency / totalWeights,
      markov: appliedWeights.markov / totalWeights,
      trend: appliedWeights.trend / totalWeights
    };
    return predictLotoNumbers(activeDraws, preset, normWeights);
  }, [activeDraws, preset, appliedWeights]);

  return (
    <div className="space-y-6" id="predictions-engine">
      {/* Target Game Switcher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(Object.keys(LOTO_PRESETS) as LotoGame[]).map((key) => {
          const game = LOTO_PRESETS[key];
          const isActive = selectedGame === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedGame(key)}
              id={`game-selector-${key}`}
              className={`p-4 border text-left cursor-pointer transition-all duration-300 relative group flex flex-col justify-between rounded-md ${
                isActive 
                  ? "bg-[#18181A] border-[#FF6B00] shadow-md shadow-[#FF6B00]/5" 
                  : "bg-[#0A0A0B] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <span className="text-[10px] font-mono tracking-wider uppercase text-white/50">
                  {game.country}
                </span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
                )}
              </div>
              <div className="mt-2">
                <h3 className="font-extrabold text-lg text-white font-mono tracking-tight group-hover:text-[#FF6B00] transition-colors">
                  {game.name}
                </h3>
                <p className="text-xs text-white/40 mt-1 line-clamp-1">{game.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ML Configuration Panel & Next Draw Prediction */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main ML Prediction Hero Card */}
          <div className="bg-[#121214] border border-[#FF6B00]/20 rounded-lg p-6 relative overflow-hidden" id="loto-hero-card">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                  <Zap className="w-3.5 h-3.5 animate-pulse" /> ENGINE PREZENT
                </span>
                <h2 className="text-2xl font-black uppercase text-white font-mono leading-none tracking-tight">
                  {preset.name} Proiecție
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono uppercase text-white/40 block">Scor Încredere</span>
                <span className="text-2xl font-black font-mono text-[#FF6B00]">
                  {predictionResult.confidence}%
                </span>
              </div>
            </div>

            {/* Huge Glowing Numbers Grid of Projected Numbers */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono tracking-[0.25em] text-white/45 block uppercase">
                🎯 COMBINAȚIE OPTIMĂ PREZISĂ DE MODEL:
              </span>
              <div className="relative min-h-[56px] md:min-h-[64px]">
                <AnimatePresence mode="wait">
                  {isRecalculating && (
                    <motion.div 
                      key="recalc-loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#121214]/80 backdrop-blur-[2px] flex items-center justify-center z-10 gap-2 rounded border border-[#FF6B00]/10"
                    >
                      <Zap className="w-5 h-5 text-[#FF6B00] animate-bounce" />
                      <span className="text-xs font-mono text-white/90 font-bold uppercase tracking-wider animate-pulse">
                        RULARE ALGORITM ML...
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`flex flex-wrap gap-2.5 transition-all duration-300 ${isRecalculating ? "blur-[3px] scale-98 select-none" : ""}`}>
                  {predictionResult.predicted.map((num) => {
                    const wasJustDrawn = activeDraws[0]?.numbers.includes(num);
                    return (
                      <div 
                        key={num} 
                        className={`w-12 h-12 md:w-14 md:h-14 flex flex-col items-center justify-center font-bold font-mono border text-lg md:text-xl transition-all duration-300 relative group rounded-md ${
                          wasJustDrawn 
                            ? "bg-[#FF6B00]/15 border-[#FF6B00] text-white" 
                            : "bg-[#1C1C1E] border-white/15 text-white/90 hover:border-white/40"
                        }`}
                      >
                        <span>{num}</span>
                        {wasJustDrawn && (
                          <span className="absolute bottom-0.5 text-[8px] font-sans text-[#FF6B00] leading-none uppercase tracking-widest scale-90 font-semibold mb-0.5">
                            Ultim
                          </span>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Visual extra ball for the Bonus system (Numerone / Putto B fields) */}
                  {predictionResult.bonusPredicted !== undefined && (
                    <div className="w-12 h-12 md:w-14 md:h-14 flex flex-col items-center justify-center border bg-gradient-to-br from-[#FF6B00] to-amber-600 border-[#FF6B00] text-white font-bold font-mono text-lg md:text-xl relative rounded-md shadow-lg shadow-[#FF6B00]/20">
                      <span>{predictionResult.bonusPredicted}</span>
                      <span className="absolute bottom-0.5 text-[8px] leading-none font-sans uppercase tracking-widest scale-90 font-bold mb-0.5">
                        Bonus
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Database File Status */}
            <div className="mt-8 pt-5 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11.5px] text-white/50 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Ultima extragere din istoric: </span>
                {activeDraws.length > 0 ? (
                  <span className="font-bold text-white/95">{activeDraws[0]?.round} ({activeDraws[0]?.date})</span>
                ) : (
                  <span className="font-bold text-red-400">Nicio runda gasita in CSV</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 uppercase font-mono">Sursă Model:</span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] font-bold">
                  {selectedGame === "loto649" ? "Loto6_49.csv" : selectedGame === "joker" ? "Loto5_45.csv" : "Loto5_40.csv"}
                </span>
              </div>
            </div>
          </div>

          {/* Model Weights Adjustments Customizer */}
          <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5">
            <div className="flex items-start gap-2.5 mb-5">
              <Sliders className="w-5 h-5 text-[#FF6B00] mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  PONDERILE DE CALCUL ALE MODELULUI ML
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  Ajustează coeficienții algoritmului matematic pentru a recalcula instant prognozele optime.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white/60">📈 Frecvență Istorică Extinsă</span>
                  <span className="text-[#FF6B00] font-bold">{modelWeights.freq}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={modelWeights.freq}
                  onChange={(e) => setModelWeights(prev => ({ ...prev, freq: parseInt(e.target.value) }))}
                  className="w-full accent-[#FF6B00] bg-white/10 h-1 rounded-none outline-none" 
                />
                <span className="text-[10px] text-white/35 font-mono block">Scanează aparițiile agregate de lungă durată</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white/60">⏳ Pauză/Gaps (Overdue Numbers)</span>
                  <span className="text-[#FF6B00] font-bold">{modelWeights.recency}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={modelWeights.recency}
                  onChange={(e) => setModelWeights(prev => ({ ...prev, recency: parseInt(e.target.value) }))}
                  className="w-full accent-[#FF6B00] bg-white/10 h-1 rounded-none outline-none" 
                />
                <span className="text-[10px] text-white/35 font-mono block">Favorizează numerele care au lipsit cel mai mult</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white/60">🔗 Matrice de Tranziție Markov</span>
                  <span className="text-[#FF6B00] font-bold">{modelWeights.markov}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={modelWeights.markov}
                  onChange={(e) => setModelWeights(prev => ({ ...prev, markov: parseInt(e.target.value) }))}
                  className="w-full accent-[#FF6B00] bg-white/10 h-1 rounded-none outline-none" 
                />
                <span className="text-[10px] text-white/35 font-mono block">Calculează probabilitatea condiționată de runda precedentă</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white/60">🔥 Momentum & Tendință Recentă</span>
                  <span className="text-[#FF6B00] font-bold">{modelWeights.trend}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={modelWeights.trend}
                  onChange={(e) => setModelWeights(prev => ({ ...prev, trend: parseInt(e.target.value) }))}
                  className="w-full accent-[#FF6B00] bg-white/10 h-1 rounded-none outline-none" 
                />
                <span className="text-[10px] text-white/35 font-mono block">Cântărește recurența agresivă în ultimele 10 extrageri</span>
              </div>
            </div>

            {/* Indicator modification alerts */}
            {hasChanges && (
              <div className="mt-5 p-3 bg-[#FF6B00]/5 border border-[#FF6B00]/20 text-[11px] text-white/80 font-mono text-center flex items-center justify-center gap-2 rounded">
                <Info className="w-3.5 h-3.5 text-[#FF6B00] animate-bounce" />
                <span>Ponderile au fost modificate. Apasă pe „Recalculează Proiecția” pentru a rula modelul!</span>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                onClick={handleResetWeights}
                className="px-4 py-2 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs font-mono font-bold transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer rounded"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reinițializare
              </button>

              <button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className={`px-5 py-2.5 font-mono font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 rounded cursor-pointer ${
                  isRecalculating 
                    ? "bg-[#1C1C1E] text-white/40 border border-white/10 cursor-not-allowed"
                    : hasChanges
                      ? "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 shadow-md shadow-[#FF6B00]/25 border border-[#FF6B00] animate-pulse"
                      : "bg-[#18181A] border border-[#FF6B00]/40 text-white hover:bg-[#FF6B00]/10"
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${isRecalculating ? "animate-spin" : ""}`} />
                {isRecalculating ? "Se Recalculează..." : "Recalculează Proiecția"}
              </button>
            </div>
          </div>
        </div>

        {/* Hot / Cold Metrics & Historic Tables */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Hot and Cold Visualizer */}
          <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5">
            <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#FF6B00]" /> SEGMENTĂRI HOT & COLD (TOP 5)
            </h3>
            
            <div className="space-y-4">
              {/* Hot Section */}
              <div className="bg-[#121214] p-3.5 border-l-2 border-[#FF6B00] border-y border-r border-white/5">
                <span className="text-[9px] font-mono tracking-widest text-[#FF6B00] block uppercase font-bold mb-2">
                  🔥 Cele Mai Frecvente (Hottest)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hotNumbers.map(h => (
                    <div key={h.num} className="bg-[#1D1C1F] border border-white/10 px-2 py-1 flex items-center gap-2 text-xs font-mono rounded">
                      <span className="font-bold text-white">{h.num}</span>
                      <span className="text-[10px] text-white/40 font-semibold">({h.frequency}x)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cold Section */}
              <div className="bg-[#121214] p-3.5 border-l-2 border-cyan-500 border-y border-r border-white/5">
                <span className="text-[9px] font-mono tracking-widest text-cyan-400 block uppercase font-bold mb-2">
                  ❄️ Cele Mai Întârziate (Coldest)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {coldNumbers.map(c => (
                    <div key={c.num} className="bg-[#1D1C1F] border border-white/10 px-2 py-1 flex items-center gap-2 text-xs font-mono rounded">
                      <span className="font-bold text-white">{c.num}</span>
                      <span className="text-[10px] text-cyan-400 font-semibold">{c.lastDrawnGaps} draw-gaps</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Historic Draws Table */}
          <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5 flex-1 flex flex-col overflow-hidden max-h-[400px]">
            <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-[#FF6B00]" /> LISTĂ ISTORIC EXTRACT (LIVE)
            </h3>
            <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
              {activeDraws.slice(0, 15).map((draw, idx) => {
                return (
                  <div 
                    key={idx} 
                    className="p-2.5 bg-[#121214] hover:bg-[#18181A] transition-colors border border-white/5 flex items-center justify-between gap-1 rounded"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-white/80">{draw.round}</span>
                      <span className="text-[8px] font-mono text-white/30">{draw.date}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 overflow-x-auto max-w-[70%]">
                      {draw.numbers.map((n, nIdx) => (
                        <span 
                          key={nIdx} 
                          className="w-5.5 h-5.5 shrink-0 flex items-center justify-center bg-white/5 border border-white/10 font-mono text-[10px] font-bold text-white/90 rounded-sm"
                        >
                          {n}
                        </span>
                      ))}
                      {draw.bonus && (
                        <span className="w-5.5 h-5.5 shrink-0 flex items-center justify-center bg-[#FF6B00]/25 border border-[#FF6B00]/40 font-mono text-[10px] font-bold text-[#FF6B00] rounded-sm">
                          {draw.bonus}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
