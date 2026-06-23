import React, { useState, useEffect } from "react";
import { LotoPredictorsTab } from "./LotoPredictorsTab";
import { LotoGeneratorTab } from "./LotoGeneratorTab";
import { LotoVerifierTab } from "./LotoVerifierTab";
import { LotoStatsProTab } from "./LotoStatsProTab";
import { LotoDraw } from "./lotoData";
import { motion, AnimatePresence } from "motion/react";
import { 
  Dices, 
  Layers, 
  FileSpreadsheet, 
  BarChart3, 
  HelpCircle, 
  Zap, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Award, 
  Compass,
  AlertOctagon,
  ChevronRight,
  RefreshCw,
  Database
} from "lucide-react";

export const LotoDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"about" | "predict" | "generate" | "verify" | "stats">("about");

  // Shared state of loaded custom draws per game style, so all tabs use the real data
  const [importedDraws, setImportedDraws] = useState<Record<"loto649" | "joker" | "loto540", LotoDraw[]>>({
    loto649: [],
    joker: [],
    loto540: []
  });

  const [importedFileNames, setImportedFileNames] = useState<Record<"loto649" | "joker" | "loto540", string | null>>({
    loto649: null,
    joker: null,
    loto540: null
  });

  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<Record<"loto649" | "joker" | "loto540", { loaded: boolean; count: number; error?: string; fileName: string } | null>>({
    loto649: null,
    joker: null,
    loto540: null
  });

  const parseLotoCSVClient = (content: string, gameId: "loto649" | "joker" | "loto540"): LotoDraw[] => {
    const lines = content.split(/\r?\n/);
    const draws: LotoDraw[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Skip headers
      if (i === 0 && (
        line.toLowerCase().includes("runda") || 
        line.toLowerCase().includes("data") || 
        line.toLowerCase().includes("n1")
      )) {
        continue;
      }

      const parts = line.includes(";") ? line.split(";") : line.split(",");
      if (parts.length < 3) continue;

      const round = parts[0].replace(/^["']|["']$/g, "").trim();
      const date = parts[1].replace(/^["']|["']$/g, "").trim();

      const numbers: number[] = [];
      for (let j = 2; j < parts.length; j++) {
        const cleaned = parts[j].replace(/^["']|["']$/g, "").trim();
        const num = parseInt(cleaned, 10);
        if (!isNaN(num)) {
          numbers.push(num);
        }
      }

      if (numbers.length >= 5) {
        if (gameId === "joker") {
          const mainNumbers = numbers.slice(0, 5);
          const bonusNumber = numbers[5] !== undefined ? numbers[5] : 1; 
          draws.push({
            round,
            date,
            numbers: mainNumbers,
            bonus: bonusNumber
          });
        } else {
          draws.push({
            round,
            date,
            numbers: numbers
          });
        }
      }
    }

    // Automat detectăm ordinea cronologică:
    // Aplicația se așteaptă ca indexul 0 să fie cea mai RECENTĂ extragere (nou -> vechi).
    // Dacă primul rând este mai vechi decât ultimul rând (cronologie ascendentă), inversăm vectorul automat!
    if (draws.length > 1) {
      const firstDate = new Date(draws[0].date).getTime();
      const lastDate = new Date(draws[draws.length - 1].date).getTime();

      let shouldReverse = false;
      if (!isNaN(firstDate) && !isNaN(lastDate)) {
        if (firstDate < lastDate) {
          shouldReverse = true;
        }
      } else {
        // Alternativă bazată pe numărul rundei dacă datele nu pot fi comparate
        const r1 = parseInt(draws[0].round.replace(/\D/g, ""), 10);
        const r2 = parseInt(draws[draws.length - 1].round.replace(/\D/g, ""), 10);
        if (!isNaN(r1) && !isNaN(r2) && r1 < r2) {
          shouldReverse = true;
        }
      }

      if (shouldReverse) {
        draws.reverse();
      }
    }

    return draws;
  };

  const fetchRealDraws = async () => {
    setIsLoadingRealData(true);
    setLoadError(null);
    
    const games = [
      { id: "loto649", file: "Loto6_49.csv", defaultFile: "/Loto6_49.csv" },
      { id: "joker", file: "Loto5_45.csv", defaultFile: "/Loto5_45.csv" },
      { id: "loto540", file: "Loto5_40.csv", defaultFile: "/Loto5_40.csv" }
    ] as const;

    const parsedDraws: Record<"loto649" | "joker" | "loto540", LotoDraw[]> = {
      loto649: [],
      joker: [],
      loto540: []
    };

    const parsedStatus: Record<"loto649" | "joker" | "loto540", { loaded: boolean; count: number; error?: string; fileName: string }> = {
      loto649: { loaded: false, count: 0, fileName: "Loto6_49.csv" },
      joker: { loaded: false, count: 0, fileName: "Loto5_45.csv" },
      loto540: { loaded: false, count: 0, fileName: "Loto5_40.csv" }
    };

    for (const game of games) {
      try {
        const res = await fetch(game.defaultFile);
        if (!res.ok) {
          throw new Error(`Nu s-a putut încărca fișierul (status ${res.status})`);
        }
        const text = await res.text();
        const parsed = parseLotoCSVClient(text, game.id);
        
        parsedDraws[game.id] = parsed;
        parsedStatus[game.id] = {
          loaded: true,
          count: parsed.length,
          fileName: game.file
        };
      } catch (err: any) {
        console.error(`Error loading CSV for ${game.id}:`, err);
        parsedStatus[game.id] = {
          loaded: false,
          count: 0,
          error: err.message || "Eroare la citire",
          fileName: game.file
        };
      }
    }

    setImportedDraws(parsedDraws);
    setImportedFileNames({
      loto649: parsedStatus.loto649.loaded ? parsedStatus.loto649.fileName : null,
      joker: parsedStatus.joker.loaded ? parsedStatus.joker.fileName : null,
      loto540: parsedStatus.loto540.loaded ? parsedStatus.loto540.fileName : null
    });
    setApiStatus(parsedStatus);
    setIsLoadingRealData(false);
  };

  useEffect(() => {
    fetchRealDraws();
  }, []);

  const handleDrawsUpdated = (game: "loto649" | "joker" | "loto540", draws: LotoDraw[], fileName: string | null) => {
    setImportedDraws(prev => ({
      ...prev,
      [game]: draws
    }));
    setImportedFileNames(prev => ({
      ...prev,
      [game]: fileName
    }));
  };

  const serverTime = new Date().toLocaleDateString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Bucharest"
  });

  return (
    <div className="bg-[#050506] min-h-screen text-white/90 font-sans" id="loto-master-dashboard">
      {/* Dynamic Header */}
      <div className="border-b border-white/5 bg-[#09090B] py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-amber-600 flex items-center justify-center text-black font-black text-xl rounded">
              🎲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black uppercase font-mono text-white tracking-tight leading-none italic">
                  LOTO ROMANIA 2026
                </h1>
                <span className="bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/25 text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                  AI PRO
                </span>
              </div>
              <p className="text-[10px] tracking-widest uppercase font-mono text-white/40 mt-1">
                Centru Analitic de Predicție și Modelare Combinatorică
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Database status badges */}
            <div className="flex flex-wrap gap-2 text-[10.5px] font-mono">
              {(["loto649", "joker", "loto540"] as const).map((g) => {
                const s = apiStatus[g];
                const label = g === "loto649" ? "Loto 6/49" : g === "joker" ? "Joker 5/45" : "Loto 5/40";
                const fileName = g === "loto649" ? "Loto6_49.csv" : g === "joker" ? "Loto5_45.csv" : "Loto5_40.csv";
                return (
                  <div key={g} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-black/40 border border-white/5 hover:border-white/10 transition-colors" title={`Servit automat din ${fileName}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s?.loaded ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-red-400 animate-pulse"}`}></span>
                    <span className="text-white/40">{label}:</span>
                    <span className="text-white/90 font-bold">{s?.loaded ? `${s.count} trageri` : "Eroare file"}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={fetchRealDraws}
              disabled={isLoadingRealData}
              className="flex items-center gap-1.5 text-[11px] font-mono hover:bg-white/10 text-white/70 hover:text-white bg-white/5 px-3.5 py-2 border border-white/5 rounded cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#FF6B00] ${isLoadingRealData ? "animate-spin" : ""}`} />
              <span>{isLoadingRealData ? "Se încarcă..." : "Sincronizează CSV"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation subheader matching Streamlit categories: INFO, PROJECTS, TOOLS, FINAL */}
      <div className="border-b border-white/5 bg-[#08080a] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-1">
          
          <button
            onClick={() => setActiveTab("about")}
            id="loto-tab-btn-about"
            className={`py-4 px-4.5 text-xs font-mono font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2 border-b-2 cursor-pointer shrink-0 ${
              activeTab === "about"
                ? "border-[#FF6B00] text-white"
                : "border-transparent text-white/45 hover:text-white/80"
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#FF6B00]" /> INFO / DESPRE
          </button>

          <button
            onClick={() => setActiveTab("predict")}
            id="loto-tab-btn-predict"
            className={`py-4 px-4.5 text-xs font-mono font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2 border-b-2 cursor-pointer shrink-0 ${
              activeTab === "predict"
                ? "border-[#FF6B00] text-white"
                : "border-transparent text-white/45 hover:text-white/80"
            }`}
          >
            <Zap className="w-4 h-4 text-[#FF6B00]" /> PREDICTII BETA (AI)
          </button>

          <button
            onClick={() => setActiveTab("generate")}
            id="loto-tab-btn-generate"
            className={`py-4 px-4.5 text-xs font-mono font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2 border-b-2 cursor-pointer shrink-0 ${
              activeTab === "generate"
                ? "border-[#FF6B00] text-white"
                : "border-transparent text-white/45 hover:text-white/80"
            }`}
          >
            <Dices className="w-4 h-4 text-[#FF6B00]" /> GENERARATOR VARIANTE
          </button>

          <button
            onClick={() => setActiveTab("verify")}
            id="loto-tab-btn-verify"
            className={`py-4 px-4.5 text-xs font-mono font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2 border-b-2 cursor-pointer shrink-0 ${
              activeTab === "verify"
                ? "border-[#FF6B00] text-white"
                : "border-transparent text-white/45 hover:text-white/80"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#FF6B00]" /> VERIFICARE CÂȘTIGURI
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            id="loto-tab-btn-stats"
            className={`py-4 px-4.5 text-xs font-mono font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2 border-b-2 cursor-pointer shrink-0 ${
              activeTab === "stats"
                ? "border-[#FF6B00] text-white"
                : "border-transparent text-white/45 hover:text-white/80"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#FF6B00]" /> ANALIZĂ EXTINSĂ PRO
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "about" && (
              <div className="space-y-6" id="loto-about-tab">
                {/* Intro Card */}
                <div className="p-6 bg-gradient-to-br from-[#121214] to-[#0A0A0B] border border-white/10 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight mb-4 flex items-center gap-2">
                    🎲 Bine ați venit în Loto Project Romania
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed max-w-4xl">
                    Acesta este un centru modular avansat de analiză statistică și predicție bazat pe inteligență artificială, dezvoltat special pentru optimizarea biletelor loto. Folosind algoritmi de probabilitate condiționată, frecvență adaptivă și matrice de tranziție Markov, aplicația te ajută să identifici conexiuni și tipare matematice în istoricul extragerilor.
                  </p>
                </div>

                {/* Grid model explanation cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#0A0A0B] border border-white/10 p-5 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#FF6B00] font-mono">MODEL 01</span>
                      <h3 className="text-base font-extrabold text-white font-mono uppercase mt-2">Frecvență &amp; Gaps</h3>
                      <p className="text-xs text-white/50 leading-relaxed mt-2">
                        Analizează aparițiile totale agregate ale fiecărei bile și cronometrează timpul de întârziere (gap-ul de extragere) pentru a evalua dacă un număr devine din punct de vedere statistic "overdue".
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-5 flex justify-between text-[11px] font-mono text-white/40">
                      <span>Metodă: Matematică</span>
                      <span className="text-[#FF6B00]">Gata de rulare</span>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0B] border border-white/10 p-5 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#FF6B00] font-mono">MODEL 02</span>
                      <h3 className="text-base font-extrabold text-white font-mono uppercase mt-2">Lanțuri Markov (2D)</h3>
                      <p className="text-xs text-white/50 leading-relaxed mt-2">
                        Verifică probabilitățile condiționate: ce bile tind să fie extrase imediat în runda t+1 în funcție de numerele active înregistrate la runda anterioară t.
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-5 flex justify-between text-[11px] font-mono text-white/40">
                      <span>Metodă: Probabilitate 2D</span>
                      <span className="text-[#FF6B00]">Gata de rulare</span>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0B] border border-white/10 p-5 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#FF6B00] font-mono">MODEL 03</span>
                      <h3 className="text-base font-extrabold text-white font-mono uppercase mt-2">Sisteme Combinatorice</h3>
                      <p className="text-xs text-white/50 leading-relaxed mt-2">
                        Permite generarea de variante reduse direct în browser. Algoritmii de reducere îți permit să joci sisteme complexe de până la 50 de numere în variante optimizate, cu garanții ridicate de câștig.
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-5 flex justify-between text-[11px] font-mono text-white/40">
                      <span>Metodă: Algebră liniară</span>
                      <span className="text-[#FF6B00]">Gata de rulare</span>
                    </div>
                  </div>
                </div>

                {/* Disclaimer Warning to be highly professional */}
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs flex gap-3 rounded-lg">
                  <AlertOctagon className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-white uppercase tracking-wider mb-1">⚠️ NOTĂ DE RESPONSABILITATE EXPERIMENTALĂ</h4>
                    <p className="leading-relaxed opacity-85">
                      Acest proiect este pur experimental și statistic. Modelele matematice și predictive nu garantează procentaje minime de câștiguri la tragerile loto oficiale. Jucați într-un mod controlat și matur de divertisment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "predict" && (
              <LotoPredictorsTab importedDraws={importedDraws} onDrawsUpdated={(game, draws) => handleDrawsUpdated(game, draws, importedFileNames[game])} />
            )}

            {activeTab === "generate" && (
              <LotoGeneratorTab />
            )}

            {activeTab === "verify" && (
              <LotoVerifierTab 
                importedDraws={importedDraws} 
                importedFileNames={importedFileNames} 
                onDrawsUpdated={handleDrawsUpdated} 
              />
            )}

            {activeTab === "stats" && (
              <LotoStatsProTab importedDraws={importedDraws} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer credits line */}
      <footer className="border-t border-white/5 py-8 mt-12 text-center text-[11px] font-mono text-white/30 bg-[#060608]">
        <p className="max-w-md mx-auto">This is one of georgeo07's projects. Re-engineered onto React and dynamic engine models in EEST timezone. ❤️</p>
      </footer>
    </div>
  );
};
