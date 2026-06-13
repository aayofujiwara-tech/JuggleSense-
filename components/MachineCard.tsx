import Link from "next/link";
import type { MachineSpec, GrapePattern } from "@/lib/types";

const GRAPE_BADGES: Record<GrapePattern, { label: string; color: string }> = {
  graduated: { label: "ぶどう差大", color: "bg-[#39ff14]/20 text-[#39ff14] border-[#39ff14]/40" },
  graduated_small: { label: "ぶどう差小", color: "bg-[#ffd700]/20 text-[#ffd700] border-[#ffd700]/40" },
  graduated_inverse_cherry: { label: "チェリー逆相関", color: "bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/40" },
  flat: { label: "ぶどう差なし", color: "bg-[#e8e8f0]/10 text-[#e8e8f0]/60 border-[#e8e8f0]/20" },
  flat_except_6: { label: "設定6のみ突出", color: "bg-[#ff2d55]/20 text-[#ff2d55] border-[#ff2d55]/40" },
};

const MACHINE_COLORS: Record<string, string> = {
  myjuggler5: "from-[#1a1a2e] to-[#16213e] border-[#39ff14]/30",
  funky_juggler2: "from-[#1a2e1a] to-[#16213e] border-[#39ff14]/30",
  happy_juggler_v3: "from-[#2e1a1a] to-[#1e1616] border-[#ff2d55]/30",
  gogo_juggler3: "from-[#2e2a1a] to-[#1e1e16] border-[#ffd700]/30",
  juggler_girls_ss: "from-[#2a1a2e] to-[#1e1628] border-[#00d4ff]/30",
  ultra_miracle_juggler: "from-[#1a2a2e] to-[#16202e] border-[#00d4ff]/30",
  aim_juggler_ex: "from-[#1a1a1a] to-[#0d0d0d] border-[#ffd700]/30",
};

const MACHINE_ICONS: Record<string, string> = {
  myjuggler5: "🌸",
  funky_juggler2: "🎵",
  happy_juggler_v3: "😊",
  gogo_juggler3: "🔥",
  juggler_girls_ss: "💃",
  ultra_miracle_juggler: "✨",
  aim_juggler_ex: "🎯",
};

export function MachineCard({ machine }: { machine: MachineSpec }) {
  const badge = GRAPE_BADGES[machine.grape_pattern];
  const gradient = MACHINE_COLORS[machine.id] ?? "from-[#1a1a2e] to-[#16213e] border-[#39ff14]/30";
  const icon = MACHINE_ICONS[machine.id] ?? "🎰";
  const s1 = machine.settings["1"];
  const s6 = machine.settings["6"];

  return (
    <Link href={`/${machine.id}`} className="block group">
      <div
        className={`bg-gradient-to-br ${gradient} border rounded-xl p-4 transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg group-active:scale-[0.98]`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-bold text-sm leading-tight text-[#e8e8f0]">
              {machine.display_name}
            </h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
          <div className="text-[#e8e8f0]/50">合算(設1)</div>
          <div className="text-[#ffd700]">1/{s1.bonus_total?.toFixed(1) ?? "—"}</div>
          <div className="text-[#e8e8f0]/50">合算(設6)</div>
          <div className="text-[#39ff14]">1/{s6.bonus_total?.toFixed(1) ?? "—"}</div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {machine.key_metrics.map((m) => (
            <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#e8e8f0]/40">
              {m}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
