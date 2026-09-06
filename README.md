# DocVault

Cloud-based document management SaaS built with Next.js 15, React 19, Firebase, and Tailwind CSS.

## Features

- Firebase Auth (Email/Password + Google Login)
- Personal & Team Workspaces with RBAC (Admin/Editor/Viewer)
- Folder Hierarchy with Drag-and-Drop
- File Upload to Firebase Storage with Progress Tracking
- Document Metadata, Tags, and Version History
- Full-Text Search
- Real-time Comments and Activity Feeds
- Share Documents via Expiring Links
- Audit Log
- AI-powered Auto-tagging and Document Summaries
- Dashboard with Storage Analytics
- Rose/Pink Theme with Animations
- Dark Mode
- Mobile Responsive with Bottom Nav
- Command Palette (Ctrl+K)
- 51+ Tests with Vitest

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in your Firebase config
2. Run `npm install`
3. Run `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Testing

```bash
npm run test
npm run test:coverage
```

## Deployment

Push to GitHub and deploy via Vercel. Set environment variables in Vercel dashboard.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS, Framer Motion
- **Backend:** Firebase (Auth, Firestore, Storage)
- **State:** Zustand
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel
