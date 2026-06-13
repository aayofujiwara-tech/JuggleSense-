# JuggleSense — ジャグラーシリーズ設定判別ツール 実装要件定義書

## 0. 概要

ジャグラーシリーズ全機種に対応した「設定判別ツール」をWebアプリとして実装し、Vercelで公開する。
機種ごとのスペックデータをJSONで外部化し、判別ロジック・逆算ロジックは機種非依存の共通エンジンとして実装する。

- フロントエンド: Next.js (App Router) + TypeScript + Tailwind CSS
- デプロイ: Vercel
- UI実装: Claude Code の `frontend-design` スキルを使用して、機種データの特性（GOGOランプ・ジャグラーらしい配色・データ重視のUI）を踏まえた専用デザインを構築する。プロジェクト名: JuggleSense
- データ層: `/data/machines/*.json` に機種別スペックを配置し、エンジン側はこれを読み込むだけで動作する設計とする

---

## 1. 全体要件

### 1.1 機能一覧

1. **機種選択**(対応8機種)
2. **設定判別モード**
   - 入力: 総回転数、BIG回数、REG回数(+機種により単独REG・チェリー重複REG・チェリーカウント等)
   - 出力: 各指標(合算確率・単独REG・BR比率・ぶどう確率等)を設定別テーブルと比較し、最も近い設定をハイライト表示
3. **ぶどう/チェリー確率逆算ツール**(2モード選択式)
   - **モード1**: チェリーカウントあり → ぶどう確率を逆算(精度高)
   - **モード2**: チェリーカウントなし → 理論値固定でぶどう確率を逆算(簡易)
   - 入力: 総回転数、BIG回数、REG回数、差枚数(または投資金額+清算枚数)、チェリー狙いOn/Off、(モード1のみ)チェリー回数
4. **機種別の判別ヒント表示**
   - `grape_pattern` に応じて、ぶどう確率の重要度や注記をUIに動的反映

### 1.2 非機能要件

- レスポンシブ対応(スマホでの実機データ入力を想定)
- 機種データ追加が容易な設計(新機種はJSON追加のみで対応可能)
- オフライン動作は必須ではないが、PWA化は将来検討
- ローカルストレージで入力履歴・お気に入り機種を保存(任意機能)

---

## 2. データ構造定義

### 2.1 共通スキーマ

```typescript
type GrapePattern =
  | "graduated"              // 設定毎に段階的に変化
  | "graduated_small"        // 段階変化だが差が小さい
  | "graduated_inverse_cherry" // ぶどう設定差あり、非重複チェリーは逆相関
  | "flat"                    // ほぼ設定差なし
  | "flat_except_6";          // 設定6のみ突出、1-5共通

interface SettingSpec {
  big?: number;          // BIG確率の分母
  reg?: number;          // REG確率の分母
  bonus_total?: number;  // ボーナス合算確率の分母
  big_solo?: number;     // 単独BIG確率の分母
  reg_solo?: number;     // 単独REG確率の分母
  cherry_reg?: number;   // チェリー重複REG確率の分母
  cherry_big?: number;   // チェリー重複BIG確率の分母
  grape?: number;        // ぶどう確率の分母
  cherry?: number;       // チェリー確率の分母
}

interface MachineSpec {
  id: string;                  // 機種ID (例: "myjuggler5")
  display_name: string;        // 表示名
  grape_pattern: GrapePattern;
  key_metrics: string[];       // 判別の優先指標
  big_payout: number;          // BIG獲得枚数
  reg_payout: number;          // REG獲得枚数
  grape_payout: number;        // ぶどう獲得枚数(全機種共通: 8)
  cherry_payout: number;       // チェリー獲得枚数(全機種共通: 2)
  settings: Record<"1"|"2"|"3"|"4"|"5"|"6", SettingSpec>;
  source: string;              // データ出典(信頼度表記)
}
```

### 2.2 機種別データ(確定版)

以下を `/data/machines/*.json` に配置する。

