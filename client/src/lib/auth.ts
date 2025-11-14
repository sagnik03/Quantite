import { apiRequest } from "./queryClient";

const TOKEN_KEY = "auth_token";
const WALLET_KEY = "wallet_address";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(WALLET_KEY);
}

export function getWalletAddress(): string | null {
  return localStorage.getItem(WALLET_KEY);
}

export function setWalletAddress(address: string): void {
  localStorage.setItem(WALLET_KEY, address);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export async function requestNonce(walletAddress: string): Promise<string> {
  const response = await apiRequest<{ nonce: string }>("POST", "/api/auth/nonce", {
    walletAddress,
  });
  return response.nonce;
}

export async function verifySignature(
  walletAddress: string,
  signature: string,
  nonce: string
): Promise<{ token: string; isAdmin: boolean }> {
  const response = await apiRequest<{ token: string; isAdmin: boolean }>(
    "POST",
    "/api/auth/verify",
    {
      walletAddress,
      signature,
      nonce,
    }
  );
  setAuthToken(response.token);
  setWalletAddress(walletAddress);
  return response;
}
