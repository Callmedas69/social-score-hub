/**
 * Alchemy API Repository
 *
 * Handles data access to Alchemy's asset transfer and receipt APIs.
 * Returns raw API data - no business logic.
 */

import {
  AlchemyTransfer,
  AlchemyTransfersResponse,
  TransactionReceipt,
  RepositoryError,
} from "./types";

function getAlchemyUrl(): string {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new RepositoryError("Alchemy API key not configured", 500, "Alchemy");
  }
  return `https://base-mainnet.g.alchemy.com/v2/${apiKey}`;
}

/**
 * Fetch all asset transfers for an address (with pagination)
 *
 * @param address - Ethereum address
 * @param direction - "from" for outgoing, "to" for incoming
 * @returns Array of raw transfer data
 */
export async function fetchAssetTransfers(
  address: string,
  direction: "from" | "to"
): Promise<AlchemyTransfer[]> {
  const url = getAlchemyUrl();
  const allTransfers: AlchemyTransfer[] = [];
  let pageKey: string | undefined;

  do {
    const params: Record<string, unknown> = {
      category: ["external", "erc20", "erc721", "erc1155"],
      maxCount: "0x3e8", // 1000 per page
      order: "desc",
      withMetadata: true,
    };

    if (direction === "from") {
      params.fromAddress = address;
    } else {
      params.toAddress = address;
    }

    if (pageKey) {
      params.pageKey = pageKey;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getAssetTransfers",
        params: [params],
      }),
    });

    if (!response.ok) {
      throw new RepositoryError(
        `Alchemy API error: ${response.status}`,
        response.status,
        "Alchemy"
      );
    }

    const data: AlchemyTransfersResponse = await response.json();

    if ((data as unknown as { error?: { message: string } }).error) {
      throw new RepositoryError(
        `Alchemy error: ${(data as unknown as { error: { message: string } }).error.message}`,
        undefined,
        "Alchemy"
      );
    }

    const transfers = data.result?.transfers || [];
    allTransfers.push(...transfers);
    pageKey = data.result?.pageKey;
  } while (pageKey);

  return allTransfers;
}

/**
 * Fetch transaction receipts in batch
 *
 * @param hashes - Array of transaction hashes
 * @returns Map of hash to receipt data
 */
export async function fetchTransactionReceipts(
  hashes: string[]
): Promise<Map<string, TransactionReceipt>> {
  const receiptMap = new Map<string, TransactionReceipt>();

  if (hashes.length === 0) return receiptMap;

  const url = getAlchemyUrl();

  try {
    // Create batch JSON-RPC request
    const batchRequest = hashes.map((hash, index) => ({
      jsonrpc: "2.0",
      id: index,
      method: "eth_getTransactionReceipt",
      params: [hash],
    }));

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batchRequest),
    });

    if (!response.ok) {
      console.error(`Receipt batch fetch failed: ${response.status}`);
      return receiptMap;
    }

    const results = await response.json();

    if (Array.isArray(results)) {
      for (const result of results) {
        const receipt = result?.result;
        if (receipt?.transactionHash && receipt?.gasUsed && receipt?.effectiveGasPrice) {
          receiptMap.set(receipt.transactionHash.toLowerCase(), {
            gasUsed: receipt.gasUsed,
            effectiveGasPrice: receipt.effectiveGasPrice,
          });
        }
      }
    }

    return receiptMap;
  } catch (error) {
    console.error("Failed to fetch receipts batch:", error);
    return receiptMap;
  }
}
