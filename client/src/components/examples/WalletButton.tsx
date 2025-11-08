import { WalletButton } from '../wallet-button';

export default function WalletButtonExample() {
  return (
    <div className="space-y-4">
      <WalletButton
        address={null}
        connected={false}
        onConnect={() => console.log('Connect clicked')}
        onDisconnect={() => console.log('Disconnect clicked')}
      />
      <WalletButton
        address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
        connected={true}
        onConnect={() => console.log('Connect clicked')}
        onDisconnect={() => console.log('Disconnect clicked')}
      />
    </div>
  );
}
