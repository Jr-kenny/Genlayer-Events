// src/lib/genlayer.ts
import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

export const CONTRACT_ADDRESS = "0xA9485ec8a442189F25D70399f12dF370b23408fb";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;

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

export const resetClient = () => {
  client = null;
};

export const getClient = () => client;

/**
 * Wait for transaction to be ACCEPTED, with appeal fallback.
 * Improved polling logic to handle long GenLayer consensus times (10min+).
 */
export const waitForAcceptedWithAppeal = async (txHash: `0x${string}`) => {
  const activeClient = await initializeGenLayer();
  if (!activeClient) throw new Error("Client not initialized");

  try {
    console.log(`⏳ Waiting for consensus on: ${txHash}`);
    // 120 retries * 10s = 20 minutes total wait window.
    // Shorter intervals keep the connection "warm" and prevent RPC timeouts.
    const receipt = await activeClient.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.ACCEPTED,
      retries: 120,
      interval: 10000, 
    });
    return receipt;
  } catch (err) {
    console.warn("⚠️ Primary wait period ended. Checking final status before appeal...", err);

    // Manual check: Did it fail, or did we just timeout?
    const currentTx = await activeClient.getTransactionReceipt({ hash: txHash });

    // If it's still PENDING/PROPOSED after 20 mins, something is wrong with the node.
    // If it's REJECTED or FINALIZED (but not accepted), we appeal.
    if (currentTx.status === TransactionStatus.REJECTED) {
      console.log("🔄 Transaction REJECTED. Attempting appeal...");
      const appealHash = await activeClient.appealTransaction({ txId: txHash });

      return await activeClient.waitForTransactionReceipt({
        hash: appealHash,
        status: TransactionStatus.ACCEPTED,
        retries: 60,
        interval: 10000,
      });
    }

    // If it's still processing, you might need to increase retries even further.
    throw new Error(`Transaction state is ${currentTx.status}. Consensus is taking too long.`);
  }
};

export const parseContractDate = (raw: string): Date | null => {
  try {
    const nativeDate = new Date(raw);
    if (!isNaN(nativeDate.getTime())) {
      return nativeDate;
    }

    const [datePart, timePart] = raw.split("T");
    if (!datePart || !timePart) return null;

    const [month, day, year] = datePart.split("/");
    let hours: number, minutes: number;

    if (timePart.includes("AM") || timePart.includes("PM")) {
      const match = timePart.match(/(\d+):(\d+)\s?(AM|PM)/i);
      if (!match) return null;
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const meridian = match[3].toUpperCase();
      if (meridian === "PM" && hours < 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;
    } else {
      const [h, m] = timePart.split(":");
      hours = parseInt(h, 10);
      minutes = parseInt(m, 10);
    }

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      hours,
      minutes
    );
  } catch {
    return null;
  }
};
