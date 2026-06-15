import { notFound } from "next/navigation";
import { getMachine } from "@/lib/machines";
import { ReversePageClient } from "@/components/ReversePageClient";

export default async function ReversePage({
  params,
}: {
  params: Promise<{ machineId: string }>;
}) {
  const { machineId } = await params;
  const machine = getMachine(machineId);
  if (!machine) notFound();
  return <ReversePageClient machine={machine} machineId={machineId} />;
}
