"use client";

import type { ReverseCalcResult, MachineSpec } from "@/lib/types";

const SETTINGS = ["1", "2", "3", "4", "5", "6"] as const;

function nearestSetting(machine: MachineSpec, grapeRate: number): string {
  let best = "3";
  let bestDiff = Infinity;
  for (const s of SETTINGS) {
    const g = machine.settings[s].grape;
    if (g == null) continue;
    const diff = Math.abs(g - grapeRate);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = s;
    }
  }
  return best;
}

export function ReverseCalcResultView({
  result,
  machine,
}: {
  result: ReverseCalcResult;
  machine: MachineSpec;
}) {
  const nearest = nearestSetting(machine, result.grapeRate);
  const hasGrapeData = Object.values(machine.settings).some((s) => s.grape != null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-[#39ff14]/30 bg-[#0d1a0d]">
          <p className="text-xs text-[#e8e8f0]/50 mb-1">ぶどう確率</p>
          <p className="text-2xl font-bold font-mono text-[#39ff14]">
            1/{result.grapeRate.toFixed(2)}
          </p>
          <p className="text-[10px] text-[#e8e8f0]/30 mt-1">
            {result.grapeCount.toFixed(0)}回
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#ff2d55]/30 bg-[#1a0d0d]">
          <p className="text-xs text-[#e8e8f0]/50 mb-1">チェリー確率</p>
          <p className="text-2xl font-bold font-mono text-[#ff2d55]">
            1/{result.cherryRate.toFixed(2)}
          </p>
          {result.isCherryEstimated && (
            <p className="text-[10px] text-[#ff2d55]/60 mt-1">推定値</p>
          )}
        </div>
      </div>

      {hasGrapeData && (
        <div className="p-4 rounded-xl border border-[#ffd700]/20 bg-[#1a1a2e]">
          <p className="text-xs text-[#e8e8f0]/50 mb-3">設定別ぶどう確率との比較</p>
          <div className="space-y-2">
            {SETTINGS.map((s) => {
              const g = machine.settings[s].grape;
              if (g == null) return null;
              const isNearest = s === nearest;
              const diff = Math.abs(g - result.grapeRate);
              const diffPct = (diff / g) * 100;
              return (
                <div
                  key={s}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-mono transition-all ${
                    isNearest
                      ? "bg-[#ffd700]/20 border border-[#ffd700]/40"
                      : "bg-[#0d0d18] border border-transparent"
                  }`}
                >
                  <span className={isNearest ? "text-[#ffd700] font-bold" : "text-[#e8e8f0]/50"}>
                    設定{s}
                    {isNearest && " ★"}
                  </span>
                  <span className={isNearest ? "text-[#ffd700]" : "text-[#e8e8f0]/40"}>
                    1/{g.toFixed(2)}
                  </span>
                  <span className="text-[#e8e8f0]/30">
                    {isNearest ? "最近似" : `差 ${diffPct.toFixed(1)}%`}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[#e8e8f0]/30 mt-2">
            逆算値: 1/{result.grapeRate.toFixed(2)} → 設定{nearest}に最も近い
          </p>
        </div>
      )}

      {result.isCherryEstimated && (
        <div className="text-xs text-[#ff2d55]/60 p-3 rounded-lg bg-[#1a0d0d] border border-[#ff2d55]/20">
          ※ チェリー確率は理論値（設定3〜4の平均）から推定した値です。モード1でチェリー回数を入力すると精度が上がります。
        </div>
      )}
    </div>
  );
}
