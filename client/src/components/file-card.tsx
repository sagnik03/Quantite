import { FileText, Image, FileCode, File as FileIcon, Copy, Download, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { File } from "@shared/schema";

interface FileCardProps {
  file: File;
  onDelete?: (fileId: string) => void;
  isDeleting?: boolean;
}

const IPFS_GATEWAY = "https://dweb.link/ipfs/";

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return Image;
  if (fileType === "application/pdf") return FileText;
  if (fileType === "application/json") return FileCode;
  if (fileType === "text/csv") return FileText;
  return FileIcon;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function FileCard({ file, onDelete, isDeleting }: FileCardProps) {
  const { toast } = useToast();
  const Icon = getFileIcon(file.fileType);
  const ipfsUrl = `${IPFS_GATEWAY}${file.cid}`;

  const handleCopyCID = () => {
    navigator.clipboard.writeText(file.cid);
    toast({
      title: "CID Copied",
      description: "IPFS CID copied to clipboard",
    });
  };

  const handleDownload = () => {
    window.open(ipfsUrl, "_blank");
  };

  return (
    <Card className="hover-elevate overflow-hidden" data-testid={`card-file-${file.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate" title={file.filename}>
              {file.filename}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{formatFileSize(file.fileSize)}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Badge variant="outline" className="bg-status-online/10 text-status-online border-status-online/20 text-xs">
            Stored on IPFS
          </Badge>
          <div className="bg-muted/50 rounded-md p-2">
            <p className="text-xs text-muted-foreground mb-1">IPFS CID</p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono flex-1 truncate" title={file.cid}>
                {file.cid}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={handleCopyCID}
                data-testid={`button-copy-cid-${file.id}`}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleDownload}
          data-testid={`button-download-${file.id}`}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View
        </Button>
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(file.id)}
            disabled={isDeleting}
            data-testid={`button-delete-${file.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
