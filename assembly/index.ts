import { OracleProgram } from "@seda-protocol/as-sdk/assembly";
import { Console, Process } from "@seda-protocol/as-sdk/assembly";
import { httpFetch } from "@seda-protocol/as-sdk/assembly";

// API response structure for the price feed
@json
class PriceFeedResponse {
  price!: string;
}

class PriceFeed extends OracleProgram {
  execution(): void {
    executionPhase();
  }

  tally(): void {
    tallyPhase();
  }
}

// Runs the PriceFeed oracle program by executing both phases.
new PriceFeed().run();

function executionPhase(): void {
  // Retrieve the input parameters for the data request (DR)
  const drInputsRaw = Process.getInputs().toUtf8String();
  const drInputs = drInputsRaw.split("-");
  const symbolA = drInputs[0];
  const symbolB = drInputs[1];

  // Log the asset pair being fetched
  Console.log(`Fetching price for pair: ${drInputsRaw}`);

  // Make an HTTP request to a price feed API to get the price for the symbol pair
  const response = httpFetch(
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbolA.toUpperCase()}${symbolB.toUpperCase()}`
  );

  // Parse the API response
  const data = response.bytes.toJSON<PriceFeedResponse>();
  
  // Convert to integer (and multiply by 1e6 to avoid losing precision)
  const priceFloat = f32.parse(data.price);
  const result = u128.from(priceFloat * 1000000);

  // Log the fetched price
  Console.log(`Fetched price for ${symbolA}-${symbolB}: ${result.toString()}`);
}

function tallyPhase(): void {
  // Implement your tallying logic if needed
  Console.log("Tally phase executed.");
}
