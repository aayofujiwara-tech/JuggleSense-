import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "計算について — JuggleSense",
  description: "JuggleSenseがどのように設定を推測しているか、統計的な根拠とともに解説します。",
};

export default function AboutPage() {
  return (
    <div className="space-y-10 max-w-3xl">
      {/* Section 1: Page Title */}
      <section>
        <h1 className="text-2xl font-bold text-[#ffd700] mb-2">
          JuggleSense の計算方法について
        </h1>
        <p className="text-sm text-[#e8e8f0]/60">
          このツールがどのように設定を推測しているか、統計的な根拠とともに解説します。
        </p>
      </section>

      {/* Section 2: How setting judgment works */}
      <section id="how-it-works">
        <h2 className="text-lg font-semibold text-[#ffd700] mb-3 border-b border-[#ffd700]/20 pb-2">
          設定判別はどのように行われるか
        </h2>
        <div className="text-sm text-[#e8e8f0]/80 space-y-3 leading-relaxed">
          <p>
            JuggleSense は「この回転数・ボーナス回数のデータが、もし設定◯だったとしたら
            どのくらいの確率で起こりうるか」を設定1〜6それぞれについて計算し、
            最も「起こりやすい」設定を上位に表示します。
          </p>
          <p>
            たとえば設定6は合算確率が高く、入力データが高ボーナスであれば
            「設定6ならこのデータが出る確率が高い」→「設定6の可能性が高い」という判定になります。
            逆に入力データが低ボーナスでも、設定1〜3のどれが最もそのデータを
            「説明しやすいか」を数値で比較しています。
          </p>
        </div>
      </section>

      {/* Section 3: Binomial distribution */}
      <section id="binomial">
        <h2 className="text-lg font-semibold text-[#ffd700] mb-3 border-b border-[#ffd700]/20 pb-2">
          統計的根拠 — 二項分布の尤度計算
        </h2>
        <div className="text-sm text-[#e8e8f0]/80 space-y-3 leading-relaxed">
          <p>
            ジャグラーのボーナスは、毎ゲーム一定確率で抽選される独立試行です。
            これは「コインを何度も投げて表が出る回数を数える」のと同じ構造であり、
            統計学では二項分布（Binomial Distribution）として知られています。
          </p>
          <p>
            JuggleSense では、各設定の理論確率 p を用いて
            「n 回転中 k 回ボーナスが出る確率」を以下の式で計算しています。
          </p>
          <div className="bg-[#0d0d18] border border-[#ffd700]/20 rounded-lg p-4 font-mono text-xs text-[#e8e8f0]/90 leading-relaxed">
            <div className="text-[#ffd700] mb-2">P(X = k) = C(n, k) × p^k × (1-p)^(n-k)</div>
            <div className="text-[#e8e8f0]/50 space-y-1">
              <div>n: 総回転数</div>
              <div>k: 実際のボーナス（またはぶどう等）の回数</div>
              <div>p: その設定の理論確率（例: 設定6のBIG確率 = 1/229.1）</div>
            </div>
          </div>
          <p>
            この P(X = k) が「尤度（ゆうど / Likelihood）」です。
            尤度は「その設定が真だとしたとき、実際に観測されたデータが得られる確率」を表します。
            設定1〜6それぞれの尤度を比較し、正規化することで
            「設定◯の可能性: ◯%」という確率を算出しています。
          </p>
        </div>
      </section>

      {/* Section 4: Why multiple inputs improve accuracy */}
      <section id="multiple-inputs">
        <h2 className="text-lg font-semibold text-[#ffd700] mb-3 border-b border-[#ffd700]/20 pb-2">
          複数の指標を入力すると精度が上がる理由
        </h2>
        <div className="text-sm text-[#e8e8f0]/80 space-y-3 leading-relaxed">
          <p>
            BIG・REG・ぶどう・単独REG・チェリー重複REGはそれぞれ独立した抽選です。
            各指標の尤度は「掛け合わせる」ことで合算できます（計算上は対数を加算）。
          </p>
          <p>たとえば BIG確率・REG確率・ぶどう確率の3指標を入力した場合、</p>
          <div className="bg-[#0d0d18] border border-[#ffd700]/20 rounded-lg p-4 font-mono text-xs text-[#e8e8f0]/90">
            総合尤度(設定s) = P(BIG回数 | 設定s) × P(REG回数 | 設定s) × P(ぶどう回数 | 設定s)
          </div>
          <p>
            となり、1つの指標だけより情報量が増えるため、判定が鋭くなります。
            入力できる指標が多いほど、その機種の「設定らしさ」をより正確に捉えられます。
          </p>
        </div>
      </section>

      {/* Section 5: Accuracy vs game count */}
      <section id="game-count">
        <h2 className="text-lg font-semibold text-[#ffd700] mb-3 border-b border-[#ffd700]/20 pb-2">
          回転数が増えるほど精度が上がる理由
        </h2>
        <div className="text-sm text-[#e8e8f0]/80 space-y-3 leading-relaxed">
          <p>
            二項分布の標準偏差は √(n × p × (1-p)) です。
            回転数 n が増えるほど、実測値のブレ（標準偏差）が相対的に小さくなり、
            設定ごとの理論値の差がブレより大きくなるため、判別が鋭くなります。
          </p>
          <p>
            下の表は Sマイジャグラー5 で「設定6の理論値ちょうど」のデータを入力したとき、
            回転数によって設定6の確率がどう変化するかをシミュレーションしたものです。
            （BIG・REGのみ入力の場合）
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-[#ffd700]/20 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#1a1a2e] text-[#ffd700]/80">
                  <th className="px-3 py-2 text-left border-b border-[#ffd700]/20 whitespace-nowrap">回転数</th>
                  <th className="px-3 py-2 text-right border-b border-[#ffd700]/20 whitespace-nowrap">BIG回数</th>
                  <th className="px-3 py-2 text-right border-b border-[#ffd700]/20 whitespace-nowrap">REG回数</th>
                  <th className="px-3 py-2 text-right border-b border-[#ffd700]/20 whitespace-nowrap text-[#ffd700]">設定6</th>
                  <th className="px-3 py-2 text-right border-b border-[#ffd700]/20 whitespace-nowrap">設定5</th>
                  <th className="px-3 py-2 text-right border-b border-[#ffd700]/20 whitespace-nowrap">設定1</th>
                </tr>
              </thead>
              <tbody className="text-[#e8e8f0]/70">
                {[
                  ["500G",   2,   2, "17.8%", "18.0%", "14.6%"],
                  ["1000G",  4,   4, "18.9%", "19.3%", "12.7%"],
                  ["2000G",  9,   9, "28.9%", "24.3%",  "6.1%"],
                  ["3000G", 13,  13, "30.5%", "26.2%",  "4.3%"],
                  ["5000G", 22,  22, "40.7%", "29.4%",  "1.2%"],
                  ["7000G", 31,  31, "49.0%", "29.9%",  "0.3%"],
                  ["10000G",44,  44, "55.9%", "29.3%",  "0.0%"],
                ].map(([games, big, reg, s6, s5, s1], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-[#0d0d18]" : "bg-[#0a0a0f]"}>
                    <td className="px-3 py-2 border-b border-[#ffd700]/10 font-mono whitespace-nowrap">{games}</td>
                    <td className="px-3 py-2 border-b border-[#ffd700]/10 text-right font-mono">{big}</td>
                    <td className="px-3 py-2 border-b border-[#ffd700]/10 text-right font-mono">{reg}</td>
                    <td className="px-3 py-2 border-b border-[#ffd700]/10 text-right font-mono text-[#ffd700]">{s6}</td>
                    <td className="px-3 py-2 border-b border-[#ffd700]/10 text-right font-mono">{s5}</td>
                    <td className="px-3 py-2 border-b border-[#ffd700]/10 text-right font-mono">{s1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#e8e8f0]/40 leading-relaxed">
            ※ 設定6の理論値ちょうどでも、7000G時点で「設定6の可能性49%」程度です。
            これはジャグラーの設定差の小ささを反映しており、
            「たった数千回転では断定が難しい」という実戦上の経験と一致しています。
          </p>
        </div>
      </section>

      {/* Section 6: What % means */}
      <section id="probability-meaning">
        <h2 className="text-lg font-semibold text-[#ffd700] mb-3 border-b border-[#ffd700]/20 pb-2">
          「設定◯の可能性: ◯%」の正確な意味
        </h2>
        <div className="text-sm text-[#e8e8f0]/80 space-y-3 leading-relaxed">
          <p>
            表示される % は「設定1〜6の中で、観測データに対する尤度を相対的に比較した値」です。
            6設定の % を合計すると必ず 100% になります。
          </p>
          <div className="bg-[#1a1a2e] border border-[#ffd700]/30 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-[#ffd700]/90 text-xs">重要: これは「絶対的な確率」ではありません。</p>
            <p>
              たとえば「設定6の可能性: 40%」は
              「設定6が最も可能性が高いが、他の設定の可能性も無視できない」という意味であり、
              「この台の設定が6である確率が40%」という意味ではありません。
            </p>
          </div>
          <p>
            設定の事前確率（お店がどの設定を使いやすいか）や、
            そのホールの設定傾向は計算に含まれていないためです。
            判別結果はあくまで「データの統計的な傾向」として参考にしてください。
          </p>
        </div>
      </section>

      {/* Section 7: Data sources */}
      <section id="data-sources">
        <h2 className="text-lg font-semibold text-[#ffd700] mb-3 border-b border-[#ffd700]/20 pb-2">
          使用データの出典
        </h2>
        <ul className="text-sm text-[#e8e8f0]/70 space-y-2 leading-relaxed">
          {[
            "Sマイジャグラー5: juggler7.com（メーカー解析値準拠、確度:高）",
            "Sファンキージャグラー2: note/jugglertopics アプリ実測値（確度:高）",
            "SハッピージャグラーV3: juggler7.com（ボーナス確率はメーカー解析値、一部設定は5号機比率推定値、確度:中〜高）",
            "Sゴーゴージャグラー3: juggler7.com（メーカー解析値+ガリぞう実戦値、確度:高）",
            "SジャグラーガールズSS: juggler7.com / note(pachiprotool) 実戦値（確度:高）",
            "Sウルトラミラクルジャグラー: juggler7.com（メーカー解析値+ガリぞう実戦値、確度:高）",
            "SアイムジャグラーEX / ネオアイムジャグラーEX: juggler7.com / 北電子公式値（BIG獲得枚数252枚はメーカー公式確定値、確度:最高）",
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#ffd700]/40 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[#e8e8f0]/40">
          機種仕様の変更・新たな解析結果により、掲載データが実際の値と異なる可能性があります。
        </p>
      </section>

      {/* Section 8: Source code */}
      <section id="source-code">
        <h2 className="text-lg font-semibold text-[#ffd700] mb-3 border-b border-[#ffd700]/20 pb-2">
          ソースコード
        </h2>
        <div className="text-sm text-[#e8e8f0]/80 space-y-4">
          <p>
            JuggleSense はオープンソースです。
            計算ロジックの詳細は GitHub リポジトリをご確認ください。
          </p>
          <a
            href="https://github.com/aayofujiwara-tech/JuggleSense-"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#ffd700]/40 text-[#ffd700] hover:bg-[#ffd700]/10 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub: aayofujiwara-tech/JuggleSense-
          </a>
        </div>
      </section>
    </div>
  );
}
