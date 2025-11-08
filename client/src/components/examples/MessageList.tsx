import { MessageList } from '../message-list';

export default function MessageListExample() {
  const messages = [
    {
      id: '1',
      sender: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      content: 'Welcome to the decentralized chat!',
      timestamp: new Date(Date.now() - 3600000),
      verified: true,
    },
    {
      id: '2',
      sender: '0x1234567890123456789012345678901234567890',
      content: 'Thanks! This is really cool.',
      timestamp: new Date(Date.now() - 1800000),
      verified: true,
    },
    {
      id: '3',
      sender: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      content: 'All messages are encrypted end-to-end with AES-256.',
      timestamp: new Date(),
      verified: true,
    },
  ];

  return (
    <div className="h-[400px] border rounded-md">
      <MessageList 
        messages={messages} 
        currentUserAddress="0x1234567890123456789012345678901234567890" 
      />
    </div>
  );
}
