import { Home, Upload, Shield, LogOut, Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { truncateAddress } from "@/lib/web3";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const [location] = useLocation();
  const { walletAddress, isAdmin, logout } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      adminOnly: false,
    },
    {
      title: "Upload Files",
      url: "/upload",
      icon: Upload,
      adminOnly: false,
    },
    ...(isAdmin
      ? [
          {
            title: "Admin Panel",
            url: "/admin",
            icon: Shield,
            adminOnly: true,
          },
        ]
      : []),
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Web3 Dashboard</h2>
            <p className="text-xs text-muted-foreground">IPFS Storage</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
            Wallet Status
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2 py-2">
            <Card className="border-card-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-status-online/10 text-status-online border-status-online/20">
                    Connected
                  </Badge>
                  {isAdmin && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="font-mono text-xs text-foreground break-all">
                  {truncateAddress(walletAddress || "", 8, 6)}
                </div>
              </CardContent>
            </Card>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect Wallet
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
