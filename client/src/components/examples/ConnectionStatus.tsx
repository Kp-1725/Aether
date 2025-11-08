import { ConnectionStatus } from '../connection-status';

export default function ConnectionStatusExample() {
  return (
    <div className="space-y-4">
      <ConnectionStatus connected={true} network="Ethereum Mainnet" />
      <ConnectionStatus connected={false} />
    </div>
  );
}
