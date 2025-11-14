import { BrowserProvider, JsonRpcSigner } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function getProvider(): Promise<BrowserProvider | null> {
  if (typeof window.ethereum === "undefined") {
    return null;
  }
  return new BrowserProvider(window.ethereum);
}

export async function requestAccounts(): Promise<string[]> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  return await window.ethereum.request({ method: "eth_requestAccounts" });
}

export async function getSigner(): Promise<JsonRpcSigner | null> {
  const provider = await getProvider();
  if (!provider) return null;
  return await provider.getSigner();
}

export async function signMessage(message: string): Promise<string> {
  const signer = await getSigner();
  if (!signer) {
    throw new Error("No signer available");
  }
  return await signer.signMessage(message);
}

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return "";
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export async function getNetwork(): Promise<string> {
  const provider = await getProvider();
  if (!provider) return "Unknown";
  const network = await provider.getNetwork();
  return network.name === "unknown" ? `Chain ${network.chainId}` : network.name;
}
