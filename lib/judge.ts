import type { MachineSpec, JudgeInput, JudgeResult } from "./types";

const SETTINGS = ["1", "2", "3", "4", "5", "6"] as const;

function logGamma(x: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function logCombination(n: number, k: number): number {
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

function logBinomialPMF(k: number, n: number, p: number): number {
  if (p <= 0 || p >= 1) return -Infinity;
  return logCombination(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
}

function calcActualValues(input: JudgeInput): Record<string, number> {
  const vals: Record<string, number> = {};
  if (input.totalGames > 0) {
    if (input.bigCount > 0) vals.big = input.totalGames / input.bigCount;
    if (input.regCount > 0) vals.reg = input.totalGames / input.regCount;
    const bonus = input.bigCount + input.regCount;
    if (bonus > 0) vals.bonus_total = input.totalGames / bonus;
    if (input.bigCount > 0 && input.regCount > 0)
      vals.br_ratio = input.regCount / input.bigCount;
    if (input.regSoloCount && input.regSoloCount > 0)
      vals.reg_solo = input.totalGames / input.regSoloCount;
    if (input.cherryRegCount && input.cherryRegCount > 0)
      vals.cherry_reg = input.totalGames / input.cherryRegCount;
    if (input.grapeCount && input.grapeCount > 0)
      vals.grape = input.totalGames / input.grapeCount;
  }
  return vals;
}

export function judge(machine: MachineSpec, input: JudgeInput): JudgeResult[] {
  const actualValues = calcActualValues(input);

  const logLikelihoods = SETTINGS.map((s) => {
    const spec = machine.settings[s];
    let logL = 0;

    if (input.bigCount > 0 && spec.big) {
      logL += logBinomialPMF(input.bigCount, input.totalGames, 1 / spec.big);
    }
    if (input.regCount > 0 && spec.reg) {
      logL += logBinomialPMF(input.regCount, input.totalGames, 1 / spec.reg);
    }
    if (input.regSoloCount && spec.reg_solo) {
      logL += logBinomialPMF(input.regSoloCount, input.totalGames, 1 / spec.reg_solo);
    }
    if (input.cherryRegCount && spec.cherry_reg) {
      logL += logBinomialPMF(input.cherryRegCount, input.totalGames, 1 / spec.cherry_reg);
    }
    if (input.grapeCount && spec.grape) {
      logL += logBinomialPMF(input.grapeCount, input.totalGames, 1 / spec.grape);
    }

    return {
      setting: s,
      logL,
      brRatio: spec.big && spec.reg ? spec.reg / spec.big : undefined,
    };
  });

  const maxLogL = Math.max(...logLikelihoods.map((r) => r.logL));
  const expScores = logLikelihoods.map((r) => Math.exp(r.logL - maxLogL));
  const sumExp = expScores.reduce((a, b) => a + b, 0);

  return logLikelihoods
    .map((r, i) => ({
      setting: r.setting,
      probability: expScores[i] / sumExp,
      brRatio: r.brRatio,
      actualValues,
    }))
    .sort((a, b) => b.probability - a.probability);
}
