"use client";

import { useState } from "react";
import type { MachineSpec, JudgeInput } from "@/lib/types";

interface Props {
  machine: MachineSpec;
  onSubmit: (input: JudgeInput) => void;
}

function NumInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#e8e8f0]/60">{label}</label>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "0"}
        className="w-full rounded-lg bg-[#0d0d18] border border-[#ffd700]/20 px-3 py-3 text-base font-mono text-[#ffd700] placeholder:text-[#e8e8f0]/20 focus:outline-none focus:border-[#ffd700]/60 transition-colors"
      />
    </div>
  );
}

export function JudgeForm({ machine, onSubmit }: Props) {
  const [totalGames, setTotalGames] = useState("");
  const [bigCount, setBigCount] = useState("");
  const [regCount, setRegCount] = useState("");
  const [regSoloCount, setRegSoloCount] = useState("");
  const [cherryRegCount, setCherryRegCount] = useState("");
  const [grapeCount, setGrapeCount] = useState("");

  const hasRegSolo = machine.key_metrics.includes("reg_solo") ||
    Object.values(machine.settings).some((s) => s.reg_solo != null);
  const hasCherryReg = machine.key_metrics.includes("cherry_reg") ||
    Object.values(machine.settings).some((s) => s.cherry_reg != null);
  const hasGrape = machine.key_metrics.includes("grape") ||
    Object.values(machine.settings).some((s) => s.grape != null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      totalGames: Number(totalGames) || 0,
      bigCount: Number(bigCount) || 0,
      regCount: Number(regCount) || 0,
      regSoloCount: regSoloCount ? Number(regSoloCount) : undefined,
      cherryRegCount: cherryRegCount ? Number(cherryRegCount) : undefined,
      grapeCount: grapeCount ? Number(grapeCount) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <NumInput label="総回転数" value={totalGames} onChange={setTotalGames} placeholder="例: 3000" />
        <div className="grid grid-cols-2 gap-3">
          <NumInput label="BIG回数" value={bigCount} onChange={setBigCount} />
          <NumInput label="REG回数" value={regCount} onChange={setRegCount} />
        </div>
        {hasRegSolo && (
          <NumInput label="単独REG回数（任意）" value={regSoloCount} onChange={setRegSoloCount} />
        )}
        {hasCherryReg && (
          <NumInput label="チェリー重複REG回数（任意）" value={cherryRegCount} onChange={setCherryRegCount} />
        )}
        {hasGrape && (
          <NumInput label="ぶどう回数（任意）" value={grapeCount} onChange={setGrapeCount} />
        )}
      </div>
      <button
        type="submit"
        className="w-full py-4 rounded-xl font-bold text-base bg-[#ffd700] text-[#0a0a0f] transition-all active:scale-95 hover:bg-[#ffed4a] gogo-glow-yellow"
      >
        設定を判別する
      </button>
    </form>
  );
}
