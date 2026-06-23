import React, { useState, useMemo } from "react";
import { LOTO_PRESETS, generateMockHistory, computeNumberStatistics, LotoDraw } from "./lotoData";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from "recharts";
import { 
  BarChart3, 
  Activity, 
  PieChartIcon, 
  Award, 
  Eye, 
  Calendar,
  Grid
} from "lucide-react";

interface LotoStatsProTabProps {
  importedDraws?: Record<"loto649" | "joker" | "loto540", LotoDraw[]>;
}

export const LotoStatsProTab: React.FC<LotoStatsProTabProps> = ({ importedDraws }) => {
  const [activeGame, setActiveGame] = useState<"loto649" | "joker" | "loto540">("loto649");
  
  const preset = LOTO_PRESETS[activeGame];

  // Draw set for analysis
  const draws = useMemo(() => {
    if (importedDraws && importedDraws[activeGame] && importedDraws[activeGame].length > 0) {
      return importedDraws[activeGame];
    }
    return preset.sampleDraws;
  }, [preset, activeGame, importedDraws]);

  // Compute stats
  const stats = useMemo(() => {
    return computeNumberStatistics(draws, preset.totalNumbers);
  }, [draws, preset]);

  // Recharts format stats data
  const chartData = useMemo(() => {
    return stats.map(s => ({
      name: `#${s.num}`,
      frecvență: s.frequency,
      gaps: s.lastDrawnGaps,
      hotScore: s.hotScore
    }));
  }, [stats]);

  // 1. Even/Odd parity split calculations
  const parityDistribution = useMemo(() => {
    let oddTotal = 0;
    let evenTotal = 0;
    
    draws.forEach(d => {
      d.numbers.forEach(n => {
        if (n % 2 === 0) evenTotal++;
        else oddTotal++;
      });
    });

    const total = oddTotal + evenTotal || 1;
    return [
      { name: "Numere Pare", value: parseFloat(((evenTotal / total) * 100).toFixed(1)), count: evenTotal, color: "#FF6B00" },
      { name: "Numere Impare", value: parseFloat(((oddTotal / total) * 100).toFixed(1)), count: oddTotal, color: "#06B6D4" }
    ];
  }, [draws]);

  // 2. Consecutive Runs statistics
  // Count groups of numbers in draws that form runs: e.g. [3, 4] has run of size 2, [10, 11, 12] of size 3
  const runsStats = useMemo(() => {
    let size2 = 0;
    let size3 = 0;
    let size4OrMore = 0;

    draws.forEach(d => {
      const nums = [...d.numbers].sort((a,b)=>a-b);
      let streak = 1;
      let streaks: number[] = [];
      
      for (let i = 0; i < nums.length - 1; i++) {
        if (nums[i+1] === nums[i] + 1) {
          streak++;
        } else {
          if (streak > 1) streaks.push(streak);
          streak = 1;
        }
      }
      if (streak > 1) streaks.push(streak);

      streaks.forEach(s => {
        if (s === 2) size2++;
        else if (s === 3) size3++;
        else if (s >= 4) size4OrMore++;
      });
    });

    return [
      { label: "Run de 2 consecutive (ex. 12-13)", count: size2, color: "#FF6B00" },
      { label: "Run de 3 consecutive (ex. 2-3-4)", count: size3, color: "#E05A00" },
      { label: "Run de 4+ consecutive", count: size4OrMore, color: "#C4ced4" }
    ];
  }, [draws]);

  return (
    <div className="space-y-6" id="loto-stats-pro">
      
      {/* Target selector tab row */}
      <div className="flex bg-[#0A0A0B] border border-white/10 p-1.5 gap-2 rounded-lg">
        {(["loto649", "joker", "loto540"] as const).map((gameId) => (
          <button
            key={gameId}
            onClick={() => setActiveGame(gameId)}
            className={`flex-1 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer text-center rounded ${
              activeGame === gameId
                ? "bg-[#FF6B00] text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            {LOTO_PRESETS[gameId].name.replace(" (România)", "")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Frequencies Chart */}
        <div className="lg:col-span-8 bg-[#0A0A0B] border border-white/10 rounded-lg p-5 flex flex-col min-h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#FF6B00]" /> FRECVENȚĂ APARIȚIE TOTALE NUMERE (DRAFT MATRIX)
            </h3>
            <span className="text-[10px] font-mono text-white/45">Urmărit pe 100 extrageri</span>
          </div>

          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#4b5563" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121214", border: "1px solid rgba(255,107,0,0.25)" }}
                  labelStyle={{ color: "#fff", fontFamily: "monospace", fontSize: "11px" }}
                  itemStyle={{ color: "#FF6B00", fontFamily: "monospace", fontSize: "11px" }}
                />
                <Bar dataKey="frecvență" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.frecvență > 45 ? "#FF6B00" : entry.frecvență > 35 ? "#E56020" : "#a8a29e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Parity (Even/Odd) Pie Breakdown */}
        <div className="lg:col-span-4 bg-[#0A0A0B] border border-white/10 rounded-lg p-5 flex flex-col min-h-[380px]">
          <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <PieChartIcon className="w-4.5 h-4.5 text-[#FF6B00]" /> PARITATE PARE vs IMPARE (%)
          </h3>

          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={parityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {parityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#121214", border:"none" }}
                    itemStyle={{ color: "#fff", fontFamily: "monospace", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center flex flex-col pointer-events-none">
                <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Balans</span>
                <span className="text-lg font-black font-mono text-white">50/50</span>
              </div>
            </div>

            <div className="w-full space-y-2 mt-4">
              {parityDistribution.map(item => (
                <div key={item.name} className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-white/60">{item.name}</span>
                  </div>
                  <span className="text-white font-bold">{item.value}% ({item.count} extrageri)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Consecutive Counts Runs list */}
        <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5">
          <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#FF6B00]" /> DISTRIBUȚIE ȘIRURI CONSECUTIVE (PATTERNS)
          </h3>
          <p className="text-xs text-white/40 mb-5">
            Numere consecutive potrivite de pe același bilet măsoară volatilitatea matematică a tragerilor.
          </p>

          <div className="space-y-3">
            {runsStats.map((item, index) => (
              <div key={index} className="p-3.5 bg-[#121214] border border-white/5 rounded">
                <div className="flex justify-between items-center font-mono text-xs mb-2">
                  <span className="text-white/75">{item.label}</span>
                  <span className="text-white font-bold">{item.count} apariții</span>
                </div>
                <div className="w-full bg-[#1C1C1E] h-1.5 rounded-none relative">
                  <div 
                    className="h-full rounded-none" 
                    style={{ 
                      backgroundColor: item.color, 
                      width: `${Math.min(100, Math.max(2, (item.count / 100) * 100))}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fast grid overview highlighting active hot and cold parameters */}
        <div className="bg-[#0A0A0B] border border-white/10 rounded-lg p-5">
          <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-[#FF6B00]" /> SELECȚIE RAPIDĂ FRECVENȚE APARIȚII (1-{preset.totalNumbers})
          </h3>
          <p className="text-xs text-white/40 mb-5">
            Legendă: <span className="text-[#FF6B00] font-bold">Fierbinte (&gt;45%)</span> | <span className="text-amber-500 font-bold">Mediu (&gt;35%)</span> | <span className="text-stone-400">Rece (&lt;35%)</span>
          </p>

          <div className="grid grid-cols-10 gap-1.5">
            {stats.map(s => {
              const isHot = s.percentage > 45;
              const isMed = s.percentage > 35;
              
              const colorBg = isHot 
                ? "bg-[#FF6B00] border-[#FF6B00] text-black" 
                : isMed 
                ? "bg-[#E56020]/25 border-[#E56020]/45 text-[#E56020]" 
                : "bg-white/5 border-white/5 text-white/55";

              return (
                <div 
                  key={s.num} 
                  title={`Frecvență: ${s.percentage}% | Gaps: ${s.lastDrawnGaps}`}
                  className={`p-1.5 border font-mono text-[10px] font-bold text-center rounded flex flex-col justify-center items-center aspect-square ${colorBg}`}
                >
                  <span>{s.num}</span>
                  <span className="text-[7px] leading-tight block opacity-60 font-medium">
                    {Math.round(s.percentage)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