#### `myjuggler5.json` (Sマイジャグラー5)
```json
{
  "id": "myjuggler5",
  "display_name": "Sマイジャグラー5",
  "grape_pattern": "graduated",
  "key_metrics": ["bonus_total", "reg_solo", "br_ratio", "grape"],
  "big_payout": 240,
  "reg_payout": 96,
  "grape_payout": 8,
  "cherry_payout": 2,
  "settings": {
    "1": { "big": 273.1, "reg": 409.6, "bonus_total": 163.8, "reg_solo": 655.36, "cherry_reg": 38.1, "grape": 5.90 },
    "2": { "big": 270.8, "reg": 385.5, "bonus_total": 159.1, "reg_solo": 595.78, "cherry_reg": 38.1, "grape": 5.85 },
    "3": { "big": 266.4, "reg": 336.1, "bonus_total": 148.6, "reg_solo": 496.48, "cherry_reg": 36.82, "grape": 5.80 },
    "4": { "big": 254.0, "reg": 290.0, "bonus_total": 135.4, "reg_solo": 404.54, "cherry_reg": 35.62, "grape": 5.78 },
    "5": { "big": 240.1, "reg": 268.6, "bonus_total": 126.8, "reg_solo": 390.10, "cherry_reg": 35.62, "grape": 5.76 },
    "6": { "big": 229.1, "reg": 229.1, "bonus_total": 114.6, "reg_solo": 327.68, "cherry_reg": 35.62, "grape": 5.66 }
  },
  "source": "juggler7.com (メーカー解析値準拠、確度:高)"
}
```

#### `funky_juggler2.json` (Sファンキージャグラー2)
```json
{
  "id": "funky_juggler2",
  "display_name": "Sファンキージャグラー2",
  "grape_pattern": "graduated",
  "key_metrics": ["reg_solo", "cherry_reg", "grape"],
  "big_payout": 240,
  "reg_payout": 96,
  "grape_payout": 8,
  "cherry_payout": 2,
  "settings": {
    "1": { "big": 266.4, "reg": 439.8, "bonus_total": 165.9, "reg_solo": 630.15, "cherry_reg": 1456.36, "grape": 5.94 },
    "2": { "big": 259.0, "reg": 407.1, "reg_solo": 585.14, "cherry_reg": 1337.47, "grape": 5.92 },
    "3": { "big": 256.0, "reg": 366.1, "bonus_total": 150.7, "reg_solo": 512.00, "cherry_reg": 1285.02, "grape": 5.88 },
    "4": { "big": 249.2, "reg": 322.8, "reg_solo": 448.88, "cherry_reg": 1149.75, "grape": 5.83 },
    "5": { "big": 240.1, "reg": 299.3, "reg_solo": 404.54, "cherry_reg": 1149.75, "grape": 5.76 },
    "6": { "big": 219.9, "reg": 262.1, "reg_solo": 352.34, "cherry_reg": 1024.00, "grape": 5.67 }
  },
  "source": "note(pachiprotool)/jugglertopics アプリ実測値 (確度:高)"
}
```

#### `happy_juggler_v3.json` (SハッピージャグラーV3)
```json
{
  "id": "happy_juggler_v3",
  "display_name": "SハッピージャグラーV3",
  "grape_pattern": "graduated_inverse_cherry",
  "key_metrics": ["reg_solo", "cherry_reg"],
  "big_payout": 240,
  "reg_payout": 96,
  "grape_payout": 8,
  "cherry_payout": 2,
  "settings": {
    "1": { "big": 273.1, "reg": 397.2, "bonus_total": 161.8, "big_solo": 394.2, "reg_solo": 635.5, "cherry_reg": 1059.3, "grape": 6.07 },
    "2": { "big": 270.8, "reg": 362.1, "bonus_total": 154.9, "big_solo": 387.8, "reg_solo": 561.9, "cherry_reg": 1018.4, "grape": 6.03 },
    "3": { "big": 263.2, "reg": 332.7, "bonus_total": 147.0, "big_solo": 371.2, "reg_solo": 532.4, "cherry_reg": 1111.1, "grape": 6.00 },
    "4": { "big": 254.0, "reg": 300.6, "bonus_total": 137.7, "big_solo": 379.4, "reg_solo": 473.7, "cherry_reg": 887.3, "grape": 5.86 },
    "5": { "big": 239.2, "reg": 273.1, "bonus_total": 127.5, "big_solo": 349.4, "reg_solo": 432.5, "cherry_reg": 819.4, "grape": 5.84 },
    "6": { "big": 226.0, "reg": 256.0, "bonus_total": 120.0, "big_solo": 323.6, "reg_solo": 426.6, "cherry_reg": 731.4, "grape": 5.80 }
  },
  "source": "juggler7.com (ボーナス確率はメーカー解析値、単独/チェリー重複は5号機比率推定値、ぶどうはアプリ実戦300万G値。確度:中〜高)"
}
```

