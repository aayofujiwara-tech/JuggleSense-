import type { MachineSpec, ReverseCalcInput, ReverseCalcResult } from "./types";

function getDefaultCherryRate(machine: MachineSpec): number {
  const settings = machine.settings;
  const rates = (["3", "4"] as const)
    .map((s) => settings[s]?.cherry)
    .filter((v): v is number => v != null);

  if (rates.length > 0) return rates.reduce((a, b) => a + b, 0) / rates.length;

  const allRates = (["1", "2", "3", "4", "5", "6"] as const)
    .map((s) => settings[s]?.cherry)
    .filter((v): v is number => v != null);

  if (allRates.length > 0) return allRates.reduce((a, b) => a + b, 0) / allRates.length;

  return 33.3;
}

export function reverseCalc(machine: MachineSpec, input: ReverseCalcInput): ReverseCalcResult {
  const { totalGames, bigCount, regCount, netCoins, cherryMode, cherryCount, mode } = input;

  const totalIn = totalGames * 3;
  const totalOut = totalIn + netCoins;
  const bonusPayout = bigCount * machine.big_payout + regCount * machine.reg_payout;

  const cherryFactor = cherryMode === "on" ? 1.0 : 0.5;

  let actualCherryCount: number;
  let isCherryEstimated: boolean;
  let cherryRate: number;

  if (mode === 1 && cherryCount != null && cherryCount > 0) {
    actualCherryCount = cherryCount;
    isCherryEstimated = false;
    cherryRate = totalGames / cherryCount;
  } else {
    const defaultRate = getDefaultCherryRate(machine);
    actualCherryCount = (totalGames / defaultRate) * cherryFactor;
    isCherryEstimated = true;
    cherryRate = defaultRate;
  }

  const cherryPayout = actualCherryCount * machine.cherry_payout;
  const grapePayout = totalOut - bonusPayout - cherryPayout;
  const grapeCount = machine.grape_payout > 0 ? grapePayout / machine.grape_payout : 0;
  const grapeRate = grapeCount > 0 ? totalGames / grapeCount : 0;

  return {
    grapeRate,
    cherryRate,
    isCherryEstimated,
    grapeCount: Math.max(0, grapeCount),
    cherryCount: actualCherryCount,
  };
}
