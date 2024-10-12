import { afterEach, describe, it, expect, mock } from "bun:test";
import { file } from "bun";
import { testOracleProgramExecution, testOracleProgramTally } from "@seda-protocol/dev-tools";
import { BigNumber } from 'bignumber.js';

const WASM_PATH = "build/debug.wasm";
const fetchMock = mock();

afterEach(() => {
  fetchMock.mockRestore();
});

describe("data request execution", () => {
  it("should aggregate the results from the different APIs", async () => {
    fetchMock.mockImplementation((url) => {
      if (url.host === "api.binance.com") {
        return new Response(JSON.stringify({ price: "2452.30000" }));
      }
      return new Response('Unknown request');
    });

    const wasmBinary = await file(WASM_PATH).arrayBuffer();
    const vmResult = await testOracleProgramExecution(
      Buffer.from(wasmBinary),
      Buffer.from("eth-usdc"),
      fetchMock
    );

    expect(vmResult.exitCode).toBe(0);

    // Convert the result to a BigNumber
    const hex = Buffer.from(vmResult.result.toReversed()).toString('hex');
    const result = BigNumber(`0x${hex}`);
    console.log('Result:', result.toString());

    // Verify the expected result
    expect(result).toEqual(BigNumber('2452300032')); // Ensure this value is what you expect based on your implementation
  });


  it("should return an error when fetching price fails", async () => {
    fetchMock.mockImplementation((url) => {
      return new Response('Error fetching data', { status: 500 });
    });

    const wasmBinary = await file(WASM_PATH).arrayBuffer();
    const vmResult = await testOracleProgramExecution(
      Buffer.from(wasmBinary),
      Buffer.from("eth-usdc"),
      fetchMock
    );

    expect(vmResult.exitCode).not.toBe(0); // Ensure you expect a failure
  });
});

describe("data request tally", () => {
  it("should tally all results in a single data point", async () => {
    const wasmBinary = await file(WASM_PATH).arrayBuffer();

    const buffer = Buffer.from([0, 33, 43, 146, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const vmResult = await testOracleProgramTally(Buffer.from(wasmBinary), Buffer.from('tally-inputs'), [{
      exitCode: 0,
      gasUsed: 0,
      inConsensus: true,
      result: buffer,
    }]);

    expect(vmResult.exitCode).toBe(0);

    const hex = Buffer.from(vmResult.result).toString('hex');
    const result = BigNumber(`0x${hex}`);
    expect(result).toEqual(BigNumber('2452300032'));
  });

  it("should return an error when no consensus is reached", async () => {
    const wasmBinary = await file(WASM_PATH).arrayBuffer();

    const vmResult = await testOracleProgramTally(Buffer.from(wasmBinary), Buffer.from('tally-inputs'), [{
      exitCode: 1,
      gasUsed: 0,
      inConsensus: false,
      result: Buffer.alloc(0), // Empty buffer to simulate no result
    }]);

    expect(vmResult.exitCode).not.toBe(0); // Ensure you expect a failure
  });
});
