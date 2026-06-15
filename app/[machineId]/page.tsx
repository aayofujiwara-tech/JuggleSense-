import { notFound } from "next/navigation";
import { getMachine } from "@/lib/machines";
import { MachinePageClient } from "@/components/MachinePageClient";

export default async function MachinePage({
  params,
}: {
  params: Promise<{ machineId: string }>;
}) {
  const { machineId } = await params;
  const machine = getMachine(machineId);
  if (!machine) notFound();
  return <MachinePageClient machine={machine} machineId={machineId} />;
}
