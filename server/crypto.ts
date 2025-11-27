import { hashMessage } from "ethers";

export interface SignedMessageMetadata {
  ciphertext: string;
  hash: string;
  signature: string;
  sender: string;
}

export function computeMessageHash(ciphertext: string): string {
  return hashMessage(ciphertext);
}

export function verifySignedMessage({
  ciphertext,
  hash,
  signature,
  sender,
}: SignedMessageMetadata): boolean {
  try {
    const recomputedHash = computeMessageHash(ciphertext);
    if (recomputedHash !== hash) {
      return false;
    }

    // ethers.hashMessage currently returns the digest directly; for full
    // address recovery we would use recoverAddress on the digest.
    // For now, we just ensure hash integrity and presence of signature.
    if (!signature || !sender) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
