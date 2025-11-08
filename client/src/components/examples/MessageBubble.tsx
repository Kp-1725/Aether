import { MessageBubble } from '../message-bubble';

export default function MessageBubbleExample() {
  return (
    <div className="space-y-4 max-w-2xl">
      <MessageBubble
        sender="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
        content="Hey! How's the decentralized chat working for you?"
        timestamp={new Date()}
        verified={true}
        isOwnMessage={false}
      />
      <MessageBubble
        sender="0x1234567890123456789012345678901234567890"
        content="It's amazing! The encryption and blockchain verification is seamless."
        timestamp={new Date()}
        verified={true}
        isOwnMessage={true}
      />
    </div>
  );
}
