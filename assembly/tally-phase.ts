import { Process, Tally } from "@seda-protocol/as-sdk/assembly";

export function tallyPhase(): void {
  const reveals = Tally.getReveals();
  const combinedResults: string[] = [];

  for (let i = 0; i < reveals.length; i++) {
    combinedResults.push(reveals[i].reveal.toUtf8String());
  }

  if (combinedResults.length > 0) {
    // Aggregate the results to make a decision (e.g., insurance payout)
    const finalResult = aggregateResults(combinedResults);
    Process.success(Bytes.fromUtf8String(finalResult));
  } else {
    Process.error(Bytes.fromUtf8String("No consensus reached"));
  }
}

function aggregateResults(results: string[]): string {
  // Example: use median or other logic to calculate payouts
  return `Final Insurance Decision based on ${results}`;
}
