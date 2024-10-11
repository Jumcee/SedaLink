import { Console, Process } from "@seda-protocol/as-sdk/assembly";
import { httpFetch } from "@seda-protocol/as-sdk/assembly";

// API response structure for the price feed
@json
class PriceFeedResponse {
  price!: string;
}

function executionPhase(): void {
  // Retrieve the input parameters for the data request (DR).
  const drInputsRaw = Process.getInputs().toUtf8String();
  Console.log(`Fetching price for pair: ${drInputsRaw}`);

  // Split the input string into symbolA and symbolB.
  const drInputs = drInputsRaw.split("-");
  const symbolA = drInputs[0];
  const symbolB = drInputs[1];

  // Fetch price from API
  const response = httpFetch(
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbolA.toUpperCase()}${symbolB.toUpperCase()}`
  );
  const data = response.bytes.toJSON<PriceFeedResponse>();

  // Convert price to i64 to avoid precision loss
  const priceFloat = f32.parse(data.price);
  const result = i64(priceFloat * 1000000); // Use i64 instead of u128

  // Log the fetched price
  Console.log(`Fetched price for ${symbolA}-${symbolB}: ${String(result)}`); // Use String()
}
