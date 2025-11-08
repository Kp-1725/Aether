# Design Guidelines: Decentralized Chat Room

## Design Approach
**Hybrid Reference-Based**: Drawing from Discord's chat interface patterns and modern Web3 application aesthetics (Rainbow Wallet, Uniswap). This creates a familiar chat experience with crypto-native visual language that emphasizes security and transparency.

## Core Design Principles
1. **Trust Through Transparency**: Visual indicators for encryption status, blockchain verification, and connection state
2. **Familiar Chat Patterns**: Leverage established messaging UI conventions for immediate usability
3. **Web3 Native**: Clean, modern aesthetic with emphasis on connection status and wallet integration

## Typography System
- **Primary Font**: Inter (via Google Fonts) - excellent for UI, highly legible
- **Monospace Font**: JetBrains Mono - for wallet addresses, hashes, technical details

**Hierarchy**:
- Room/Channel titles: text-xl font-semibold
- Message sender names: text-sm font-medium
- Message content: text-base font-normal
- Timestamps: text-xs font-normal
- System messages: text-sm font-medium italic

## Layout & Spacing
**Spacing System**: Use Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-4 to p-6
- Message spacing: space-y-4
- Section gaps: gap-6 to gap-8

**Application Structure** (full-height layout):
```
┌─────────────────────────────────────────────┐
│ Header (h-16): Wallet connection, status    │
├──────────────┬──────────────────────────────┤
│ Sidebar      │ Main Chat Area               │
│ (w-64)       │                              │
│              │ Messages (flex-1, overflow)  │
│ - Rooms      │                              │
│ - Encryption │                              │
│   Key Mgmt   │                              │
│              ├──────────────────────────────┤
│              │ Message Input (h-20)         │
└──────────────┴──────────────────────────────┘
```

## Component Library

### Header Bar
- Wallet connection button (primary position, top-right)
- Connection status indicator (pulsing dot with label)
- App title/logo (left-aligned)
- Blockchain network indicator

### Sidebar Navigation
- Active room highlighting with subtle left border accent
- Room list with unread message badges
- Encryption key management section at bottom
- Collapsible on mobile (hamburger menu)

### Chat Message Components
**Message Bubble Design**:
- Sender's own messages: Aligned right, distinct styling
- Received messages: Aligned left, alternating sender blocks
- Each message shows: sender address (truncated), timestamp, verification icon
- Blockchain-verified messages: small checkmark badge
- System messages: Centered, italic, muted styling

**Message Metadata**:
- Timestamp: Below message, right-aligned, muted
- Sender address: Above message, truncated with tooltip on hover
- Verification status: Inline icon next to timestamp

### Input Area
- Text input field with rounded corners (rounded-lg)
- Send button (icon: paper plane)
- File attachment button (for future feature, subtle/disabled state)
- Encryption status indicator (lock icon with tooltip)
- Character count for long messages

### Modal/Overlay Components
- Wallet connection modal: Centered, clear instructions
- Encryption key setup: Step-by-step wizard style
- Room creation dialog: Simple form with key sharing instructions

### Status Indicators
- Wallet connection: Green dot (connected), Red dot (disconnected)
- Encryption status: Lock icon (encrypted), Unlock icon (unencrypted)
- Blockchain sync: Loading spinner when pending transactions
- Message verification: Checkmark badge when on-chain hash confirmed

## Animation Guidelines
**Minimal, Purposeful Motion**:
- Message appearance: Subtle fade-in (0.2s)
- Connection status changes: Pulsing dot animation
- Modal entry/exit: Fade with slight scale (0.3s)
- No scroll-based animations
- No hover animations on message bubbles

## Responsive Behavior
- **Mobile** (< 768px): Sidebar collapses to overlay menu, full-width chat
- **Tablet** (768px - 1024px): Narrow sidebar (w-48), main chat adapts
- **Desktop** (> 1024px): Full layout with w-64 sidebar

## Web3-Specific Elements
- **Wallet Address Display**: Truncated format (0x1234...5678) with copy button
- **Hash Display**: Monospace font, muted styling, truncated with expand option
- **Gas Fee Indicators**: Small badge showing estimated cost for message sending
- **Network Badge**: Subtle indicator showing Ethereum/Polygon/etc.

## Images
**No hero images** - This is a chat application interface. Focus is on functional UI.

**Potential Image Use**:
- Empty state illustrations (when no messages in room): Simple, line-art style illustrations showing "Start chatting" or "No messages yet"
- User avatars: Generated gradient avatars from wallet addresses (no uploaded images initially)

## Accessibility Notes
- High contrast ratios for all text
- Focus indicators on all interactive elements (ring-2 pattern)
- Keyboard navigation for message history (arrow keys)
- Screen reader labels for all icons
- Clear visual hierarchy for message threading