import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wand2, 
  Settings, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle, 
  ArrowRightLeft, 
  FileCheck, 
  Copy,
  AlertTriangle,
  Info
} from "lucide-react";

export const LotoGeneratorTab: React.FC = () => {
  // Inputs matching Streamlit parameters
  const [totalNumbers, setTotalNumbers] = useState(49);
  const [variantSize, setVariantSize] = useState(6);
  const [requiredCommon, setRequiredCommon] = useState(4);
  const [maxValidVariants, setMaxValidVariants] = useState(150);

  // Grid selection
  const [selectedPool, setSelectedPool] = useState<number[]>(() => {
    return Array.from({ length: 49 }, (_, i) => i + 1); // default 1 to 49
  });

  // State for calculated combinations
  const [generatedVariants, setGeneratedVariants] = useState<number[][]>([]);
  const [convertedVariants, setConvertedVariants] = useState<number[][]>([]);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  // State for manual checks
  const [extractedInput, setExtractedInput] = useState<string>("");
  const [validMatches, setValidMatches] = useState<number[][]>([]);
  const [hasCopied, setHasCopied] = useState<number | null>(null);

  // Grid Pool Available Numbers (e.g. 1 to 49, standard Romanian Loto)
  const availableNumbersGrid = useMemo(() => {
    return Array.from({ length: 49 }, (_, i) => i + 1);
  }, []);

  // Handler to toggle pool selection
  const handleToggleNumber = (num: number) => {
    setSelectedPool(prev => {
      if (prev.includes(num)) {
        return prev.filter(x => x !== num);
      } else {
        return [...prev, num].sort((a, b) => a - b);
      }
    });
  };

  // Helper algorithms: combination generator (optimized with lookahead limit to prevent UI lockup)
  const runGeneration = () => {
    const startTime = performance.now();
    
    // Generate subset combos iteratively up to threshold
    const chosenNumbers = selectedPool.length === totalNumbers 
      ? selectedPool 
      : Array.from({ length: totalNumbers }, (_, i) => i + 1);

    const variants: number[][] = [];
    const poolSize = chosenNumbers.length;

    // Fast combination-making loop targeting reduced cover wheels
    // We want combinations of size 'variantSize' from 'chosenNumbers' ensuring they don't overlap too much
    // Let's implement a heuristic wheel-builder that builds fast cover sets
    const attemptsLimit = 3000;
    let attempts = 0;

    while (variants.length < maxValidVariants && attempts < attemptsLimit) {
      attempts++;
      // Generate a candidate variant or shuffle
      const candidate: number[] = [];
      const tempPool = [...chosenNumbers];
      
      while (candidate.length < variantSize && tempPool.length > 0) {
        const randIdx = Math.floor(Math.random() * tempPool.length);
        candidate.push(tempPool[randIdx]);
        tempPool.splice(randIdx, 1);
      }
      candidate.sort((a, b) => a - b);

      // Verify that this candidate does not share >= requiredCommon values with any already selected variants
      const candidateSet = new Set(candidate);
      const isUnsatisfiedOverlap = variants.some((existing) => {
        const intersection = existing.filter(x => candidateSet.has(x));
        return intersection.length >= requiredCommon;
      });

      if (!isUnsatisfiedOverlap && candidate.length === variantSize) {
        variants.push(candidate);
      }
    }

    // fallback generator if we got zero variants due to rigid checks
    if (variants.length === 0) {
      // Just chunk them up or provide basic sequential sets
      for (let i = 0; i < Math.min(maxValidVariants, Math.floor(poolSize / variantSize)); i++) {
        const subset = chosenNumbers.slice(i * variantSize, (i + 1) * variantSize);
        if (subset.length === variantSize) {
          variants.push(subset);
        }
      }
    }

    const endTime = performance.now();
    
    setGeneratedVariants(variants);
    setConvertedVariants([]); // reset replacement
    setGenerationTime(parseFloat(((endTime - startTime) / 1000).toFixed(3)));
  };

  // Replace indices (1,2,3...) with real numbers user chose
  const handleReplaceNumbers = () => {
    if (generatedVariants.length === 0) return;
    if (selectedPool.length < totalNumbers) return;

    // map 1..totalNumbers indices to selectedPool values
    const numberMap: Record<number, number> = {};
    for (let i = 0; i < totalNumbers; i++) {
      numberMap[i + 1] = selectedPool[i];
    }

    const replaced = generatedVariants.map(v => {
      // If numbers in v are generic index bounds [1, totalNumbers], transform them.
      // Otherwise if they represent something else, we preserve.
      return v.map(idx => {
        return numberMap[idx] || idx;
      }).sort((a, b) => a - b);
    });

    setConvertedVariants(replaced);
  };

  // Verify list matches drawn ones
  const handleVerifyVariants = () => {
    if (!extractedInput) return;
    try {
      const drawn = extractedInput.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
      const targets = convertedVariants.length > 0 ? convertedVariants : generatedVariants;
      
      const matched = targets.filter(v => {
        const intersection = v.filter(num => drawn.includes(num));
        return intersection.length >= requiredCommon;
      });

      setValidMatches(matched);
    } catch (err) {
      alert("Introduceți numere valide, separate prin virgulă!");
    }
  };

  const handleCopyVariant = (variant: number[], index: number) => {
    navigator.clipboard.writeText(variant.join(", "));
    setHasCopied(index);
    setTimeout(() => setHasCopied(null), 2000);
  };

  return (
    <div className="space-y-6" id="loto-variant-generator">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls and Params Column (matching streamlit inputs) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5">
            <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-[#FF6B00]" /> SETĂRI ALGORITM GENERARE
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-2 font-mono uppercase font-bold">
                  Numărul total de numere (N pool-ul de bază)
                </label>
                <input 
                  type="number" 
                  min={5} 
                  max={50} 
                  value={totalNumbers}
                  onChange={(e) => setTotalNumbers(parseInt(e.target.value) || 20)}
                  className="w-full bg-[#121214] border border-white/10 p-2.5 text-sm font-semibold font-mono text-white outline-none focus:border-[#FF6B00] rounded"
                />
                <span className="text-[10px] text-white/35 font-mono mt-1 block">Numărul de baze selectate pentru a fi mixate</span>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2 font-mono uppercase font-bold">
                  Dimensiunea unei variante (K bilet size)
                </label>
                <input 
                  type="number" 
                  min={3} 
                  max={20} 
                  value={variantSize}
                  onChange={(e) => setVariantSize(parseInt(e.target.value) || 4)}
                  className="w-full bg-[#121214] border border-white/10 p-2.5 text-sm font-semibold font-mono text-white outline-none focus:border-[#FF6B00] rounded"
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2 font-mono uppercase font-bold">
                  Număr minim de numere comune (C overlap)
                </label>
                <input 
                  type="number" 
                  min={2} 
                  max={variantSize} 
                  value={requiredCommon}
                  onChange={(e) => setRequiredCommon(Math.min(variantSize, parseInt(e.target.value) || 2))}
                  className="w-full bg-[#121214] border border-white/10 p-2.5 text-sm font-semibold font-mono text-white outline-none focus:border-[#FF6B00] rounded"
                />
                <span className="text-[10px] text-white/35 font-mono mt-1 block">Garantează un maxim de overlap între oricare două variante generice</span>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2 font-mono uppercase font-bold">
                  Pragul maxim de variante de generat
                </label>
                <input 
                  type="number" 
                  min={1} 
                  max={1000} 
                  value={maxValidVariants}
                  onChange={(e) => setMaxValidVariants(parseInt(e.target.value) || 100)}
                  className="w-full bg-[#121214] border border-white/10 p-2.5 text-sm font-semibold font-mono text-white outline-none focus:border-[#FF6B00] rounded"
                />
              </div>

              {/* Run button */}
              <button
                onClick={runGeneration}
                className="w-full py-3 bg-[#FF6B00] text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 rounded"
              >
                <Wand2 className="w-4 h-4 fill-current" /> Generează variante generice
              </button>
            </div>
          </div>

          {/* Verification Module inside panel */}
          <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5">
            <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-cyan-400" /> VERIFICARE VARIANTE EXTRASE
            </h3>
            <div className="space-y-4">
              <textarea
                placeholder="Exemplu: 4, 7, 12, 19, 23 (separate prin virgulă)"
                value={extractedInput}
                onChange={(e) => setExtractedInput(e.target.value)}
                rows={2}
                className="w-full bg-[#121214] border border-white/10 p-2.5 text-xs font-mono text-white/90 outline-none focus:border-cyan-500 rounded resize-none"
              />
              <button
                onClick={handleVerifyVariants}
                className="w-full py-2 bg-transparent hover:bg-cyan-500/10 border border-cyan-500/50 hover:border-cyan-500 text-cyan-400 font-extrabold text-[11px] uppercase tracking-wider transition-all cursor-pointer rounded"
              >
                Verifică Câștigurile pe Variante
              </button>
            </div>
          </div>
        </div>

        {/* Visual Interactive Number Map Grid */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-[#FF6B00]" /> CONVERTITOR DE NUMERE REALE
                </h3>
                <p className="text-xs text-white/40 mt-1">
                  Alege exact <span className="text-[#FF6B00] font-bold">{totalNumbers}</span> numere preferate din grilă pentru a le injecta în variantele de pe bilet.
                </p>
              </div>
              <div className="px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-mono text-white/80">
                Selectate: <span className="font-extrabold text-[#FF6B00]">{selectedPool.length}</span> / {totalNumbers}
              </div>
            </div>

            {/* Interactive Grid Card */}
            <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-10 gap-1.5 p-3.5 bg-[#121214] border border-white/5 rounded">
              {availableNumbersGrid.map((num) => {
                const isSelected = selectedPool.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => handleToggleNumber(num)}
                    className={`aspect-square sm:p-2 border text-xs font-bold font-mono transition-all duration-200 cursor-pointer flex flex-col items-center justify-center rounded ${
                      isSelected 
                        ? "bg-[#FF6B00] border-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/15" 
                        : "bg-[#18181A] border-white/5 hover:border-white/20 text-white/70"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Grid Check warnings and mapping trigger trigger */}
            {selectedPool.length !== totalNumbers && (
              <div className="mt-4 p-3.5 bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs flex gap-2 rounded">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Te rugăm să selectezi exact {totalNumbers} numere pentru a activa înlocuirea! În prezent ai {selectedPool.length} selectate.
                </span>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <button
                disabled={selectedPool.length !== totalNumbers || generatedVariants.length === 0}
                onClick={handleReplaceNumbers}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all rounded cursor-pointer ${
                  selectedPool.length === totalNumbers && generatedVariants.length > 0
                    ? "bg-[#FF6B00] text-black hover:bg-white"
                    : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                }`}
              >
                Înlocuiește numerele generice (Convertire)
              </button>
              
              <button
                onClick={() => setSelectedPool([])}
                className="text-xs font-mono text-white/45 hover:text-white underline cursor-pointer"
              >
                Resetează Selecția Grilei
              </button>
            </div>
          </div>

          {/* Outcome Play List displaying tickets */}
          {(generatedVariants.length > 0) && (
            <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5 flex flex-col flex-1 overflow-hidden max-h-[380px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#FF6B00]" /> VARIANTE ACTUALE ({convertedVariants.length > 0 ? "CONVERTITE" : "GENERICE"})
                </h3>
                {generationTime !== null && (
                  <span className="text-[10px] font-mono text-white/40">
                    Gen timp: {generationTime} sec
                  </span>
                )}
              </div>

              {/* Horizontal / Vertical scrolllist containing generated variants */}
              <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
                {((convertedVariants.length > 0 ? convertedVariants : generatedVariants)).map((v, idx) => {
                  const isWinningPlay = validMatches.some(win => win.join(",") === v.join(","));
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 bg-[#121214] border flex items-center justify-between gap-4 transition-all duration-300 rounded ${
                        isWinningPlay 
                          ? "border-cyan-500/45 bg-[#121E24]/20 shadow-sm shadow-cyan-500/5" 
                          : "border-white/5 hover:bg-[#151517]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-white/40 font-bold shrink-0">
                          Var #{idx + 1}:
                        </span>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {v.map((element, eIdx) => (
                            <span 
                              key={eIdx} 
                              className={`px-2.5 py-1 text-xs font-bold font-mono transition-colors rounded ${
                                isWinningPlay 
                                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400" 
                                  : "bg-[#1C1C1E] border border-white/5 text-white/80"
                              }`}
                            >
                              {element}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyVariant(v, idx)}
                        className="text-white/40 hover:text-white p-1 cursor-pointer transition-colors"
                        title="Copiază varianta"
                      >
                        {hasCopied === idx ? (
                          <span className="text-[10px] font-mono text-[#FF6B00] font-bold">Copiat!</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Show matching results stats of backtest if validMatches populated */}
              {validMatches.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>S-au detectat <strong>{validMatches.length}</strong> variante câștigătoare conform filtrului minim setat!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
