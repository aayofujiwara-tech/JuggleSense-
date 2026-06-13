"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getMachine } from "@/lib/machines";
import { reverseCalc } from "@/lib/reverseCalc";
import { ReverseCalcForm } from "@/components/ReverseCalcForm";
import { ReverseCalcResultView } from "@/components/ReverseCalcResult";
import type { ReverseCalcInput, ReverseCalcResult } from "@/lib/types";

export default function ReversePage() {
  const params = useParams();
  const machineId = typeof params.machineId === "string" ? params.machineId : "";
  const machine = getMachine(machineId);
  const [result, setResult] = useState<ReverseCalcResult | null>(null);

  if (!machine) {
    return (
      <div className="text-center py-20 text-[#e8e8f0]/50">
        <p>機種が見つかりません</p>
        <Link href="/" className="text-[#ffd700] mt-4 inline-block">← 機種選択に戻る</Link>
      </div>
    );
  }

  function handleSubmit(input: ReverseCalcInput) {
    if (input.totalGames === 0 || !machine) return;
    setResult(reverseCalc(machine, input));
    setTimeout(() => {
      document.getElementById("reverse-results")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-[#ffd700]/60 hover:text-[#ffd700] text-sm transition-colors">
        ← 機種選択
      </Link>

      <div>
        <h1 className="text-xl font-bold text-[#e8e8f0]">{machine.display_name}</h1>
        <p className="text-xs text-[#e8e8f0]/40 mt-0.5">{machine.source}</p>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/${machineId}`}
          className="flex-1 text-center py-2 text-sm text-[#e8e8f0]/40 border-b-2 border-transparent hover:text-[#ffd700] hover:border-[#ffd700] transition-colors"
        >
          設定判別
        </Link>
        <span className="flex-1 text-center py-2 text-sm font-medium text-[#00d4ff] border-b-2 border-[#00d4ff]">
          ぶどう逆算
        </span>
      </div>

      <ReverseCalcForm machine={machine} onSubmit={handleSubmit} />

      {result && (
        <div id="reverse-results">
          <ReverseCalcResultView result={result} machine={machine} />
        </div>
      )}
    </div>
  );
}
