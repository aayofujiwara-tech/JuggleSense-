"use client";

import type { JudgeResult, MachineSpec, GrapePattern } from "@/lib/types";

const SETTING_COLORS = [
  "text-[#e8e8f0]/60",
  "text-[#e8e8f0]/70",
  "text-[#ffd700]/80",
  "text-[#ffd700]",
  "text-[#39ff14]",
  "text-[#ff2d55]",
];

const GRAPE_HINTS: Record<GrapePattern, string> = {
  graduated: "ぶどう確率は設定差が大きく、重要な判別指標です。",
  graduated_small: "ぶどう確率の設定差は小さめです。合算・REG確率を優先してください。",
  graduated_inverse_cherry: "ぶどう確率は高設定ほど良く、非重複チェリーは逆相関です。",
  flat: "この機種はぶどう確率で設定差がほとんどありません。REG確率を中心に判別してください。",
  flat_except_6: "設定1〜5はほぼ同じぶどう確率。設定6のみ大きく突出します。",
};

const METRIC_LABELS: Record<string, string> = {
  bonus_total: "合算",
  reg: "REG",
  big: "BIG",
  br_ratio: "BR比",
  reg_solo: "単独REG",
  cherry_reg: "C重複REG",
  grape: "ぶどう",
  big_solo: "単独BIG",
};

function formatRate(metric: string, value: number): string {
  if (metric === "br_ratio") return value.toFixed(2);
  if (metric === "grape") return `1/${value.toFixed(2)}`;
  return `1/${value.toFixed(1)}`;
}

export function JudgeResultView({
  results,
  machine,
}: {
  results: JudgeResult[];
  machine: MachineSpec;
}) {
  const sorted = [...results].sort((a, b) => Number(a.setting) - Number(b.setting));
  const best = results[0];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-[#ffd700]/30 bg-[#1a1a2e] gogo-glow-yellow">
        <p className="text-xs text-[#e8e8f0]/50 mb-1">最有力設定</p>
        <div className="flex items-center gap-3">
          <span className="text-5xl font-bold font-mono text-[#ffd700] gogo-pulse">
            設定{best.setting}
          </span>
          <span className="text-sm text-[#ffd700]/70">
            スコア {(best.totalScore * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="text-xs text-[#e8e8f0]/50 p-3 rounded-lg bg-[#0d0d18] border border-[#ffd700]/10">
        {GRAPE_HINTS[machine.grape_pattern]}
        {machine.grape_pattern === "flat_except_6" && (
          <span className="ml-1 px-1.5 py-0.5 rounded bg-[#ff2d55]/20 text-[#ff2d55] border border-[#ff2d55]/30">
            設定6 or 設定1-5の二値判定
          </span>
        )}
      </div>

      <div className="space-y-2">
        {sorted.map((r) => {
          const pct = r.totalScore * 100;
          const colorClass = SETTING_COLORS[Number(r.setting) - 1];
          const isBest = r.setting === best.setting;
          return (
            <div
              key={r.setting}
              className={`rounded-lg border p-3 transition-all ${
                isBest
                  ? "border-[#ffd700]/50 bg-[#1a1a2e]"
                  : "border-[#e8e8f0]/10 bg-[#0d0d18]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold text-sm ${colorClass}`}>
                  設定{r.setting}
                  {isBest && <span className="ml-1 text-xs text-[#ffd700]">★</span>}
                </span>
                <span className={`font-mono text-sm ${colorClass}`}>
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-[#e8e8f0]/10 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isBest ? "bg-[#ffd700]" : "bg-[#e8e8f0]/30"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[10px] font-mono">
                {Object.entries(r.scorePerMetric).map(([metric, score]) => (
                  <span key={metric} className="text-[#e8e8f0]/40">
                    {METRIC_LABELS[metric] ?? metric}:{" "}
                    <span className={score > 0.8 ? "text-[#39ff14]" : score > 0.5 ? "text-[#ffd700]" : "text-[#ff2d55]"}>
                      {(score * 100).toFixed(0)}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-lg bg-[#0d0d18] border border-[#e8e8f0]/10">
        <p className="text-xs text-[#e8e8f0]/40 mb-2">あなたの実測値</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
          {Object.entries(results[0]?.actualValues ?? {}).map(([metric, value]) => (
            <div key={metric} className="flex justify-between">
              <span className="text-[#e8e8f0]/40">{METRIC_LABELS[metric] ?? metric}</span>
              <span className="text-[#ffd700]/80">{formatRate(metric, value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
