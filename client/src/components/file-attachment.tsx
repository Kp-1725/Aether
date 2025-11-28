import { useRef, useState } from "react";
import {
  Paperclip,
  X,
  File,
  Image,
  FileText,
  Music,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Max file size: 100MB (for P2P transfer)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // Base64 encoded
  preview?: string; // For images
}

interface FileAttachmentButtonProps {
  onFileSelect: (file: FileAttachment) => void;
  disabled?: boolean;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("video/")) return Video;
  if (type.startsWith("audio/")) return Music;
  if (
    type.includes("pdf") ||
    type.includes("document") ||
    type.includes("text")
  )
    return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileAttachmentButton({
  onFileSelect,
  disabled,
}: FileAttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    setIsProcessing(true);

    try {
      const base64 = await fileToBase64(file);
      let preview: string | undefined;

      // Generate preview for images
      if (file.type.startsWith("image/")) {
        preview = base64;
      }

      const attachment: FileAttachment = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64,
        preview,
      };

      onFileSelect(attachment);
    } catch (error) {
      console.error("Failed to process file:", error);
      alert("Failed to process file");
    } finally {
      setIsProcessing(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={disabled || isProcessing}
            className="h-10 w-10"
          >
            <Paperclip
              className={cn("h-5 w-5", isProcessing && "animate-pulse")}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Attach file (max 100MB)</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}

interface FilePreviewProps {
  file: FileAttachment;
  onRemove?: () => void;
  isCompact?: boolean;
}

export function FilePreview({ file, onRemove, isCompact }: FilePreviewProps) {
  const FileIcon = getFileIcon(file.type);
  const isImage = file.type.startsWith("image/");

  if (isCompact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg max-w-[250px]">
        {isImage && file.preview ? (
          <img
            src={file.preview}
            alt={file.name}
            className="h-10 w-10 object-cover rounded"
          />
        ) : (
          <div className="h-10 w-10 bg-background rounded flex items-center justify-center">
            <FileIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden max-w-[300px]">
      {isImage && file.preview ? (
        <a
          href={file.preview}
          download={file.name}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={file.preview}
            alt={file.name}
            className="max-h-[200px] w-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
        </a>
      ) : (
        <div className="p-4 bg-muted flex items-center justify-center">
          <FileIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <div className="p-2 bg-background border-t">
        <a
          href={file.data}
          download={file.name}
          className="text-sm font-medium hover:underline truncate block text-primary"
        >
          {file.name}
        </a>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export { formatFileSize, getFileIcon };
