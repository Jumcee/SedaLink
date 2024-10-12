import { Process, Tally, Bytes, Console } from "@seda-protocol/as-sdk/assembly";

export function tallyPhase(): void {
  const reveals = Tally.getReveals();
  const validResults: i64[] = [];

  for (let i = 0; i < reveals.length; i++) {
    if (reveals[i].inConsensus) {
      validResults.push(reveals[i].reveal.toI64());
    }
  }

  if (validResults.length > 0) {
    // Use median for aggregation
    validResults.sort((a, b) => a - b);
    const medianIndex = validResults.length / 2;
    const finalResult = validResults[medianIndex];
    
    Console.log(`Final result: ${finalResult.toString()}`);
    
    // Convert i64 to string and then to Bytes
    const resultString = finalResult.toString();
    const resultBytes = Bytes.fromUtf8String(resultString);
    
    Process.success(resultBytes);
  } else {
    Console.log("No consensus reached");
    Process.error(Bytes.fromUtf8String("No consensus reached"));
  }
}