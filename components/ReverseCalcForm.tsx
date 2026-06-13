"use client";

import { useState } from "react";
import type { MachineSpec, ReverseCalcInput } from "@/lib/types";

interface Props {
  machine: MachineSpec;
  onSubmit: (input: ReverseCalcInput) => void;
}

function NumInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#e8e8f0]/60">
        {label}
        {hint && <span className="ml-1 text-[#e8e8f0]/30">({hint})</span>}
      </label>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "0"}
        className="w-full rounded-lg bg-[#0d0d18] border border-[#00d4ff]/20 px-3 py-3 text-base font-mono text-[#00d4ff] placeholder:text-[#e8e8f0]/20 focus:outline-none focus:border-[#00d4ff]/60 transition-colors"
      />
    </div>
  );
}

export function ReverseCalcForm({ machine, onSubmit }: Props) {
  const [mode, setMode] = useState<1 | 2>(1);
  const [totalGames, setTotalGames] = useState("");
  const [bigCount, setBigCount] = useState("");
  const [regCount, setRegCount] = useState("");
  const [netCoins, setNetCoins] = useState("");
  const [investment, setInvestment] = useState("");
  const [payout, setPayout] = useState("");
  const [cherryMode, setCherryMode] = useState<"on" | "off">("on");
  const [cherryCount, setCherryCount] = useState("");
  const [useNetCoins, setUseNetCoins] = useState(true);

  function calcNetCoins(): number {
    if (useNetCoins) return Number(netCoins) || 0;
    const inv = Number(investment) || 0;
    const pay = Number(payout) || 0;
    return pay - inv * 3;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nc = calcNetCoins();
    onSubmit({
      mode,
      totalGames: Number(totalGames) || 0,
      bigCount: Number(bigCount) || 0,
      regCount: Number(regCount) || 0,
      netCoins: nc,
      cherryMode,
      cherryCount: mode === 1 && cherryCount ? Number(cherryCount) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-xs text-[#e8e8f0]/60 mb-2">逆算モード</p>
        <div className="grid grid-cols-2 gap-2">
          {([1, 2] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                mode === m
                  ? "bg-[#00d4ff]/20 border-[#00d4ff]/60 text-[#00d4ff]"
                  : "bg-[#0d0d18] border-[#e8e8f0]/10 text-[#e8e8f0]/50"
              }`}
            >
              {m === 1 ? "モード1（高精度）" : "モード2（簡易）"}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#e8e8f0]/30 mt-1">
          {mode === 1
            ? "チェリー回数を入力して精度の高い逆算を行います"
            : "チェリー回数不要。理論値から推定します"}
        </p>
      </div>

      <div className="space-y-3">
        <NumInput label="総回転数" value={totalGames} onChange={setTotalGames} placeholder="例: 3000" />
        <div className="grid grid-cols-2 gap-3">
          <NumInput label="BIG回数" value={bigCount} onChange={setBigCount} />
          <NumInput label="REG回数" value={regCount} onChange={setRegCount} />
        </div>
      </div>

      <div>
        <p className="text-xs text-[#e8e8f0]/60 mb-2">差枚数の入力方法</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => setUseNetCoins(true)}
            className={`py-2 rounded-lg text-xs border transition-all ${
              useNetCoins
                ? "bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]"
                : "bg-[#0d0d18] border-[#e8e8f0]/10 text-[#e8e8f0]/40"
            }`}
          >
            差枚数を直接入力
          </button>
          <button
            type="button"
            onClick={() => setUseNetCoins(false)}
            className={`py-2 rounded-lg text-xs border transition-all ${
              !useNetCoins
                ? "bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]"
                : "bg-[#0d0d18] border-[#e8e8f0]/10 text-[#e8e8f0]/40"
            }`}
          >
            投資・清算から計算
          </button>
        </div>

        {useNetCoins ? (
          <NumInput
            label="差枚数"
            value={netCoins}
            onChange={setNetCoins}
            placeholder="例: -500（マイナスは損）"
            hint="プラスが勝ち"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="投資（千円）" value={investment} onChange={setInvestment} hint="1000円単位" />
            <NumInput label="清算枚数" value={payout} onChange={setPayout} />
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-[#e8e8f0]/60 mb-2">チェリー狙い</p>
        <div className="grid grid-cols-2 gap-2">
          {(["on", "off"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setCherryMode(v)}
              className={`py-2.5 rounded-lg text-sm border transition-all ${
                cherryMode === v
                  ? "bg-[#ff2d55]/20 border-[#ff2d55]/50 text-[#ff2d55]"
                  : "bg-[#0d0d18] border-[#e8e8f0]/10 text-[#e8e8f0]/50"
              }`}
            >
              {v === "on" ? "チェリー狙いON" : "チェリー狙いOFF"}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#e8e8f0]/30 mt-1">
          {cherryMode === "on" ? "チェリーを100%取得している場合" : "チェリーを約50%しか取れていない場合"}
        </p>
      </div>

      {mode === 1 && (
        <NumInput label="チェリー回数" value={cherryCount} onChange={setCherryCount} />
      )}

      <div className="text-xs text-[#e8e8f0]/30 p-2 rounded bg-[#0d0d18]">
        {machine.display_name} / BIG獲得: {machine.big_payout}枚 / REG獲得: {machine.reg_payout}枚
      </div>

      <button
        type="submit"
        className="w-full py-4 rounded-xl font-bold text-base bg-[#00d4ff] text-[#0a0a0f] transition-all active:scale-95 hover:bg-[#33ddff]"
        style={{ boxShadow: "0 0 10px #00d4ff, 0 0 20px #00d4ff66" }}
      >
        ぶどう確率を逆算する
      </button>
    </form>
  );
}
