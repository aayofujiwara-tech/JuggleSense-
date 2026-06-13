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
  const [error, setError] = useState<string | null>(null);

  const hasRegSolo = machine.key_metrics.includes("reg_solo") ||
    Object.values(machine.settings).some((s) => s.reg_solo != null);
  const hasCherryReg = machine.key_metrics.includes("cherry_reg") ||
    Object.values(machine.settings).some((s) => s.cherry_reg != null);
  const hasGrape = machine.key_metrics.includes("grape") ||
    Object.values(machine.settings).some((s) => s.grape != null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const games = Number(totalGames) || 0;
    if (games <= 0) {
      setError("総回転数を入力してください");
      return;
    }
    const big = Number(bigCount) || 0;
    const reg = Number(regCount) || 0;
    if (big + reg > games) {
      setError("BIG回数とREG回数の合計が総回転数を超えています");
      return;
    }
    setError(null);
    onSubmit({
      totalGames: games,
      bigCount: big,
      regCount: reg,
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
      {error && (
        <p className="text-xs text-[#ff2d55] px-3 py-2 rounded-lg bg-[#1a0d0d] border border-[#ff2d55]/30">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="w-full py-4 rounded-xl font-bold text-base bg-[#ffd700] text-[#0a0a0f] transition-all active:scale-95 hover:bg-[#ffed4a] gogo-glow-yellow"
      >
        設定を判別する
      </button>
    </form>
  );
}
