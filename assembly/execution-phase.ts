import { httpFetch } from "@seda-protocol/as-sdk/assembly";
import { Console, Process } from "@seda-protocol/as-sdk/assembly";

export function executionPhase(): void {
  // Get inputs (e.g., policy ID or location for weather data)
  const inputs = Process.getInputs().toUtf8String();
  Console.log(`Executing DeFi Insurance Oracle with inputs: ${inputs}`);

  // Fetch Weather Data
  const weatherResponse = httpFetch(`https://api.openweathermap.org/data/2.5/weather?q=${inputs}&appid=YOUR_API_KEY`);
  if (!weatherResponse.ok) {
    Process.error(Bytes.fromUtf8String("Error fetching weather data"));
    return;
  }
  const weatherData = weatherResponse.bytes.toUtf8String();

  // Fetch On-chain Data (e.g., token price, lending rates)
  const defiResponse = httpFetch(`https://api.chainlink.com/v2/token-prices/${inputs}`);
  if (!defiResponse.ok) {
    Process.error(Bytes.fromUtf8String("Error fetching DeFi data"));
    return;
  }
  const defiData = defiResponse.bytes.toUtf8String();

  // Log both data points
  Console.log(`Weather Data: ${weatherData}`);
  Console.log(`DeFi Data: ${defiData}`);

  // Process the data and send it for tally
  const result = processData(weatherData, defiData);
  Process.success(Bytes.fromUtf8String(result));
}

function processData(weatherData: string, defiData: string): string {
  // Combine weather and DeFi data into a payout calculation
  return `Processed data for weather: ${weatherData} and DeFi: ${defiData}`;
}
