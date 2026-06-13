"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getMachine } from "@/lib/machines";
import { judge } from "@/lib/judge";
import { JudgeForm } from "@/components/JudgeForm";
import { JudgeResultView } from "@/components/JudgeResult";
import type { JudgeInput, JudgeResult } from "@/lib/types";

export default function MachinePage() {
  const params = useParams();
  const machineId = typeof params.machineId === "string" ? params.machineId : "";
  const machine = getMachine(machineId);

  const [results, setResults] = useState<JudgeResult[] | null>(null);

  if (!machine) {
    return (
      <div className="text-center py-20 text-[#e8e8f0]/50">
        <p>機種が見つかりません</p>
        <Link href="/" className="text-[#ffd700] mt-4 inline-block">← 機種選択に戻る</Link>
      </div>
    );
  }

  function handleSubmit(input: JudgeInput) {
    if (input.totalGames === 0 || !machine) return;
    setResults(judge(machine, input));
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
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
        <span className="flex-1 text-center py-2 text-sm font-medium text-[#ffd700] border-b-2 border-[#ffd700]">
          設定判別
        </span>
        <Link
          href={`/${machineId}/reverse`}
          className="flex-1 text-center py-2 text-sm text-[#e8e8f0]/40 border-b-2 border-transparent hover:text-[#00d4ff] hover:border-[#00d4ff] transition-colors"
        >
          ぶどう逆算
        </Link>
      </div>

      <JudgeForm machine={machine} onSubmit={handleSubmit} />

      {results && (
        <div id="results-section">
          <JudgeResultView results={results} machine={machine} />
        </div>
      )}
    </div>
  );
}
