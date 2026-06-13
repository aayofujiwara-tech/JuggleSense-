import { machines } from "@/lib/machines";
import { MachineCard } from "@/components/MachineCard";

export default function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#ffd700] mb-1">機種を選択</h1>
        <p className="text-sm text-[#e8e8f0]/50">
          判別したい機種を選んでください。設定判別・ぶどう確率逆算が行えます。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {machines.map((machine) => (
          <MachineCard key={machine.id} machine={machine} />
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-[#1a1a2e] border border-[#ffd700]/10 text-xs text-[#e8e8f0]/40">
        <p className="font-semibold text-[#ffd700]/60 mb-1">使い方</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>機種を選択する</li>
          <li>総回転数・BIG回数・REG回数を入力して「判別」をタップ</li>
          <li>単独REGやチェリー重複REGがあれば入力すると精度が上がります</li>
          <li>ぶどう確率逆算は「逆算」タブから行えます</li>
        </ol>
      </div>
    </div>
  );
}
