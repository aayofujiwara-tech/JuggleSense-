import type { MachineSpec } from "./types";
import myjuggler5 from "@/data/machines/myjuggler5.json";
import funky_juggler2 from "@/data/machines/funky_juggler2.json";
import happy_juggler_v3 from "@/data/machines/happy_juggler_v3.json";
import gogo_juggler3 from "@/data/machines/gogo_juggler3.json";
import juggler_girls_ss from "@/data/machines/juggler_girls_ss.json";
import ultra_miracle_juggler from "@/data/machines/ultra_miracle_juggler.json";
import aim_juggler_ex from "@/data/machines/aim_juggler_ex.json";

export const machines: MachineSpec[] = [
  myjuggler5,
  funky_juggler2,
  happy_juggler_v3,
  gogo_juggler3,
  juggler_girls_ss,
  ultra_miracle_juggler,
  aim_juggler_ex,
] as MachineSpec[];

export function getMachine(id: string): MachineSpec | undefined {
  return machines.find((m) => m.id === id);
}
