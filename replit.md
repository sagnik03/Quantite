# Web3 User Dashboard - IPFS Storage Platform

A decentralized file storage platform with MetaMask authentication and IPFS integration.

## Overview

This application implements Phase 1 of a Web3-powered data analysis platform, featuring:
- MetaMask wallet authentication with nonce-based challenge/response signing
- Decentralized file storage on IPFS via Web3.Storage
- User dashboard for managing uploaded files
- Admin panel for viewing all user files and audit logs
- JWT-based secure session management

## Tech Stack

### Frontend
- **React** with Vite for fast development
- **TypeScript** for type safety
- **Wouter** for client-side routing
- **TanStack Query** (React Query) for data fetching and caching
- **Shadcn UI** + Tailwind CSS for beautiful, accessible components
- **ethers.js** for MetaMask wallet interactions and signature verification
- **React Dropzone** for drag-and-drop file uploads

### Backend
- **Express.js** REST API
- **TypeScript** for type safety
- **JWT** (jsonwebtoken) for authentication tokens
- **ethers.js** for server-side signature verification
- **Multer** for file upload handling
- **Web3.Storage** for IPFS uploads
- **In-memory storage** (MemStorage) for user data, files, and audit logs

## Architecture

### Data Models

#### User
- `id`: UUID
- `walletAddress`: Ethereum address (unique)
- `nonce`: One-time nonce for authentication
- `isAdmin`: Boolean flag for admin access
- `createdAt`: Timestamp

#### File
- `id`: UUID
- `userId`: Reference to user
- `cid`: IPFS Content Identifier
- `filename`: Original filename
- `fileSize`: Size in bytes
- `fileType`: MIME type
- `uploadedAt`: Timestamp

#### AuditLog
- `id`: UUID
- `userId`: Reference to user
- `action`: Action type (FILE_UPLOAD, FILE_DELETE)
- `fileId`: Reference to file (optional)
- `timestamp`: Timestamp
- `metadata`: JSON metadata

### Authentication Flow

1. User clicks "Connect MetaMask"
2. Frontend requests nonce from `/api/auth/nonce`
3. User signs message with nonce using MetaMask
4. Frontend sends signature to `/api/auth/verify`
5. Backend verifies signature using ethers.js
6. Backend issues JWT token
7. Frontend stores token and updates auth state
8. User accesses protected routes with JWT

### File Upload Flow

1. User drags/drops file or selects via file picker
2. Frontend creates multipart form data
3. File uploads to backend `/api/files/upload`
4. Backend uploads file to Web3.Storage IPFS
5. Web3.Storage returns CID
6. Backend stores file metadata with CID
7. Audit log created for upload action
8. Frontend refreshes file list

## API Endpoints

### Authentication
- `POST /api/auth/nonce` - Request authentication nonce
- `POST /api/auth/verify` - Verify signature and get JWT

### Files (Protected)
- `GET /api/files` - Get user's files
- `POST /api/files/upload` - Upload file to IPFS
- `DELETE /api/files/:id` - Delete file

### Admin (Protected + Admin Only)
- `GET /api/admin/files` - Get all users' files
- `GET /api/admin/audit` - Get audit logs

## Environment Variables

Required secrets (configured via Replit Secrets):
- `WEB3STORAGE_TOKEN` - Web3.Storage API token for IPFS uploads
- `SESSION_SECRET` - Session secret (auto-generated)
- `JWT_SECRET` - Optional custom JWT secret (defaults to env-specific value)

## Features Implemented

### ✅ Phase 1 Complete
- [x] MetaMask wallet connection and authentication
- [x] Nonce-based challenge/response signing
- [x] Signature verification using ethers.js
- [x] JWT token-based sessions
- [x] Client-side IPFS file upload via Web3.Storage
- [x] File metadata storage with CID indexing
- [x] User dashboard with file listing
- [x] Drag-and-drop file upload interface
- [x] File cards with IPFS CID display and copy
- [x] Admin login via MetaMask
- [x] Admin panel for viewing all user files
- [x] Audit log tracking for all uploads
- [x] Responsive UI with modern Web3 design
- [x] Loading and error states throughout
- [x] File deletion functionality

### 🚧 Future Enhancements (Phase 2+)
- [ ] File preview modal (PDF, images, JSON viewer)
- [ ] Enhanced admin analytics dashboard
- [ ] User profile and settings page
- [ ] Advanced file filtering and search
- [ ] IPFS unpinning on delete
- [ ] Rate limiting for production
- [ ] Database migration from in-memory to PostgreSQL
- [ ] Sales listing platform for user data
- [ ] On-chain data ownership/tokenization

## Component Structure

### Pages
- `/connect-wallet` - MetaMask connection screen
- `/` (Dashboard) - User's uploaded files overview
- `/upload` - File upload interface
- `/admin` - Admin panel (admin only)

### Key Components
- `AppSidebar` - Navigation sidebar with wallet status
- `FileUploadZone` - Drag-and-drop upload area
- `FileCard` - File display card with IPFS CID
- `ProtectedRoute` - Route guard for authentication

### Hooks
- `useAuth` - Authentication state management
- `useToast` - Toast notifications

### Libraries
- `lib/web3.ts` - Web3/MetaMask utilities
- `lib/auth.ts` - Authentication helpers
- `lib/queryClient.ts` - React Query configuration

## Design System

Following design_guidelines.md:
- **Typography**: Inter for UI, JetBrains Mono for addresses/CIDs
- **Color Scheme**: Blue primary (#217BEF), semantic status colors
- **Spacing**: Consistent 4, 6, 8, 12, 16, 24 Tailwind units
- **Components**: Shadcn UI primitives with custom styling
- **Layout**: Sidebar navigation (20rem) + main content area

## Running the Application

The application is automatically running via the "Start application" workflow:
```bash
npm run dev
```

This starts:
- Express backend on port 5000
- Vite frontend dev server (proxied through Express)

## Admin Access

To test admin features, you need to manually set `isAdmin: true` for a user in the storage. The first wallet to connect will be created as a regular user. You can modify this in `server/storage.ts` or the `/api/auth/nonce` endpoint logic.

## Security Notes

- JWT tokens expire after 7 days
- Nonces are single-use and cleared after verification
- All protected routes require valid JWT
- Admin routes require both valid JWT and admin flag
- Signatures are verified server-side before issuing tokens
- File uploads limited to 10MB

## Testing

Key user journeys to test:
1. **Wallet Connection**: Connect MetaMask → Sign message → Access dashboard
2. **File Upload**: Navigate to upload → Drag/drop file → See IPFS CID → View in dashboard
3. **File Management**: View files → Copy CID → Delete file
4. **Admin Access**: Admin login → View all files → Check audit logs

## Known Limitations

- In-memory storage (data resets on server restart)
- No file preview functionality yet
- No IPFS unpinning on delete (files remain on IPFS)
- Admin status requires manual database modification
- Brief loading flash on auth rehydration

## Project Status

Phase 1 MVP is **complete** and ready for testing. All core functionality for MetaMask authentication, IPFS file storage, user dashboard, and admin panel are implemented and working.