#### `gogo_juggler3.json` (Sゴーゴージャグラー3)
```json
{
  "id": "gogo_juggler3",
  "display_name": "Sゴーゴージャグラー3",
  "grape_pattern": "graduated_small",
  "key_metrics": ["bonus_total", "reg_solo", "br_ratio", "grape"],
  "big_payout": 240,
  "reg_payout": 96,
  "grape_payout": 8,
  "cherry_payout": 2,
  "settings": {
    "1": { "big": 259.0, "reg": 354.2, "bonus_total": 149.6, "big_solo": 379.1, "reg_solo": 472.3, "grape": 6.25, "cherry": 33.56 },
    "2": { "big": 258.0, "reg": 332.7, "bonus_total": 145.3, "big_solo": 376.9, "reg_solo": 447.4, "grape": 6.20, "cherry": 33.47 },
    "3": { "big": 257.0, "reg": 306.2, "bonus_total": 139.7, "big_solo": 378.6, "reg_solo": 417.8, "grape": 6.15, "cherry": 33.32 },
    "4": { "big": 254.0, "reg": 268.6, "bonus_total": 130.5, "big_solo": 378.7, "reg_solo": 362.9, "grape": 6.07, "cherry": 33.15 },
    "5": { "big": 247.3, "reg": 247.3, "bonus_total": 123.7, "big_solo": 369.5, "reg_solo": 331.0, "grape": 6.00, "cherry": 33.10 },
    "6": { "big": 234.9, "reg": 234.9, "bonus_total": 117.4, "big_solo": 352.4, "reg_solo": 317.2, "grape": 5.92, "cherry": 32.97 }
  },
  "source": "juggler7.com (ボーナス確率はメーカー解析値、単独ボーナスは5号機比率推定値、ぶどう/チェリーはガリぞう実戦値。確度:高)"
}
```

#### `juggler_girls_ss.json` (SジャグラーガールズSS)
```json
{
  "id": "juggler_girls_ss",
  "display_name": "SジャグラーガールズSS",
  "grape_pattern": "flat",
  "key_metrics": ["reg_solo", "br_ratio", "bonus_total"],
  "big_payout": 240,
  "reg_payout": 96,
  "grape_payout": 8,
  "cherry_payout": 2,
  "settings": {
    "1": { "big": 273.1, "reg": 381.0, "bonus_total": 160.0, "big_solo": 389.5, "reg_solo": 523.8, "grape": 5.98, "cherry": 33.56 },
    "2": { "big": 270.8, "reg": 350.5, "big_solo": 383.1, "reg_solo": 485.3, "grape": 5.98, "cherry": 33.47 },
    "3": { "big": 260.1, "reg": 316.6, "big_solo": 371.5, "reg_solo": 440.1, "grape": 5.98, "cherry": 33.21 },
    "4": { "big": 250.1, "reg": 281.3, "big_solo": 352.4, "reg_solo": 399.2, "grape": 5.98, "cherry": 33.15 },
    "5": { "big": 243.6, "reg": 270.8, "big_solo": 340.0, "reg_solo": 385.2, "grape": 5.88, "cherry": 33.10 },
    "6": { "big": 226.0, "reg": 252.1, "bonus_total": 114.6, "big_solo": 313.7, "reg_solo": 358.9, "grape": 5.83, "cherry": 32.97 }
  },
  "source": "juggler7.com / note(pachiprotool) 実戦値 (確度:高)。ぶどう確率の設定差は小さく、判別における優先度は低い"
}
```

