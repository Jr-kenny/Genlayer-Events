// src/lib/genlayer.ts
import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

export const CONTRACT_ADDRESS = "0xA9485ec8a442189F25D70399f12dF370b23408fb";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;

// Initialize GenLayer client with private key authentication
export const initializeGenLayer = async () => {
  if (client) return client;

  const privateKey = import.meta.env.VITE_GENLAYER_KEY || "";
  if (!privateKey) {
    console.error("⚠️ Missing VITE_GENLAYER_KEY in environment");
    return null;
  }

  try {
    const account = createAccount(privateKey);
    client = createClient({ chain: studionet, account });

    await client.initializeConsensusSmartContract();
    console.log("✅ GenLayer consensus initialized");

    return client;
  } catch (error) {
    console.error("❌ Failed to initialize GenLayer:", error);
    return null;
  }
};

// Reset client (useful for re-initialization)
export const resetClient = () => {
  client = null;
};

// Get active client
export const getClient = () => client;

/**
 * Wait for transaction to be ACCEPTED, with appeal fallback.
 * - Polls until ACCEPTED or FINALIZED
 * - If consensus fails, automatically appeals and waits again
 */
export const waitForAcceptedWithAppeal = async (txHash: `0x${string}`) => {
  const activeClient = await initializeGenLayer();
  if (!activeClient) throw new Error("Client not initialized");

  try {
    const receipt = await activeClient.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.ACCEPTED,
      retries: 100,
      interval: 5000,
    });
    return receipt;
  } catch (err) {
    console.warn("⚠️ Transaction not ACCEPTED, attempting appeal...", err);

    // Appeal the transaction to request consensus again
    const appealHash = await activeClient.appealTransaction({ txId: txHash });

    const appealReceipt = await activeClient.waitForTransactionReceipt({
      hash: appealHash,
      status: TransactionStatus.ACCEPTED,
      retries: 100,
      interval: 5000,
    });

    return appealReceipt;
  }
};

// Parse contract-style date strings with fallback to custom parsing
// Handles both 24-hour format (1/6/2026T13:30:00) and 12-hour format (1/6/2026T2:00 PM:00)
export const parseContractDate = (raw: string): Date | null => {
  try {
    // First, try native JavaScript Date parsing
    const nativeDate = new Date(raw);
    if (!isNaN(nativeDate.getTime())) {
      return nativeDate;
    }

    // If native parsing fails, apply custom logic for contract format
    const [datePart, timePart] = raw.split("T");
    if (!datePart || !timePart) return null;

    const [month, day, year] = datePart.split("/");
    let hours: number, minutes: number;

    // Handle AM/PM format
    if (timePart.includes("AM") || timePart.includes("PM")) {
      const match = timePart.match(/(\d+):(\d+)\s?(AM|PM)/i);
      if (!match) return null;
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const meridian = match[3].toUpperCase();
      if (meridian === "PM" && hours < 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;
    } else {
      // 24-hour format
      const [h, m] = timePart.split(":");
      hours = parseInt(h, 10);
      minutes = parseInt(m, 10);
    }

    // Build Date object
    const iso = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      hours,
      minutes
    );
    return iso;
  } catch {
    return null;
  }
};