import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
}

export function FileUploadZone({ onFilesSelected, isUploading }: FileUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed transition-all cursor-pointer",
        isDragActive && "border-primary bg-primary/5",
        isUploading && "opacity-50 cursor-not-allowed",
        !isDragActive && !isUploading && "hover-elevate"
      )}
      data-testid="dropzone-upload"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center min-h-[16rem]">
        <div className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center transition-colors",
          isDragActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {isDragActive ? (
            <Upload className="h-8 w-8" />
          ) : (
            <FileText className="h-8 w-8" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {isDragActive ? "Drop files here" : "Drag files here or click to browse"}
          </h3>
          <p className="text-sm text-muted-foreground">
            PDF, CSV, JSON, Images • Up to 10MB
          </p>
        </div>

        {isUploading && (
          <div className="text-sm text-primary font-medium">
            Uploading to IPFS...
          </div>
        )}
      </div>
    </Card>
  );
}