#### `ultra_miracle_juggler.json` (Sウルトラミラクルジャグラー)
```json
{
  "id": "ultra_miracle_juggler",
  "display_name": "Sウルトラミラクルジャグラー",
  "grape_pattern": "graduated",
  "key_metrics": ["reg_solo", "br_ratio", "grape"],
  "big_payout": 240,
  "reg_payout": 96,
  "grape_payout": 8,
  "cherry_payout": 2,
  "settings": {
    "1": { "big": 267.5, "reg": 425.6, "bonus_total": 164.3, "big_solo": 333.65, "reg_solo": 595.84, "cherry_reg": 1489.6, "grape": 5.93, "cherry": 35.1 },
    "2": { "big": 261.1, "reg": 402.1, "bonus_total": 158.3, "big_solo": 333.32, "reg_solo": 545.71, "cherry_reg": 1527.99, "grape": 5.93, "cherry": 35.0 },
    "3": { "big": 256.0, "reg": 350.5, "bonus_total": 147.9, "big_solo": 328.76, "reg_solo": 489.59, "cherry_reg": 1233.75, "grape": 5.93, "cherry": 34.8 },
    "4": { "big": 242.7, "reg": 322.8, "bonus_total": 138.6, "big_solo": 310.66, "reg_solo": 436.46, "cherry_reg": 1239.55, "grape": 5.93, "cherry": 34.7 },
    "5": { "big": 233.2, "reg": 297.9, "bonus_total": 130.8, "big_solo": 304.33, "reg_solo": 415.90, "cherry_reg": 1049.97, "grape": 5.87, "cherry": 33.5 },
    "6": { "big": 216.3, "reg": 277.7, "bonus_total": 121.6, "big_solo": 281.78, "reg_solo": 379.91, "cherry_reg": 1032.21, "grape": 5.81, "cherry": 33.0 }
  },
  "source": "juggler7.com (ボーナス確率はメーカー解析値、ぶどう/チェリー/単独・重複はガリぞう実戦値。確度:高)"
}
```

#### `aim_juggler_ex.json` (SアイムジャグラーEX / ネオアイムジャグラーEX)
```json
{
  "id": "aim_juggler_ex",
  "display_name": "SアイムジャグラーEX / ネオアイムジャグラーEX",
  "grape_pattern": "flat_except_6",
  "key_metrics": ["reg_solo", "br_ratio"],
  "big_payout": 252,
  "reg_payout": 96,
  "grape_payout": 8,
  "cherry_payout": 2,
  "settings": {
    "1": { "big": 273.1, "reg": 439.8, "bonus_total": 168.5, "big_solo": 389.2, "reg_solo": 633.4, "grape": 6.02 },
    "2": { "big": 269.7, "reg": 399.6, "bonus_total": 161.0, "big_solo": 381.5, "reg_solo": 568.7, "grape": 6.02 },
    "3": { "big": 269.7, "reg": 331.0, "bonus_total": 148.6, "big_solo": 381.5, "reg_solo": 471.4, "grape": 6.02 },
    "4": { "big": 259.0, "reg": 315.1, "bonus_total": 142.2, "big_solo": 370.0, "reg_solo": 446.3, "grape": 6.02 },
    "5": { "big": 259.0, "reg": 255.0, "bonus_total": 128.5, "big_solo": 370.0, "reg_solo": 361.7, "grape": 6.02 },
    "6": { "big": 255.0, "reg": 255.0, "bonus_total": 127.5, "big_solo": 361.7, "reg_solo": 361.7, "grape": 5.78 }
  },
  "source": "juggler7.com / 北電子公式値 (ボーナス確率・BIG獲得枚数252枚はメーカー公式確定値。ぶどう値はガリぞう実戦値(nana-press引用)。確度:最高)"
}
```

> 備考: ネオアイムジャグラーEXは6号機SアイムジャグラーEXと完全に同一のボーナス確率を持つことが複数ソースで確認されているため、同一データを共用する。UI上は別名称として選択可能にする。

---

## 3. 判別エンジン仕様(機種非依存)

### 3.1 設定判別ロジック

```typescript
interface JudgeInput {
  totalGames: number;
  bigCount: number;
  regCount: number;
  regSoloCount?: number;
  cherryRegCount?: number;
  grapeCount?: number;
}

interface JudgeResult {
  setting: "1"|"2"|"3"|"4"|"5"|"6";
  scorePerMetric: Record<string, number>; // 各指標の一致度(0-1)
  totalScore: number;
  brRatio?: number;
}

function judge(machine: MachineSpec, input: JudgeInput): JudgeResult[]
```

- 各設定について、入力値と `settings[N]` の各指標との差を正規化し、一致度スコアを算出
- `key_metrics` に含まれる指標を重み付けして合算
- BR比率 = REG確率の分母 / BIG確率の分母 として動的算出(データに無い場合も計算可能)
- 結果を設定1〜6でソートし、最も一致度の高い設定をハイライト

### 3.2 ぶどう/チェリー確率逆算ロジック

