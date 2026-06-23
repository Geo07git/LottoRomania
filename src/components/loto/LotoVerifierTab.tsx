import React, { useState, useMemo } from "react";
import { LOTO_PRESETS, generateMockHistory, LotoDraw } from "./lotoData";
import { 
  FileSpreadsheet, 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  UploadCloud, 
  HelpCircle,
  FileText,
  Trash2,
  Check,
  Award
} from "lucide-react";

interface LotoVerifierTabProps {
  importedDraws: Record<"loto649" | "joker" | "loto540", LotoDraw[]>;
  importedFileNames: Record<"loto649" | "joker" | "loto540", string | null>;
  onDrawsUpdated: (game: "loto649" | "joker" | "loto540", draws: LotoDraw[], fileName: string | null) => void;
}

export const LotoVerifierTab: React.FC<LotoVerifierTabProps> = ({
  importedDraws,
  importedFileNames,
  onDrawsUpdated
}) => {
  // Database configurations
  const [activeGamePreset, setActiveGamePreset] = useState<"loto649" | "joker" | "loto540">("loto649");

  // Inputs
  const [userTicketString, setUserTicketString] = useState("5, 12, 19, 27, 36, 45");
  const [minMatches, setMinMatches] = useState(3);
  const [maxMatches, setMaxMatches] = useState(6);

  // Fallback preset database
  const presetDraws = useMemo(() => {
    return generateMockHistory(LOTO_PRESETS[activeGamePreset], 150);
  }, [activeGamePreset]);

  // Combined source of truth
  const customFileDraws = importedDraws[activeGamePreset];
  const targetDraws = customFileDraws && customFileDraws.length > 0 ? customFileDraws : presetDraws;
  const fileName = importedFileNames[activeGamePreset];

  // File parsing (supports dragging and standard uploads of JSON/CSV/Text arrays)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedFileName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        
        let loadedDraws: LotoDraw[] = [];

        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            loadedDraws = parsed;
          } else if (parsed.teams || parsed.gameLogs) {
            // Support for generic basketball format
            alert("Acesta pare un fișier Hoopmetrics baschet. Încărcați un fișier formatat Loto!");
            return;
          }
        } else {
          // Parse CSV or Text lines
          const lines = text.split("\n");
          lines.forEach((line, index) => {
            if (!line.trim() || index === 0 && line.toLowerCase().includes("round")) return; // skip header
            const parts = line.split(/[;,]/);
            if (parts.length >= 3) {
              const round = parts[0]?.trim() || `Runda #${index}`;
              const date = parts[1]?.trim() || "2026";
              // Parse remaining cells as ball numbers
              const numbers = parts.slice(2)
                .map(n => parseInt(n.trim()))
                .filter(n => !isNaN(n));

              if (numbers.length > 0) {
                loadedDraws.push({ round, date, numbers });
              }
            }
          });
        }

        if (loadedDraws.length > 0) {
          onDrawsUpdated(activeGamePreset, loadedDraws, uploadedFileName);
        } else {
          alert("Nu s-au putut converti rânduri valide din fișier. Asigurați-vă că fișierul este CSV și are formatul: Runda, Data, Număr1, Număr2...");
        }
      } catch (err) {
        alert("Eroare la parsarea fișierului: " + err);
      }
    };
    reader.readAsText(file);
  };

  const handleClearCustomFile = () => {
    onDrawsUpdated(activeGamePreset, [], null);
  };

  // Perform backtesting logic on matches
  const matchResults = useMemo(() => {
    // Parse user input ticket numbers
    const parsedUserNumbers = userTicketString
      .split(",")
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n));

    if (parsedUserNumbers.length === 0) return { counts: {}, totalMatches: 0, items: [] };

    const counts: Record<number, number> = {};
    for (let i = minMatches; i <= maxMatches; i++) {
      counts[i] = 0;
    }

    const matchedDrawsList: Array<{ draw: LotoDraw; count: number }> = [];
    let totalMatchesCount = 0;

    targetDraws.forEach(draw => {
      // Find intersection count between player ticket and historical drawn numbers
      const intersectCount = draw.numbers.filter(num => parsedUserNumbers.includes(num)).length;
      if (intersectCount >= minMatches && intersectCount <= maxMatches) {
        counts[intersectCount] = (counts[intersectCount] || 0) + 1;
        totalMatchesCount++;
        matchedDrawsList.push({ draw, count: intersectCount });
      }
    });

    return {
      counts,
      totalMatches: totalMatchesCount,
      items: matchedDrawsList.sort((a, b) => b.count - a.count)
    };
  }, [userTicketString, targetDraws, minMatches, maxMatches]);

  return (
    <div className="space-y-6" id="loto-verifier">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Verification Inputs & CSV Downloader Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5">
            <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-[#FF6B00]" /> ÎNCĂRCARE BAZĂ DE DATE EXTRAGERI
            </h3>

            {/* Simulated preset quick switch */}
            {/* Base database selector - ALWAYS VISIBLE */}
            <div className="space-y-3 mb-5">
              <span className="text-[10px] text-white/40 uppercase tracking-widest block font-mono">Bază De Date Activă:</span>
              <div className="grid grid-cols-3 gap-2">
                {(["loto649", "joker", "loto540"] as const).map((gameId) => {
                  const hasCustom = importedDraws[gameId] && importedDraws[gameId].length > 0;
                  return (
                    <button
                      key={gameId}
                      type="button"
                      onClick={() => setActiveGamePreset(gameId)}
                      className={`py-2 px-1 text-[10px] font-mono uppercase tracking-tight text-center border cursor-pointer transition-colors relative ${
                        activeGamePreset === gameId
                          ? "bg-[#FF6B00]/10 border-[#FF6B00] text-[#FF6B00] font-bold"
                          : "bg-white/5 border-white/5 hover:border-white/15 text-white/60"
                      }`}
                    >
                      <span>{LOTO_PRESETS[gameId].name.replace(" (România)", "")}</span>
                      {hasCustom && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" title="Fișier încărcat"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {fileName ? (
              <div className="mb-5 p-3.5 bg-gradient-to-r from-emerald-600/10 to-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs flex justify-between items-center rounded">
                <div className="flex items-center gap-2 text-left">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/40 font-mono uppercase tracking-[0.1em]">Bază Custom Activă:</span>
                    <span className="font-mono font-bold max-w-[180px] truncate">{fileName}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCustomFile}
                  className="p-1 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="mb-5 p-3 bg-white/[0.02] border border-white/5 text-white/40 text-[10px] rounded font-mono text-center">
                Se folosește baza de date implicită cu trageri pre-instalate (demo).
              </div>
            )}

            {/* Direct hidden selector for files */}
            <div className="border border-dashed border-white/15 bg-white/5 p-6 text-center cursor-pointer hover:bg-white/[0.08] hover:border-white/25 transition-all relative rounded-md">
              <UploadCloud className="w-8 h-8 text-white/30 mx-auto mb-2" />
              <span className="text-xs font-semibold text-white/80 block">Trage sau selectează un fișier</span>
              <span className="text-[10px] text-white/40 block mt-1 font-mono">Format acceptat: .csv, .json sau excel-style</span>
              <input 
                type="file" 
                accept=".csv, .json, .txt" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," 
                  + "Runda,Data,N1,N2,N3,N4,N5,N6\n"
                  + "Tragerea #4021,2026-06-21 18:30,5,12,19,27,36,45\n"
                  + "Tragerea #4020,2026-06-18 18:30,3,8,14,21,33,49\n"
                  + "Tragerea #4019,2026-06-14 18:30,1,10,22,26,39,42";
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "model_extrageri_loto.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="mt-3 w-full py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 rounded cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF6B00]" /> Descarcă Model CSV (Template)
            </button>
          </div>

          <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5">
            <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#FF6B00]" /> CONFIGURARE VARIANTĂ DE VERIFICAT
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-2 font-mono uppercase font-bold">
                  Numerele Tale jucate (separate prin virgulă)
                </label>
                <input 
                  type="text" 
                  value={userTicketString}
                  onChange={(e) => setUserTicketString(e.target.value)}
                  placeholder="Ex: 1, 3, 5, 8, 12, 19"
                  className="w-full bg-[#121214] border border-white/10 p-2.5 text-sm font-semibold font-mono text-white outline-none focus:border-[#FF6B00] rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-white/50 font-mono uppercase tracking-wide">Minim de Potriviri</span>
                  <input 
                    type="number" 
                    min={1} 
                    max={12} 
                    value={minMatches}
                    onChange={(e) => setMinMatches(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#121214] border border-white/10 p-2.5 text-xs font-mono font-bold text-white outline-none focus:border-[#FF6B00] rounded"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-white/50 font-mono uppercase tracking-wide">Maxim de Potriviri</span>
                  <input 
                    type="number" 
                    min={minMatches} 
                    max={12} 
                    value={maxMatches}
                    onChange={(e) => setMaxMatches(Math.max(minMatches, parseInt(e.target.value) || minMatches))}
                    className="w-full bg-[#121214] border border-white/10 p-2.5 text-xs font-mono font-bold text-white outline-none focus:border-[#FF6B00] rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Performance Outcome Columns */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5 flex flex-col flex-1">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-5 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-[#FF6B00]" /> ANALIZĂ REZULTATE BACKTESTING
                </h3>
                <p className="text-xs text-white/40 mt-1">
                  Evaluat pe un set total de <span className="text-white font-bold">{targetDraws.length}</span> extrageri istorice.
                </p>
              </div>
              <div className="px-3.5 py-1.5 bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-mono font-black uppercase tracking-tight">
                Hits total: {matchResults.totalMatches} ({Math.round((matchResults.totalMatches / targetDraws.length) * 1000) / 10}%)
              </div>
            </div>

            {/* Match breakdowns list matching Streamlit results display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Object.entries(matchResults.counts)
                .map(([matchCount, occurrences]) => ({
                  hits: parseInt(matchCount),
                  count: Number(occurrences)
                }))
                .sort((a, b) => b.hits - a.hits)
                .map(({ hits, count }) => {
                  const percentage = Math.round((count / targetDraws.length) * 100);
                  return (
                    <div key={hits} className="p-3.5 bg-[#121214] border border-white/5 rounded-md relative overflow-hidden">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-xs font-bold text-white">{hits} numere potrivite</span>
                        <span className="text-[#FF6B00] font-black text-sm">{count} ori</span>
                      </div>
                      
                      <div className="w-full bg-[#1C1C1E] h-1.5 mt-2.5 rounded-none relative">
                        <div 
                          className="bg-gradient-to-r from-[#FF6B00] to-amber-500 h-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-white/35 font-mono block mt-1">Rată succese: {percentage}%</span>
                    </div>
                  );
                })}
            </div>

            {/* Historical Draw detail triggers matches scroll */}
            {matchResults.items.length > 0 && (
              <div className="flex-1 flex flex-col overflow-hidden max-h-[280px]">
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-3">
                  📋 Lista draws cu potriviri în intervalul ({minMatches} - {maxMatches} numere):
                </span>
                
                <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
                  {matchResults.items.slice(0, 50).map(({ draw, count }) => (
                    <div 
                      key={draw.round} 
                      className="p-2.5 bg-[#121214] border border-white/5 flex items-center justify-between rounded"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono font-bold text-white">{draw.round}</span>
                        <span className="text-[8px] font-mono text-white/30">{draw.date}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mr-auto ml-10">
                        {draw.numbers.map((n, idx) => {
                          const isMatch = userTicketString.split(",").map(x => parseInt(x.trim())).includes(n);
                          return (
                            <span 
                              key={idx} 
                              className={`w-5 h-5 flex items-center justify-center font-mono text-[9px] font-bold rounded-sm border ${
                                isMatch 
                                  ? "bg-[#FF6B00] text-black border-[#FF6B00] shadow-sm" 
                                  : "bg-white/5 text-white/50 border-white/10"
                              }`}
                            >
                              {n}
                            </span>
                          );
                        })}
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-[#FF6B00]">
                          +{count} hits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
