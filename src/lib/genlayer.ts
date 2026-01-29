import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export const CONTRACT_ADDRESS = "0x93D983DbC653542d9226807f9397e25DcDC975A8";

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