```typescript
interface ReverseCalcInput {
  mode: 1 | 2;
  totalGames: number;
  bigCount: number;
  regCount: number;
  netCoins: number;        // 差枚数
  cherryMode: "on" | "off"; // チェリー狙いOn(100%取得)/Off(50%取得)
  cherryCount?: number;     // モード1のみ必須
}

interface ReverseCalcResult {
  grapeRate: number;    // ぶどう確率(分母)
  cherryRate: number;   // チェリー確率(分母) ※モード2は理論値由来である旨をフラグで明示
  isCherryEstimated: boolean;
}

function reverseCalc(machine: MachineSpec, input: ReverseCalcInput): ReverseCalcResult
```

**共通の前提式**
```
投入総数 = totalGames × 3
払出総数 = 投入総数 + netCoins
ボーナス払出 = bigCount × big_payout + regCount × reg_payout
```
(リプレイは投入・払出が相殺されるため式から除外)

**モード1(チェリーカウントあり)**
```
チェリー払出 = cherryCount × cherry_payout
ぶどう払出 = 払出総数 - ボーナス払出 - チェリー払出
ぶどう回数 = ぶどう払出 / grape_payout
ぶどう確率(分母) = totalGames / ぶどう回数
チェリー確率(分母) = totalGames / cherryCount  // 実測値そのまま
isCherryEstimated = false
```

**モード2(チェリーカウントなし)**
```
仮定チェリー確率 = machine.settings の "3" or "4" (中間設定相当)の cherry値、
                  または全設定平均値をデフォルト採用
cherry_factor = cherryMode === "on" ? 1.0 : 0.5
チェリー回数(推定) = totalGames / 仮定チェリー確率 × cherry_factor
チェリー払出(推定) = チェリー回数(推定) × cherry_payout

ぶどう払出 = 払出総数 - ボーナス払出 - チェリー払出(推定)
ぶどう回数 = ぶどう払出 / grape_payout
ぶどう確率(分母) = totalGames / ぶどう回数
チェリー確率(分母) = 仮定チェリー確率  // 推定値である旨を表示
isCherryEstimated = true
```

> 注: `juggler_girls_ss` のように `cherry` データが無い設定(設定2-5)が存在する機種は、欠損値を線形補間またはデフォルト値で補う処理をエンジン側に実装する。

---

## 4. UI/UX要件

### 4.1 画面構成

1. **トップ/機種選択画面**
   - 8機種をカード形式で一覧表示(筐体写真は著作権の都合上、自作アイコン/カラーリングで代替)
   - 各カードに `grape_pattern` に応じたバッジ表示(例: 「設定6のみ突出」「ぶどう差小」等)

2. **設定判別画面**(機種選択後)
   - 入力フォーム: 総回転数、BIG、REG (+機種により単独REG・チェリー重複REG入力欄を動的表示)
   - 結果表示: 設定1〜6の一致度を視覚的に(バーチャート等)表示し、最有力設定をハイライト
   - 機種別注記: `grape_pattern` に応じた判別ヒントを表示
     - `flat_except_6`: 「設定6 or 設定1-5」の二値判定バッジ
     - `flat`: 「この機種はぶどう確率での判別が難しいため、REG確率を中心に判別してください」

3. **ぶどう/チェリー逆算画面**
   - モード選択UI(ラジオボタン: モード1/モード2)
   - モード1選択時のみチェリー回数入力欄を表示
   - 結果表示: 逆算したぶどう確率・チェリー確率と、機種別設定テーブルとの比較(どの設定に近いか)

### 4.2 デザイン方針(Claude Codeへの指示)

UI実装には `frontend-design` スキルを使用し、以下を踏まえて設計する。

- **題材**: パチスロ「ジャグラー」のGOGOランプ、筐体の発光・電飾感、データ・確率を扱う実用ツールという特性
- **配色**: ジャグラーの「光る」演出をモチーフにした、ダークベース+ネオン的アクセントカラー(例: 赤・黄・緑のGOGOランプカラーを機種バッジや判別結果のハイライトに使用)
- **タイポグラフィ**: 数値(確率データ)の視認性を最優先。データ表示には等幅フォントまたは数字に強いフォントを採用
- **レイアウト**: モバイル優先。ホールでの実機データ入力を想定し、入力フォームは大きめのタップ領域を確保
- **シグネチャー要素**: 判別結果のハイライト表示(GOGOランプの点灯を模した視覚効果など)を本ツールの特徴的UI要素として設計する

