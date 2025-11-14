import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileUploadZone } from "@/components/file-upload-zone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UploadResult {
  filename: string;
  cid: string;
  status: "success" | "error";
  error?: string;
}

export default function Upload() {
  const { toast } = useToast();
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const results: UploadResult[] = [];
      setUploadProgress(0);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Upload to Web3.Storage via backend
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/files/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = await response.json();

          results.push({
            filename: file.name,
            cid: data.cid,
            status: "success",
          });
        } catch (error: any) {
          results.push({
            filename: file.name,
            cid: "",
            status: "error",
            error: error.message,
          });
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      return results;
    },
    onSuccess: (results) => {
      setUploadResults(results);
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });

      const successCount = results.filter((r) => r.status === "success").length;
      const failCount = results.filter((r) => r.status === "error").length;

      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `${successCount} file(s) uploaded to IPFS successfully${failCount > 0 ? `, ${failCount} failed` : ""}`,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: "All uploads failed. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "An error occurred during upload. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFilesSelected = (files: File[]) => {
    setUploadResults([]);
    setUploadProgress(0);
    uploadMutation.mutate(files);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Files</h1>
        <p className="text-muted-foreground mt-1">
          Upload files to decentralized IPFS storage
        </p>
      </div>

      <FileUploadZone
        onFilesSelected={handleFilesSelected}
        isUploading={uploadMutation.isPending}
      />

      {uploadMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading to IPFS</CardTitle>
            <CardDescription>
              Please wait while your files are being uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={uploadProgress} className="w-full" data-testid="progress-upload" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(uploadProgress)}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {uploadResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
            <CardDescription>
              {uploadResults.filter((r) => r.status === "success").length} of{" "}
              {uploadResults.length} files uploaded successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                  data-testid={`result-${result.status}-${index}`}
                >
                  {result.status === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-status-online flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{result.filename}</p>
                    {result.status === "success" ? (
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-status-online/10 text-status-online border-status-online/20 text-xs mb-1">
                          Stored on IPFS
                        </Badge>
                        <p className="text-xs font-mono text-muted-foreground truncate">
                          {result.cid}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-destructive mt-1">
                        {result.error || "Upload failed"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
