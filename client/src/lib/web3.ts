import { BrowserProvider } from 'ethers';
import CryptoJS from 'crypto-js';

export interface WalletState {
  address: string | null;
  connected: boolean;
  balance: string | null;
}

export const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const encryptMessage = (message: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
};

export const decryptMessage = (encryptedMessage: string, secretKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const hashMessage = (message: string): string => {
  return CryptoJS.SHA256(message).toString();
};

export const connectWallet = async (): Promise<WalletState> => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const balance = await provider.getBalance(accounts[0]);
    
    return {
      address: accounts[0],
      connected: true,
      balance: balance.toString(),
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const disconnectWallet = (): WalletState => {
  return {
    address: null,
    connected: false,
    balance: null,
  };
};

declare global {
  interface Window {
    ethereum?: any;
  }
}
