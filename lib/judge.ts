import type { MachineSpec, JudgeInput, JudgeResult, SettingSpec } from "./types";

const SETTINGS = ["1", "2", "3", "4", "5", "6"] as const;
type SettingKey = (typeof SETTINGS)[number];

function calcActualValues(input: JudgeInput): Record<string, number> {
  const vals: Record<string, number> = {};
  if (input.totalGames > 0) {
    if (input.bigCount > 0) vals.big = input.totalGames / input.bigCount;
    if (input.regCount > 0) vals.reg = input.totalGames / input.regCount;
    const bonus = input.bigCount + input.regCount;
    if (bonus > 0) vals.bonus_total = input.totalGames / bonus;
    if (input.bigCount > 0 && input.regCount > 0)
      vals.br_ratio = (input.totalGames / input.regCount) / (input.totalGames / input.bigCount);
    if (input.regSoloCount && input.regSoloCount > 0)
      vals.reg_solo = input.totalGames / input.regSoloCount;
    if (input.cherryRegCount && input.cherryRegCount > 0)
      vals.cherry_reg = input.totalGames / input.cherryRegCount;
    if (input.grapeCount && input.grapeCount > 0)
      vals.grape = input.totalGames / input.grapeCount;
  }
  return vals;
}

function getSettingValues(spec: SettingSpec, totalGames: number, bigCount: number, regCount: number): Record<string, number> {
  const vals: Record<string, number> = {};
  if (spec.big) vals.big = spec.big;
  if (spec.reg) vals.reg = spec.reg;
  if (spec.bonus_total) vals.bonus_total = spec.bonus_total;
  if (spec.big && spec.reg) vals.br_ratio = spec.reg / spec.big;
  if (spec.reg_solo) vals.reg_solo = spec.reg_solo;
  if (spec.cherry_reg) vals.cherry_reg = spec.cherry_reg;
  if (spec.grape) vals.grape = spec.grape;
  void totalGames; void bigCount; void regCount;
  return vals;
}

function calcSimilarity(actual: number, theoretical: number): number {
  const ratio = actual / theoretical;
  return Math.exp(-Math.abs(Math.log(ratio)) * 3);
}

const METRIC_WEIGHTS: Record<string, number> = {
  bonus_total: 1.5,
  reg_solo: 1.5,
  br_ratio: 1.2,
  grape: 1.0,
  reg: 1.0,
  big: 0.8,
  cherry_reg: 1.2,
  big_solo: 0.8,
};

export function judge(machine: MachineSpec, input: JudgeInput): JudgeResult[] {
  const actualValues = calcActualValues(input);
  const results: JudgeResult[] = [];

  for (const s of SETTINGS) {
    const spec = machine.settings[s];
    const theorValues = getSettingValues(spec, input.totalGames, input.bigCount, input.regCount);

    const keySet = new Set([...machine.key_metrics, ...Object.keys(actualValues)]);
    let totalWeight = 0;
    let weightedScore = 0;
    const scorePerMetric: Record<string, number> = {};

    for (const metric of keySet) {
      const actual = actualValues[metric];
      const theor = theorValues[metric];
      if (actual == null || theor == null) continue;

      const weight = METRIC_WEIGHTS[metric] ?? 1.0;
      const keyBonus = machine.key_metrics.includes(metric) ? 1.5 : 1.0;
      const effectiveWeight = weight * keyBonus;

      const sim = calcSimilarity(actual, theor);
      scorePerMetric[metric] = sim;
      weightedScore += sim * effectiveWeight;
      totalWeight += effectiveWeight;
    }

    const totalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

    results.push({
      setting: s,
      scorePerMetric,
      totalScore,
      brRatio: theorValues.br_ratio,
      actualValues,
    });
  }

  return results.sort((a, b) => b.totalScore - a.totalScore);
}
