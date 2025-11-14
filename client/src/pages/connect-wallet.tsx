import { useState } from "react";
import { Wallet, Lock, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { requestAccounts, signMessage } from "@/lib/web3";
import { requestNonce, verifySignature } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export default function ConnectWallet() {
  const { toast } = useToast();
  const { login } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this application.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await requestAccounts();
      const walletAddress = accounts[0];

      const nonce = await requestNonce(walletAddress);

      const message = `Sign this message to authenticate with Web3 Dashboard.\n\nNonce: ${nonce}`;
      const signature = await signMessage(message);

      const result = await verifySignature(walletAddress, signature, nonce);
      
      login({
        walletAddress,
        isAdmin: result.isAdmin,
      });

      toast({
        title: "Connected Successfully",
        description: `Welcome! ${result.isAdmin ? "Admin access granted." : ""}`,
      });
    } catch (error: any) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Secure authentication using MetaMask
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>MetaMask Authentication</CardTitle>
            <CardDescription>
              Sign a message with your wallet to verify ownership
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full h-12"
              size="lg"
              data-testid="button-connect-metamask"
            >
              <Wallet className="mr-2 h-5 w-5" />
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </Button>

            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3 text-sm">
                <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Secure</span>
                  <p className="text-muted-foreground">Nonce-based challenge/response signing</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Decentralized</span>
                  <p className="text-muted-foreground">No email or password required</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Private</span>
                  <p className="text-muted-foreground">Your keys, your data, your control</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By connecting, you agree to use MetaMask for secure authentication
        </p>
      </div>
    </div>
  );
}
