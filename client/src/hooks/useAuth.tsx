import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getAuthToken, clearAuthToken, getWalletAddress } from "@/lib/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  walletAddress: string | null;
  isAdmin: boolean;
  login: (params: { walletAddress: string; isAdmin: boolean }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STATUS_KEY = "is_admin";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const address = getWalletAddress();
    const adminStatus = localStorage.getItem(ADMIN_STATUS_KEY) === "true";
    
    setIsAuthenticated(!!token);
    setWalletAddress(address);
    setIsAdmin(adminStatus);
  }, []);

  const login = ({ walletAddress, isAdmin }: { walletAddress: string; isAdmin: boolean }) => {
    setIsAuthenticated(true);
    setWalletAddress(walletAddress);
    setIsAdmin(isAdmin);
    localStorage.setItem(ADMIN_STATUS_KEY, isAdmin.toString());
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem(ADMIN_STATUS_KEY);
    setIsAuthenticated(false);
    setWalletAddress(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        walletAddress,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
