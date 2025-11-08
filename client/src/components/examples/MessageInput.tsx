import { MessageInput } from '../message-input';

export default function MessageInputExample() {
  return (
    <div className="max-w-2xl border rounded-md">
      <MessageInput 
        onSend={(msg) => console.log('Sending message:', msg)}
        encrypted={true}
      />
    </div>
  );
}
