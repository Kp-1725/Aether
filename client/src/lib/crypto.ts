import { BrowserProvider, hashMessage, Signer } from "ethers";
import CryptoJS from "crypto-js";

export interface EncryptedPayload {
  ciphertext: string;
  hash: string;
}

export interface SignedEncryptedMessage extends EncryptedPayload {
  signature: string;
  sender: string;
}

export async function getWalletSigner(): Promise<Signer> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Ethereum wallet available");
  }

  const provider = new BrowserProvider(window.ethereum);
  return provider.getSigner();
}

export function encryptWithSharedKey(
  plaintext: string,
  sharedKey: string
): EncryptedPayload {
  const ciphertext = CryptoJS.AES.encrypt(plaintext, sharedKey).toString();
  const hash = hashMessage(ciphertext);
  return { ciphertext, hash };
}

export function decryptWithSharedKey(
  ciphertext: string,
  sharedKey: string
): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, sharedKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  // If decryption fails (wrong key), the result will be empty
  if (!decrypted && ciphertext) {
    throw new Error("Decryption failed - encryption keys may not match");
  }

  return decrypted;
}

export async function signEncryptedPayload(
  payload: EncryptedPayload,
  signer: Signer
): Promise<SignedEncryptedMessage> {
  const { ciphertext, hash } = payload;
  const signature = await signer.signMessage(hash);
  const address = await signer.getAddress();
  return {
    ciphertext,
    hash,
    signature,
    sender: address,
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
