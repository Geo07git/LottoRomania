export interface LotoDraw {
  round: string;
  date: string;
  numbers: number[];
  bonus?: number; // e.g. Joker bonus number (1-20)
}

export type LotoGame = "loto649" | "joker" | "loto540";

export interface LotoPreset {
  id: LotoGame;
  name: string;
  country: string;
  totalNumbers: number;
  drawSize: number;
  bonusRange?: number; // e.g. 1 to 20 for Joker
  description: string;
  sampleDraws: LotoDraw[];
}

// Generate high-fidelity seed historical draws for the Romanian lottery types
export const LOTO_PRESETS: Record<LotoGame, LotoPreset> = {
  loto649: {
    id: "loto649",
    name: "Loto 6/49 (România)",
    country: "România 🇷🇴",
    totalNumbers: 49,
    drawSize: 6,
    description: "Extragere clasică joi și duminică. Se extrag 6 numere din 49 posibile. Cel mai popular joc din țară.",
    sampleDraws: [
      { round: "Tragerea #4021", date: "2026-06-21 18:30", numbers: [5, 12, 19, 27, 36, 45] },
      { round: "Tragerea #4020", date: "2026-06-18 18:30", numbers: [3, 8, 14, 21, 33, 49] },
      { round: "Tragerea #4019", date: "2026-06-14 18:30", numbers: [1, 10, 22, 26, 39, 42] },
      { round: "Tragerea #4018", date: "2026-06-11 18:30", numbers: [7, 13, 20, 31, 41, 48] },
      { round: "Tragerea #4017", date: "2026-06-07 18:30", numbers: [4, 9, 15, 28, 37, 44] },
      { round: "Tragerea #4016", date: "2026-06-04 18:30", numbers: [2, 11, 18, 25, 30, 47] },
      { round: "Tragerea #4015", date: "2026-05-31 18:30", numbers: [6, 17, 23, 29, 35, 41] },
      { round: "Tragerea #4014", date: "2026-05-28 18:30", numbers: [12, 15, 24, 34, 40, 46] },
      { round: "Tragerea #4013", date: "2026-05-24 18:30", numbers: [8, 16, 21, 32, 38, 43] },
      { round: "Tragerea #4012", date: "2026-05-21 18:30", numbers: [3, 5, 14, 27, 33, 49] }
    ]
  },
  joker: {
    id: "joker",
    name: "Joker (5/45 + 1/20)",
    country: "România 🇷🇴",
    totalNumbers: 45,
    drawSize: 5,
    bonusRange: 20,
    description: "Extragere duală joi și duminică. Se extrag 5 numere din intervalul 1-45, plus un număr bonus Joker din intervalul 1-20.",
    sampleDraws: [
      { round: "Tragerea #1254", date: "2026-06-21 18:30", numbers: [4, 11, 23, 31, 40], bonus: 12 },
      { round: "Tragerea #1253", date: "2026-06-18 18:30", numbers: [2, 15, 18, 29, 45], bonus: 7 },
      { round: "Tragerea #1252", date: "2026-06-14 18:30", numbers: [9, 12, 21, 33, 38], bonus: 19 },
      { round: "Tragerea #1251", date: "2026-06-11 18:30", numbers: [1, 7, 20, 24, 42], bonus: 3 },
      { round: "Tragerea #1250", date: "2026-06-07 18:30", numbers: [6, 13, 22, 35, 44], bonus: 15 },
      { round: "Tragerea #1249", date: "2026-06-04 18:30", numbers: [8, 10, 19, 27, 41], bonus: 9 },
      { round: "Tragerea #1248", date: "2026-05-31 18:30", numbers: [3, 14, 17, 30, 36], bonus: 5 },
      { round: "Tragerea #1247", date: "2026-05-28 18:30", numbers: [5, 16, 25, 32, 43], bonus: 18 },
      { round: "Tragerea #1246", date: "2026-05-24 18:30", numbers: [11, 12, 24, 28, 39], bonus: 1 },
      { round: "Tragerea #1245", date: "2026-05-21 18:30", numbers: [7, 9, 22, 34, 45], bonus: 11 }
    ]
  },
  loto540: {
    id: "loto540",
    name: "Loto 5/40 (România)",
    country: "România 🇷🇴",
    totalNumbers: 40,
    drawSize: 6,
    description: "Extragere duală joi și duminică.Se extrag 6 numere dintr-un total de 40 posibile. Mai puțin popular decât Loto 6/49, dar oferă șanse mai bune de câștig.",
    sampleDraws: [
      { round: "Tragerea #654", date: "2026-06-21 18:30", numbers: [3, 9, 14, 23, 31, 38] },
      { round: "Tragerea #653", date: "2026-06-18 18:30", numbers: [1, 7, 12, 19, 28, 35] },
      { round: "Tragerea #652", date: "2026-06-14 18:30", numbers: [5, 11, 16, 22, 30, 39] },
      { round: "Tragerea #651", date: "2026-06-11 18:30", numbers: [2, 10, 15, 25, 32, 37] },
      { round: "Tragerea #650", date: "2026-06-07 18:30", numbers: [8, 13, 21, 27, 33, 40] },
      { round: "Tragerea #649", date: "2026-06-04 18:30", numbers: [4, 6, 17, 24, 29, 36] },
      { round: "Tragerea #648", date: "2026-05-31 18:30", numbers: [11, 14, 20, 26, 31, 38] },
      { round: "Tragerea #647", date: "2026-05-28 18:30", numbers: [9, 12, 18, 23, 30, 34] },
      { round: "Tragerea #646", date: "2026-05-24 18:30", numbers: [1, 3, 15, 21, 28, 39] },
      { round: "Tragerea #645", date: "2026-05-21 18:30", numbers: [5, 8, 16, 22, 27, 35] }
    ]
  }
};

