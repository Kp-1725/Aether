import { Upload, Download, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { FileTransferProgress } from "@/hooks/useFileTransfer";
import { formatFileSize } from "@/components/file-attachment";
import { cn } from "@/lib/utils";

interface FileTransferProgressProps {
  transfers: FileTransferProgress[];
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return `${bytesPerSecond} B/s`;
  if (bytesPerSecond < 1024 * 1024)
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
}

export function FileTransferProgressBar({
  transfers,
}: FileTransferProgressProps) {
  if (transfers.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {transfers.map((transfer) => (
        <div
          key={transfer.fileId}
          className={cn(
            "bg-background border rounded-lg shadow-lg p-3 animate-in slide-in-from-right-5",
            transfer.status === "completed" && "border-green-500/50",
            transfer.status === "error" && "border-red-500/50"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            {transfer.direction === "upload" ? (
              <Upload className="h-4 w-4 text-blue-500" />
            ) : (
              <Download className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium truncate flex-1">
              {transfer.fileName}
            </span>
            {transfer.status === "completed" && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {transfer.status === "error" && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>

          <Progress value={transfer.progress} className="h-2 mb-2" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {formatFileSize(transfer.transferredBytes)} /{" "}
              {formatFileSize(transfer.fileSize)}
            </span>
            {transfer.status === "transferring" && (
              <span className="flex gap-2">
                <span>{formatSpeed(transfer.speed)}</span>
                <span>• {formatTime(transfer.estimatedTime)} left</span>
              </span>
            )}
            {transfer.status === "completed" && (
              <span className="text-green-500">Complete!</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
