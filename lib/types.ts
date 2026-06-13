export type GrapePattern =
  | "graduated"
  | "graduated_small"
  | "graduated_inverse_cherry"
  | "flat"
  | "flat_except_6";

export interface SettingSpec {
  big?: number;
  reg?: number;
  bonus_total?: number;
  big_solo?: number;
  reg_solo?: number;
  cherry_reg?: number;
  cherry_big?: number;
  grape?: number;
  cherry?: number;
}

export interface MachineSpec {
  id: string;
  display_name: string;
  grape_pattern: GrapePattern;
  key_metrics: string[];
  big_payout: number;
  reg_payout: number;
  grape_payout: number;
  cherry_payout: number;
  settings: Record<"1" | "2" | "3" | "4" | "5" | "6", SettingSpec>;
  source: string;
}

export interface JudgeInput {
  totalGames: number;
  bigCount: number;
  regCount: number;
  regSoloCount?: number;
  cherryRegCount?: number;
  grapeCount?: number;
}

export interface JudgeResult {
  setting: "1" | "2" | "3" | "4" | "5" | "6";
  scorePerMetric: Record<string, number>;
  totalScore: number;
  brRatio?: number;
  actualValues: Record<string, number>;
}

export interface ReverseCalcInput {
  mode: 1 | 2;
  totalGames: number;
  bigCount: number;
  regCount: number;
  netCoins: number;
  cherryMode: "on" | "off";
  cherryCount?: number;
}

export interface ReverseCalcResult {
  grapeRate: number;
  cherryRate: number;
  isCherryEstimated: boolean;
  grapeCount: number;
  cherryCount: number;
}