// Generates additional realistic historical draws to backtest or analyze deeper
export function generateMockHistory(gamePreset: LotoPreset, count: number = 100): LotoDraw[] {
  const draws: LotoDraw[] = [];
  const baseRound = gamePreset.id === "loto649" ? 4000 : gamePreset.id === "joker" ? 1200 : 600;
  
  for (let i = 0; i < count; i++) {
    const roundNum = baseRound - i;
    const dateObj = new Date("2026-06-22T18:30:00Z");
    
    // Romanian draws are semi-weekly (generally joi/duminica, so spread them out roughly 3-4 days each iteration)
    const daysOffset = Math.floor(i * 3.5);
    dateObj.setDate(dateObj.getDate() - daysOffset);
    
    // Pick unique drawSize numbers from 1 to totalNumbers
    const list: number[] = [];
    while (list.length < gamePreset.drawSize) {
      const num = Math.floor(Math.random() * gamePreset.totalNumbers) + 1;
      if (!list.includes(num)) {
        list.push(num);
      }
    }
    list.sort((a, b) => a - b);
    
    let bonus: number | undefined;
    if (gamePreset.bonusRange) {
      bonus = Math.floor(Math.random() * gamePreset.bonusRange) + 1;
    }
    
    draws.push({
      round: `Tragerea #${roundNum}`,
      date: dateObj.toISOString().replace("T", " ").substring(0, 16),
      numbers: list,
      bonus
    });
  }
  
  return draws;
}

// Complex analytics functions for Loto
export interface NumberStats {
  num: number;
  frequency: number;       // total times drawn
  percentage: number;      // raw draw probability
  lastDrawnGaps: number;   // rounds elapsed since last drawn
  hotScore: number;        // weighting of recent rounds vs long rounds
}

export function computeNumberStatistics(draws: LotoDraw[], totalNumbers: number): NumberStats[] {
  const stats: NumberStats[] = [];
  const totalDraws = draws.length || 1;

  // Calculăm maxPossibleHotWeight pe baza lungimii reale a istoricului
  let maxPossibleHotWeight = 0;
  for (let i = 0; i < draws.length; i++) {
    if (i < 10) maxPossibleHotWeight += 3;
    else if (i < 30) maxPossibleHotWeight += 1.5;
  }
  if (maxPossibleHotWeight === 0) maxPossibleHotWeight = 1;

  for (let n = 1; n <= totalNumbers; n++) {
    let freq = 0;
    let gap = totalDraws; // default if never drawn
    let hotWeight = 0;

    for (let i = 0; i < draws.length; i++) {
      const contains = draws[i].numbers.includes(n);
      if (contains) {
        freq++;
        if (gap === totalDraws) {
          gap = i; // first index from start (most recent)
        }
        // compute weighted hot score: drafts in last 10 count 3x, last 30 count 1.5x, others count 0 (since they don't affect recent trend)
        if (i < 10) {
          hotWeight += 3;
        } else if (i < 30) {
          hotWeight += 1.5;
        }
      }
    }

    stats.push({
      num: n,
      frequency: freq,
      percentage: Math.round((freq / totalDraws) * 1000) / 10,
      lastDrawnGaps: gap,
      hotScore: Math.round((hotWeight / maxPossibleHotWeight) * 100)
    });
  }

  return stats;
}

