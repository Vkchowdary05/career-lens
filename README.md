# CareerLens - Career Intelligence Platform

A comprehensive platform for career development, interview preparation, and professional networking. CareerLens connects professionals to real interview experiences, company insights, and personalized career guidance.

## Features

### 🏠 Public Pages
- **Landing Page** - Marketing-focused homepage with features, stats, testimonials, and CTA
- **Login/Signup** - Secure authentication with email and OAuth integration

### 📊 Dashboard & Navigation
- **Sidebar Navigation** - Fast access to all major sections
- **Responsive Design** - Optimized for desktop, tablet, and mobile

### 🔗 Core Features

#### 📝 Social Feed
- Browse real interview experiences from professionals
- Like, comment, and share posts
- Trending companies and top contributors
- Search and filter functionality

#### 🎯 Interview Experiences
- **Share Form** - 7-section guided wizard to document your interview journey
  - Company & Role information
  - Application source tracking
  - Interview rounds with details
  - Outcome and compensation info
  - Resources and tips
  - Questions asked
  - Visibility and settings
- **Experience Listing** - Browse, filter, and discover real interview stories
- **Experience Details** - Complete view with rounds, questions, and community interaction

#### 🏢 Companies Hub
- Browse 25K+ companies with insights
- Company cards showing experience counts and ratings
- Advanced filtering by skills and metrics
- Sort by rating, experiences, or interview volume
- Company detail pages with:
  - Interview timeline and rounds
  - Required skills analysis
  - Top questions asked
  - Success rate and difficulty metrics
  - AI-powered interview insights

#### 📄 Resume Optimizer
- 4-step wizard for resume optimization:
  1. **Job Details** - Input job description and target role
  2. **Your Profile** - Upload CV or fill manually
  3. **Skill Assessment** - Interactive skill evaluation with gap analysis
  4. **Resume Review** - Get optimization score and actionable recommendations
- Skill match visualization
- Export to PDF or LaTeX

#### 📊 Application Tracker
- Track all job applications in one place
- **Kanban View** - Visual pipeline with 8 stages:
  - Applied → Shortlisted → Assignment/OA → Interview Rounds → Offer Received → Offer Accepted/Rejected
- **List View** - Table format with sorting and filtering
- Application statistics dashboard
- Priority indicators and time tracking

#### 🏆 Leaderboard
- Community rankings and recognition
- Visual podium display for top 3
- Points-based achievement system
- Time-based filters (Week/Month/All Time)
- Top contributor badges

#### 👤 User Profiles
- Profile header with stats
- Tabs for posts, experiences, applications, and saved items
- Points and contribution tracking
- Follower/following system

#### ⚙️ Settings
- Profile management
- Account settings
- Privacy controls
- Notification preferences

#### 🔔 Notifications
- Real-time activity updates
- Like, comment, follow notifications
- Achievement badges
- Notification history and filtering

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library
- **@dnd-kit** - Drag and drop functionality

### Styling & Design
- Professional blue color scheme (#3377CC primary)
- Mint/teal accents
- Clean, modern typography
- Responsive, accessible design

### State & Data
- Client-side state management with React hooks
- Mock API utilities for development
- Custom hooks: useDebounce, usePagination, useFetch, useLocalStorage

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── (protected)/          # Protected route group
│   │   ├── feed/
│   │   ├── companies/
│   │   ├── experiences/
│   │   ├── resume/
│   │   ├── tracker/
│   │   ├── leaderboard/
│   │   ├── profile/
│   │   ├── notifications/
│   │   ├── settings/
│   │   └── layout.tsx        # Protected layout with sidebar
│   ├── login/
│   ├── signup/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn components
│   └── layout/               # Layout components (Sidebar, TopHeader, Navbar)
├── lib/
│   ├── constants.ts          # App constants and mock data
│   ├── validators.ts         # Zod schemas for validation
│   ├── api.ts                # Mock API utilities
│   ├── formatters.ts         # Formatting utilities
│   └── utils.ts              # Common utilities
├── hooks/
│   ├── useDebounce.ts
│   ├── usePagination.ts
│   ├── useFetch.ts
│   ├── useLocalStorage.ts
│   └── index.ts
└── public/                   # Static assets
```

## Design System

### Colors
- **Primary**: #3377CC (Professional Blue)
- **Secondary**: #4DB8A8 (Teal)
- **Accent**: #2DD4BF (Mint Green)
- **Destructive**: #EF4444 (Red)
- **Muted**: #F3F4F6 (Light Gray)
- **Background**: #FFFFFF / #0F172A (Dark mode)

### Typography
- **Font**: Geist (Sans) and Geist Mono
- **Headings**: Bold, Geist Sans
- **Body**: Regular 14-16px, Geist Sans

### Spacing & Radius
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Border Radius: 0.5rem (8px) standard

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Run development server**
   ```bash
   pnpm dev
   ```

3. **Open browser**
   ```
   http://localhost:3000
   ```

## Key Pages & Routes

| Route | Page | Features |
|-------|------|----------|
| `/` | Landing | Marketing page |
| `/login` | Login | Authentication |
| `/signup` | Signup | Account creation |
| `/feed` | Social Feed | Posts, trends |
| `/experiences` | Experiences List | Browse stories |
| `/experiences/share` | Share Experience | Guided 7-section form |
| `/experiences/[id]` | Experience Detail | Full experience view |
| `/companies` | Companies Hub | Search, filter, analytics |
| `/companies/[slug]` | Company Detail | Insights, timeline, skills |
| `/resume` | Resume Optimizer | 4-step wizard |
| `/tracker` | Application Tracker | Kanban & list views |
| `/leaderboard` | Leaderboard | Rankings, podium |
| `/profile` | User Profile | Stats, posts, experiences |
| `/notifications` | Notifications | Activity feed |
| `/settings` | Settings | Account management |

## Future Enhancements

- Backend API integration with database
- Real authentication system
- Email notifications
- Advanced search and filters
- Interview preparation resources
- Mentor matching
- Career coaching
- Resume parsing and analysis
- Video interview prep

## Development Notes

- All pages use mock data for demonstration
- Ready for backend integration
- Fully typed with TypeScript
- Responsive and accessible design
- Dark mode support included

---

Built with Next.js 16 and shadcn/ui on v0.
