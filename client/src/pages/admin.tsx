import { useQuery } from "@tanstack/react-query";
import { Shield, Users, Files, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { truncateAddress } from "@/lib/web3";
import type { File, AuditLog } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AdminFile extends File {
  walletAddress: string;
}

const IPFS_GATEWAY = "https://dweb.link/ipfs/";

export default function Admin() {
  const { toast } = useToast();

  const { data: allFiles, isLoading: filesLoading } = useQuery<AdminFile[]>({
    queryKey: ["/api/admin/files"],
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/audit"],
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleViewFile = (cid: string) => {
    window.open(`${IPFS_GATEWAY}${cid}`, "_blank");
  };

  const handleCopyCID = (cid: string) => {
    navigator.clipboard.writeText(cid);
    toast({
      title: "CID Copied",
      description: "IPFS CID copied to clipboard",
    });
  };

  const totalFiles = allFiles?.length || 0;
  const uniqueUsers = new Set(allFiles?.map((f) => f.walletAddress)).size;
  const totalSize = allFiles?.reduce((sum, file) => sum + file.fileSize, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            View and manage all user uploads
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Files className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-admin-total-files">
              {filesLoading ? <Skeleton className="h-8 w-12" /> : totalFiles}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-admin-users">
              {filesLoading ? <Skeleton className="h-8 w-12" /> : uniqueUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              With uploaded files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-admin-storage">
              {filesLoading ? <Skeleton className="h-8 w-20" /> : formatFileSize(totalSize)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              On IPFS network
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All User Files</CardTitle>
          <CardDescription>
            View and retrieve files uploaded by all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : allFiles && allFiles.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>CID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allFiles.map((file) => (
                    <TableRow key={file.id} data-testid={`row-file-${file.id}`}>
                      <TableCell className="font-mono text-xs">
                        {truncateAddress(file.walletAddress, 6, 4)}
                      </TableCell>
                      <TableCell className="font-medium">{file.filename}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(file.fileSize)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {file.cid.slice(0, 12)}...
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyCID(file.cid)}
                            data-testid={`button-copy-${file.id}`}
                          >
                            Copy CID
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleViewFile(file.cid)}
                            data-testid={`button-view-${file.id}`}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Files className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No files uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>
            Recent upload activity across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                  data-testid={`log-${log.id}`}
                >
                  <Clock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                      <span className="text-sm font-mono">
                        {truncateAddress(log.userId, 6, 4)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activity yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