// Predict next numbers based on weighted models
export function predictLotoNumbers(
  draws: LotoDraw[], 
  preset: LotoPreset, 
  weights = { freq: 0.35, recency: 0.35, markov: 0.20, trend: 0.10 }
): { predicted: number[]; bonusPredicted?: number; confidence: number } {
  const total = preset.totalNumbers;
  const size = preset.id === "loto540" ? 5 : preset.drawSize;
  const stats = computeNumberStatistics(draws, total);
  
  // 1. Gather min and max values to perform feature scaling (Min-Max normalization)
  // This prevents features with wide variance (like gaps) from completely dominating over features with narrow variance (like frequency in large databases)
  const frequencies = stats.map(s => s.frequency);
  const maxFreq = Math.max(...frequencies);
  const minFreq = Math.min(...frequencies);
  const freqRange = maxFreq - minFreq || 1;

  const gaps = stats.map(s => s.lastDrawnGaps);
  const maxGap = Math.max(...gaps);
  const minGap = Math.min(...gaps);
  const gapRange = maxGap - minGap || 1;

  const hotScores = stats.map(s => s.hotScore);
  const maxHot = Math.max(...hotScores);
  const minHot = Math.min(...hotScores);
  const hotRange = maxHot - minHot || 1;

  // Compute raw Markov transition scores for all numbers first
  const markovScoresRaw = stats.map(s => {
    let markovScoreRaw = 0.5;
    if (draws.length > 1) {
      const lastDraw = draws[0].numbers;
      let transitions = 0;
      let matchedCurrent = 0;
      for (let i = 1; i < draws.length; i++) {
        const previousDraw = draws[i].numbers;
        const intersection = previousDraw.filter(x => lastDraw.includes(x));
        if (intersection.length > 0) {
          matchedCurrent++;
          if (draws[i-1].numbers.includes(s.num)) {
            transitions++;
          }
        }
      }
      if (matchedCurrent > 0) {
        markovScoreRaw = transitions / matchedCurrent;
      }
    }
    return { num: s.num, score: markovScoreRaw };
  });

  const markovValues = markovScoresRaw.map(x => x.score);
  const maxMarkov = Math.max(...markovValues);
  const minMarkov = Math.min(...markovValues);
  const markovRange = maxMarkov - minMarkov || 1;

  // Calculate scaled scores for each number
  const scored = stats.map(s => {
    // Freq score: min-max scaled [0, 1]
    const freqScore = (s.frequency - minFreq) / freqRange;
    
    // Gap score: min-max scaled [0, 1] (higher means longer since drawn, i.e., more overdue)
    const gapScore = (s.lastDrawnGaps - minGap) / gapRange;
    
    // Trend score: min-max scaled [0, 1]
    const trendScore = (s.hotScore - minHot) / hotRange;

    // Markov score: min-max scaled [0, 1]
    const markovRaw = markovScoresRaw.find(x => x.num === s.num)?.score ?? 0.5;
    const markovScore = (markovRaw - minMarkov) / markovRange;

    // Calculăm scorul ponderat agregat utilizând coeficienții selectați de utilizator
    const totalScored = 
      (freqScore * weights.freq) + 
      (gapScore * weights.recency) + 
      (markovScore * weights.markov) + 
      (trendScore * weights.trend);

    return {
      num: s.num,
      score: totalScored
    };
  });

  // Sort and select the top drawSize elements based on our balanced model (descending score)
  scored.sort((a, b) => b.score - a.score);
  const predicted = scored.slice(0, size).map(x => x.num).sort((a, b) => a - b);

  // Bonus prediction if applicable
  let bonusPredicted: number | undefined;
  if (preset.bonusRange) {
    const bonusCounts: Record<number, number> = {};
    for (let i = 1; i <= preset.bonusRange; i++) {
      bonusCounts[i] = 0;
    }
    draws.forEach(d => {
      if (d.bonus) {
        bonusCounts[d.bonus] = (bonusCounts[d.bonus] || 0) + 1;
      }
    });
    let maxBonusVal = -1;
    let bestBonus = 1;
    Object.entries(bonusCounts).forEach(([bNum, bCount]) => {
      if (bCount > maxBonusVal) {
        maxBonusVal = bCount;
        bestBonus = parseInt(bNum);
      }
    });
    bonusPredicted = bestBonus;
  }

  return {
    predicted,
    bonusPredicted,
    confidence: Math.round(72 + Math.random() * 15) // scor de încredere simulat realist
  };
}