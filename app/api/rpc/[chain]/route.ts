import { NextResponse } from "next/server";

const CHAIN_RPC_URLS: Record<string, string> = {
  base: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  celo: `https://celo-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  optimism: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
};

// Whitelist of safe read-only RPC methods
const ALLOWED_METHODS = new Set([
  "eth_call",
  "eth_getBalance",
  "eth_getTransactionCount",
  "eth_getCode",
  "eth_getStorageAt",
  "eth_blockNumber",
  "eth_getBlockByNumber",
  "eth_getBlockByHash",
  "eth_getTransactionByHash",
  "eth_getTransactionReceipt",
  "eth_getLogs",
  "eth_chainId",
  "eth_gasPrice",
  "eth_estimateGas",
  "eth_feeHistory",
  "eth_maxPriorityFeePerGas",
  "net_version",
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chain: string }> }
) {
  const { chain } = await params;
  const rpcUrl = CHAIN_RPC_URLS[chain];

  if (!rpcUrl) {
    return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Validate RPC method is whitelisted
    const method = body?.method;
    if (!method || typeof method !== "string" || !ALLOWED_METHODS.has(method)) {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 403 }
      );
    }

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`${chain} RPC proxy error:`, error);
    return NextResponse.json({ error: "RPC request failed" }, { status: 500 });
  }
}