---

## 5. ディレクトリ構成案

```
JuggleSense/
├── app/
│   ├── page.tsx                  # トップ(機種選択)
│   ├── [machineId]/
│   │   ├── page.tsx               # 機種別判別画面
│   │   └── reverse/page.tsx       # ぶどう/チェリー逆算画面
│   └── layout.tsx
├── components/
│   ├── MachineCard.tsx
│   ├── JudgeForm.tsx
│   ├── JudgeResult.tsx
│   ├── ReverseCalcForm.tsx
│   └── ReverseCalcResult.tsx
├── lib/
│   ├── judge.ts                   # 3.1 判別エンジン
│   ├── reverseCalc.ts             # 3.2 逆算エンジン
│   └── types.ts                   # 2.1 共通スキーマ
├── data/
│   └── machines/
│       ├── myjuggler5.json
│       ├── funky_juggler2.json
│       ├── happy_juggler_v3.json
│       ├── gogo_juggler3.json
│       ├── juggler_girls_ss.json
│       ├── ultra_miracle_juggler.json
│       └── aim_juggler_ex.json
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## 6. 実装ステップ(Claude Code向けタスク分解)

1. Next.jsプロジェクト初期化(`npx create-next-app` / TypeScript / Tailwind)
2. `/data/machines/*.json` を上記定義通りに配置
3. `lib/types.ts` に型定義を実装
4. `lib/judge.ts` に判別エンジンを実装(ユニットテスト推奨)
5. `lib/reverseCalc.ts` に逆算エンジンを実装(ユニットテスト推奨)
6. `frontend-design` スキルを読み込み、デザイントークン(配色・タイポグラフィ・レイアウト)を策定
7. トップページ(機種選択)実装
8. 機種別判別画面実装
9. 逆算画面実装
10. レスポンシブ・アクセシビリティ確認(モバイル実機確認)
11. Vercelへデプロイ(GitHub連携 or Vercel CLI)

---

## 6.1 GitHub / Vercel 自動化(Claude Code実行)

以下のコマンドをClaude Codeに実行させることで、リポジトリ作成からデプロイまで自動化できる。

### 前提条件(初回のみ、人手での認証が必要)
```bash
gh auth login      # GitHub CLI認証(ブラウザでログイン)
vercel login       # Vercel CLI認証(ブラウザでログイン)
```

### 自動実行コマンド例
```bash
# 1. Gitリポジトリ初期化 & 初回コミット
git init
git add .
git commit -m "Initial commit: JuggleSense"

# 2. GitHubリポジトリ作成 & push
gh repo create JuggleSense --public --source=. --remote=origin --push

# 3. Vercelプロジェクトとして紐付け
vercel link --yes

# 4. 本番デプロイ
vercel --prod
```

- `gh repo create` は `--private` も選択可能
- `vercel link` 実行時にプロジェクト名・スコープ(個人/チーム)を聞かれるため、`--yes` で対話をスキップしデフォルト設定を使う、または事前に `vercel.json` で設定しておく
- 以降、`main`ブランチへのpushでVercelの自動デプロイ(Preview/Production)が有効になる(Vercel-GitHub連携がデフォルトで有効化されるため)

### 環境変数・シークレットの扱い
本ツールは現状外部APIキーを使用しない想定のため、`.env` 設定は不要。将来的にAI機能等を追加する場合は `vercel env add` で環境変数を登録する。

---

## 7. データ確度まとめ(再掲)

| 機種 | 確度 | 出典 |
|---|---|---|
| Sマイジャグラー5 | 高 | juggler7.com(メーカー解析値) |
| Sファンキージャグラー2 | 高 | note/jugglertopics(アプリ実測) |
| SハッピージャグラーV3 | 中〜高 | juggler7.com(5号機比率推定+アプリ実戦300万G) |
| Sゴーゴージャグラー3 | 高 | juggler7.com(メーカー解析値+ガリぞう実戦値) |
| SジャグラーガールズSS | 高 | juggler7.com/note(pachiprotool) |
| Sウルトラミラクルジャグラー | 高 | juggler7.com(メーカー解析値+ガリぞう実戦値) |
| SアイムジャグラーEX/ネオアイムEX | 最高 | juggler7.com(北電子公式値含む、BIG獲得枚数252枚は確定) |

すべての残課題は解消済み。このmdの内容をもとに実装に着手可能。
