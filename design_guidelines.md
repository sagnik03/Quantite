# Web3 User Dashboard - Design Guidelines

## Design Approach
**System-Based Approach** using modern Web3 dashboard patterns inspired by Linear's clean aesthetics and Notion's information hierarchy. This utility-focused application prioritizes clarity, trust signals, and efficient data management over visual flourishes.

## Typography System
- **Primary Font**: Inter (via Google Fonts) - exceptional for data-dense interfaces
- **Headings**: Font weights 600-700, sizes: text-3xl (dashboard titles), text-2xl (section headers), text-xl (card headers)
- **Body**: Font weight 400-500, sizes: text-base (primary content), text-sm (metadata, timestamps)
- **Mono**: JetBrains Mono for wallet addresses, IPFS CIDs, file hashes

## Layout & Spacing System
**Tailwind Units**: Consistently use 4, 6, 8, 12, 16, 24 for spacing (p-4, mb-8, gap-6, etc.)

**Grid Structure**:
- Dashboard: Sidebar (fixed w-64) + Main content area (flex-1)
- File Grid: 3-column on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Admin View: Single column list with expandable rows
- Max content width: max-w-7xl for dashboard sections

## Core Components

### Navigation & Layout
**Sidebar Navigation** (Fixed, full-height):
- Logo/brand at top (h-16)
- Wallet connection status card with truncated address
- Navigation menu items with icons (Dashboard, Uploads, Profile, Admin)
- Disconnect wallet button at bottom
- Visual indicator for active route

**Top Bar** (Sticky):
- Page title on left
- Quick stats badges (Total Files, Storage Used)
- User wallet avatar (Jazzicon or blockie pattern)
- Network indicator badge

### Authentication Components
**Wallet Connection Screen** (Centered, full viewport):
- Large MetaMask fox icon or Web3 graphic
- Headline: "Connect Your Wallet"
- Primary action button: "Connect MetaMask"
- Supporting text explaining nonce-based authentication
- Trust indicators: "Secure • Decentralized • No Email Required"

**Connection Status Card**:
- Wallet address with copy button
- Network badge (Ethereum Mainnet, etc.)
- Connection timestamp
- Disconnect option

### File Upload Interface
**Upload Zone** (Prominent, drag-drop enabled):
- Dashed border container (min-h-64)
- Upload icon and "Drag files here or click to browse"
- Supported formats list: "PDF, CSV, JSON, Images up to 10MB"
- Active state: solid border when dragging
- Upload progress bar with percentage

**File Cards** (Grid layout):
- File type icon (PDF, CSV, image preview thumbnail)
- Filename (truncated with tooltip)
- File size and upload date
- IPFS CID with copy button (text-xs, mono font)
- Action buttons: View, Download, Delete
- Status badge: "Stored on IPFS"

### Admin Dashboard Components
**All Files Table** (Full-width, alternating rows):
- Columns: User Address, Filename, Upload Date, File Size, CID, Actions
- Sortable headers
- Search/filter bar above table
- Pagination controls
- Row hover highlights entire row
- Quick preview button opens modal

**Audit Log Panel**:
- Timeline-style layout with timestamps
- User action descriptions
- Filterable by user, date range, action type

### Modals & Overlays
**File Preview Modal**:
- Large centered overlay (max-w-4xl)
- File preview area (PDF viewer, image display, JSON syntax highlighting)
- Metadata sidebar: filename, size, upload date, CID, IPFS gateway link
- Close button (top-right)
- Download button

**Transaction Status Toast**:
- Slide-in from top-right
- Upload progress, success, error states
- IPFS CID link when complete
- Auto-dismiss after 5 seconds

## Visual Hierarchy
- **High emphasis**: Wallet connection, Upload CTA, File actions
- **Medium emphasis**: File metadata, navigation items
- **Low emphasis**: Timestamps, secondary text, helper text

## Interaction Patterns
- Button hover: Slight scale (scale-105) on primary actions only
- No animations on wallet/CID display elements (trust/stability)
- Smooth transitions for modal open/close (duration-200)
- Loading spinners for IPFS operations
- Success checkmarks for completed uploads

## Trust & Security Signals
- Lock icons for authenticated sections
- "Verified" badges for successful wallet connections
- IPFS gateway links always visible and copyable
- Clear "Stored on IPFS" status indicators
- Explicit network name display

## Responsive Behavior
- Desktop (lg+): Sidebar + multi-column file grid
- Tablet (md): Collapsible sidebar, 2-column grid
- Mobile: Bottom navigation, single column, stacked cards

## Images
**No hero images** - This is a functional dashboard, not a marketing page. Use:
- Iconography: MetaMask fox, IPFS logo, file type icons via Heroicons
- Generated wallet avatars (Jazzicon library for Ethereum addresses)
- File thumbnails for image uploads only