import { useState, useCallback, useRef } from "react";

// Chunk size: 64KB for reliable WebRTC transfer
const CHUNK_SIZE = 64 * 1024;

export interface FileTransferProgress {
  fileId: string;
  fileName: string;
  fileSize: number;
  transferredBytes: number;
  progress: number; // 0-100
  speed: number; // bytes per second
  estimatedTime: number; // seconds remaining
  status: "pending" | "transferring" | "completed" | "error";
  direction: "upload" | "download";
}

interface FileChunk {
  type: "file-chunk";
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  chunkIndex: number;
  totalChunks: number;
  data: string; // Base64 chunk
}

interface FileTransferComplete {
  type: "file-complete";
  fileId: string;
}

type FileTransferMessage = FileChunk | FileTransferComplete;

interface IncomingFileTransfer {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
  receivedChunks: Map<number, string>;
  startTime: number;
}

export function useFileTransfer() {
  const [transfers, setTransfers] = useState<Map<string, FileTransferProgress>>(
    new Map()
  );
  const incomingTransfersRef = useRef<Map<string, IncomingFileTransfer>>(
    new Map()
  );
  const onFileReceivedRef = useRef<
    | ((file: {
        id: string;
        name: string;
        size: number;
        type: string;
        data: string;
      }) => void)
    | null
  >(null);

  const updateTransfer = useCallback(
    (fileId: string, update: Partial<FileTransferProgress>) => {
      setTransfers((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(fileId);
        if (existing) {
          newMap.set(fileId, { ...existing, ...update });
        }
        return newMap;
      });
    },
    []
  );

  const sendFileChunked = useCallback(
    async (
      file: {
        id: string;
        name: string;
        size: number;
        type: string;
        data: string;
      },
      sendChunk: (message: string) => void
    ): Promise<void> => {
      const {
        id: fileId,
        name: fileName,
        size: fileSize,
        type: fileType,
        data,
      } = file;

      // Remove data URL prefix if present
      const base64Data = data.includes(",") ? data.split(",")[1] : data;
      const totalChunks = Math.ceil(base64Data.length / CHUNK_SIZE);

      // Initialize transfer progress
      const startTime = Date.now();
      setTransfers((prev) => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          fileId,
          fileName,
          fileSize,
          transferredBytes: 0,
          progress: 0,
          speed: 0,
          estimatedTime: 0,
          status: "transferring",
          direction: "upload",
        });
        return newMap;
      });

      // Send chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, base64Data.length);
        const chunkData = base64Data.slice(start, end);

        const chunk: FileChunk = {
          type: "file-chunk",
          fileId,
          fileName,
          fileSize,
          fileType,
          chunkIndex: i,
          totalChunks,
          data: chunkData,
        };

        sendChunk(JSON.stringify(chunk));

        // Update progress
        const transferredBytes = end;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = transferredBytes / elapsed;
        const remaining = base64Data.length - transferredBytes;
        const estimatedTime = speed > 0 ? remaining / speed : 0;

        updateTransfer(fileId, {
          transferredBytes: Math.round(
            (transferredBytes / base64Data.length) * fileSize
          ),
          progress: Math.round((transferredBytes / base64Data.length) * 100),
          speed: Math.round(speed),
          estimatedTime: Math.round(estimatedTime),
        });

        // Small delay to prevent overwhelming the data channel
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Send completion message
      const complete: FileTransferComplete = {
        type: "file-complete",
        fileId,
      };
      sendChunk(JSON.stringify(complete));

      updateTransfer(fileId, {
        progress: 100,
        status: "completed",
        estimatedTime: 0,
      });

      // Remove from active transfers after a delay
      setTimeout(() => {
        setTransfers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 3000);
    },
    [updateTransfer]
  );

  const handleIncomingChunk = useCallback(
    (message: FileTransferMessage) => {
      if (message.type === "file-chunk") {
        const {
          fileId,
          fileName,
          fileSize,
          fileType,
          chunkIndex,
          totalChunks,
          data,
        } = message;

        let transfer = incomingTransfersRef.current.get(fileId);

        if (!transfer) {
          transfer = {
            fileId,
            fileName,
            fileSize,
            fileType,
            totalChunks,
            receivedChunks: new Map(),
            startTime: Date.now(),
          };
          incomingTransfersRef.current.set(fileId, transfer);

          // Initialize download progress
          setTransfers((prev) => {
            const newMap = new Map(prev);
            newMap.set(fileId, {
              fileId,
              fileName,
              fileSize,
              transferredBytes: 0,
              progress: 0,
              speed: 0,
              estimatedTime: 0,
              status: "transferring",
              direction: "download",
            });
            return newMap;
          });
        }

        transfer.receivedChunks.set(chunkIndex, data);

        // Update progress
        const receivedCount = transfer.receivedChunks.size;
        const elapsed = (Date.now() - transfer.startTime) / 1000;
        const progress = (receivedCount / totalChunks) * 100;
        const transferredBytes = Math.round(
          (receivedCount / totalChunks) * fileSize
        );
        const speed = transferredBytes / elapsed;
        const remaining = fileSize - transferredBytes;
        const estimatedTime = speed > 0 ? remaining / speed : 0;

        updateTransfer(fileId, {
          transferredBytes,
          progress: Math.round(progress),
          speed: Math.round(speed),
          estimatedTime: Math.round(estimatedTime),
        });
      } else if (message.type === "file-complete") {
        const transfer = incomingTransfersRef.current.get(message.fileId);

        if (transfer) {
          // Reassemble file
          const chunks: string[] = [];
          for (let i = 0; i < transfer.totalChunks; i++) {
            const chunk = transfer.receivedChunks.get(i);
            if (chunk) {
              chunks.push(chunk);
            }
          }

          const base64Data = chunks.join("");
          const dataUrl = `data:${transfer.fileType};base64,${base64Data}`;

          // Notify completion
          updateTransfer(message.fileId, {
            progress: 100,
            status: "completed",
            estimatedTime: 0,
          });

          // Call callback with completed file
          if (onFileReceivedRef.current) {
            onFileReceivedRef.current({
              id: transfer.fileId,
              name: transfer.fileName,
              size: transfer.fileSize,
              type: transfer.fileType,
              data: dataUrl,
            });
          }

          // Cleanup
          incomingTransfersRef.current.delete(message.fileId);

          setTimeout(() => {
            setTransfers((prev) => {
              const newMap = new Map(prev);
              newMap.delete(message.fileId);
              return newMap;
            });
          }, 3000);
        }
      }
    },
    [updateTransfer]
  );

  const isFileTransferMessage = useCallback(
    (data: any): data is FileTransferMessage => {
      return (
        data && (data.type === "file-chunk" || data.type === "file-complete")
      );
    },
    []
  );

  const setOnFileReceived = useCallback(
    (
      callback: (file: {
        id: string;
        name: string;
        size: number;
        type: string;
        data: string;
      }) => void
    ) => {
      onFileReceivedRef.current = callback;
    },
    []
  );

  const activeTransfers = Array.from(transfers.values());

  return {
    transfers: activeTransfers,
    sendFileChunked,
    handleIncomingChunk,
    isFileTransferMessage,
    setOnFileReceived,
  };
}
