import { Console, Process, Bytes } from "@seda-protocol/as-sdk/assembly";
import { httpFetch } from "@seda-protocol/as-sdk/assembly";

@json
class PriceFeedResponse {
  price!: string;
}

export function executionPhase(): void {
  const drInputsRaw = Process.getInputs().toUtf8String();
  Console.log(`Fetching price for pair: ${drInputsRaw}`);

  const drInputs = drInputsRaw.split("-");
  const symbolA = drInputs[0];
  const symbolB = drInputs[1];

  const response = httpFetch(
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbolA.toUpperCase()}${symbolB.toUpperCase()}`
  );

  if (!response.ok) {
    Console.log(`Error fetching price: ${response.status}`);
    Process.error(Bytes.fromUtf8String("Error fetching price data"));
    return;
  }

  const data = response.bytes.toJSON<PriceFeedResponse>();
  const priceFloat = parseFloat(data.price);
  const result = i64(priceFloat * 1000000);

  Console.log(`Fetched price for ${symbolA}-${symbolB}: ${result.toString()}`);
  
  // Convert i64 to string and then to Bytes
  const resultString = result.toString();
  const resultBytes = Bytes.fromUtf8String(resultString);
  
  Process.success(resultBytes);
}