import { NextResponse } from "next/server";
import { isValidAddress } from "@/lib/validation";

const ALCHEMY_BASE_URL = `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

interface AlchemyTransfer {
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  category: string;
  blockNum: string; // hex
  metadata: {
    blockTimestamp: string;
  };
}

interface AlchemyResponse {
  jsonrpc: string;
  id: number;
  result: {
    transfers: AlchemyTransfer[];
    pageKey?: string;
  };
}


async function fetchAllTransfers(
  address: string,
  direction: "from" | "to"
): Promise<AlchemyTransfer[]> {
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

    const response = await fetch(ALCHEMY_BASE_URL, {
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
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data: AlchemyResponse = await response.json();

    if ((data as unknown as { error?: { message: string } }).error) {
      throw new Error(`Alchemy error: ${(data as unknown as { error: { message: string } }).error.message}`);
    }

    const transfers = data.result?.transfers || [];
    allTransfers.push(...transfers);
    pageKey = data.result?.pageKey;

  } while (pageKey);

  return allTransfers;
}

// Batch fetch receipts by transaction hashes
async function fetchReceiptsBatch(
  hashes: string[]
): Promise<Map<string, { gasUsed: string; effectiveGasPrice: string }>> {
  const receiptMap = new Map<string, { gasUsed: string; effectiveGasPrice: string }>();

  if (hashes.length === 0) return receiptMap;

  try {
    // Create batch JSON-RPC request
    const batchRequest = hashes.map((hash, index) => ({
      jsonrpc: "2.0",
      id: index,
      method: "eth_getTransactionReceipt",
      params: [hash],
    }));

    const response = await fetch(ALCHEMY_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batchRequest),
    });

    if (!response.ok) {
      console.error(`Receipt batch fetch failed: ${response.status}`);
      return receiptMap;
    }

    const results = await response.json();

    // Handle batch response (array of results)
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Validate address format
    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    if (!process.env.ALCHEMY_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Fetch ALL transfers (with pagination)
    const [outgoing, incoming] = await Promise.all([
      fetchAllTransfers(address, "from"),
      fetchAllTransfers(address, "to"),
    ]);

    // Combine and deduplicate by hash
    const seen = new Set<string>();
    const allTransfers: AlchemyTransfer[] = [];

    for (const transfer of [...outgoing, ...incoming]) {
      if (!seen.has(transfer.hash)) {
        seen.add(transfer.hash);
        allTransfers.push(transfer);
      }
    }

    // Sort by timestamp descending
    allTransfers.sort((a, b) => {
      const timeA = new Date(a.metadata.blockTimestamp).getTime();
      const timeB = new Date(b.metadata.blockTimestamp).getTime();
      return timeB - timeA;
    });

    // Get outgoing transaction hashes (need gas data for these)
    const outgoingHashes: string[] = [];
    for (const tx of allTransfers) {
      if (tx.from.toLowerCase() === address.toLowerCase()) {
        outgoingHashes.push(tx.hash);
      }
    }

    // Fetch receipts in batches of 100 (Alchemy supports up to 1000 per batch)
    let allReceipts = new Map<string, { gasUsed: string; effectiveGasPrice: string }>();

    for (let i = 0; i < outgoingHashes.length; i += 100) {
      const batch = outgoingHashes.slice(i, i + 100);
      const batchReceipts = await fetchReceiptsBatch(batch);
      // Merge results
      for (const [hash, data] of batchReceipts) {
        allReceipts.set(hash, data);
      }
    }

    // Normalize transaction data with gas info
    const transactions = allTransfers.map((tx) => {
      const receipt = allReceipts.get(tx.hash.toLowerCase());
      return {
        hash: tx.hash,
        timestamp: Math.floor(new Date(tx.metadata.blockTimestamp).getTime() / 1000),
        from: tx.from.toLowerCase(),
        to: tx.to?.toLowerCase() || null,
        value: tx.value?.toString() || "0",
        isError: false,
        isContractInteraction: tx.category !== "external",
        gasUsed: receipt?.gasUsed || null,
        effectiveGasPrice: receipt?.effectiveGasPrice || null,
      };
    });

    // Return with cache headers (client-side TanStack Query handles caching)
    return NextResponse.json(
      { transactions },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
