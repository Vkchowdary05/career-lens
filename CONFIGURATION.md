# CareerLens Configuration Guide

## Environment Setup

No environment variables required for development. The app runs with mock data out of the box.

### For Production (Future)
```env
NEXT_PUBLIC_API_URL=https://api.careerlens.com
DATABASE_URL=postgresql://...
NEXT_AUTH_SECRET=your-secret-key
```

## Design System Configuration

### Tailwind CSS
The project uses Tailwind CSS v4 with custom design tokens defined in `app/globals.css`.

**Custom Theme Variables:**
```css
--primary: oklch(0.35 0.15 240)        /* Professional Blue */
--secondary: oklch(0.55 0.12 180)      /* Teal */
--accent: oklch(0.55 0.12 140)         /* Mint Green */
--background: oklch(0.98 0.01 240)     /* Off-white */
--foreground: oklch(0.15 0.02 240)     /* Dark text */
--muted: oklch(0.92 0.01 240)          /* Light gray */
--border: oklch(0.88 0.01 240)         /* Border color */
--radius: 0.5rem                        /* Default radius */
```

### Custom Animations
Pre-defined animations available in globals.css:
- `animate-fade-in` - Fade in effect
- `animate-slide-in-down/up/right` - Slide animations
- `animate-scale-in` - Scale animation
- `animate-shimmer` - Loading shimmer
- `animate-pulse-glow` - Glow pulse effect
- `animate-card-lift` - Hover lift effect

## Component Library

### shadcn/ui Components Included

**Inputs & Forms:**
- Input
- Textarea
- Button
- Checkbox
- Select
- Badge

**Layout:**
- Card (CardHeader, CardContent, CardDescription)
- Tabs (TabsList, TabsTrigger, TabsContent)
- Modal (Dialog)

**Navigation:**
- Custom Sidebar
- TopHeader
- Navbar

### Accessing Components
```typescript
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
```

## Constants & Data

### Available Constants
Located in `lib/constants.ts`:

```typescript
// Difficulty levels for interviews
export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard']

// Interview round types
export const ROUND_TYPES = ['Phone Screen', 'Technical', 'System Design', 'Behavioral', 'Assignment/OA']

// Application stages
export const APPLICATION_STAGES = ['Applied', 'Shortlisted', 'Assignment/OA', 'Interview Rounds', 'Offer Received', 'Offer Accepted', 'Rejected']

// Skills categories
export const TECH_SKILLS = ['React', 'TypeScript', 'Node.js', 'Python', ...]

// Companies list
export const COMPANIES = ['Google', 'Microsoft', 'Meta', ...]
```

## Utilities & Helpers

### Formatting Utilities (`lib/formatters.ts`)
```typescript
formatDate(date: Date): string
formatCurrency(amount: number): string
formatNumberWithCommas(num: number): string
capitalizeFirstLetter(str: string): string
truncateText(text: string, length: number): string
slugify(text: string): string
```

### Validators (`lib/validators.ts`)
```typescript
// Zod schemas for validation
experienceSchema
applicationSchema
userProfileSchema
// ... more schemas
```

## Custom Hooks

### useDebounce
Debounce values with customizable delay.
```typescript
const debouncedValue = useDebounce(searchQuery, 300)
```

### usePagination
Manage pagination state.
```typescript
const { page, pageSize, totalPages } = usePagination(items, 10)
```

### useFetch
Fetch data with loading/error states.
```typescript
const { data, loading, error } = useFetch('/api/experiences')
```

### useLocalStorage
Persist state to localStorage.
```typescript
const [user, setUser] = useLocalStorage('user', null)
```

## API Integration

### Mock API (`lib/api.ts`)
Currently using mock functions. To integrate real API:

1. Replace mock functions with actual fetch calls
2. Add error handling and retry logic
3. Implement proper authentication
4. Add request/response interceptors

```typescript
// Current (mock)
export async function getExperiences() {
  return { success: true, data: [...] }
}

// Future (real API)
export async function getExperiences() {
  const res = await fetch('/api/experiences')
  return res.json()
}
```

## Routing Architecture

### Protected Routes
All authenticated pages use the `(protected)` route group.

**Route Structure:**
```
app/
├── (protected)/
│   ├── feed/page.tsx          → /feed
│   ├── companies/page.tsx      → /companies
│   ├── companies/[slug]/page.tsx → /companies/google
│   ├── experiences/page.tsx    → /experiences
│   ├── experiences/share/page.tsx → /experiences/share
│   ├── experiences/[id]/page.tsx → /experiences/1
│   ├── resume/page.tsx         → /resume
│   ├── tracker/page.tsx        → /tracker
│   ├── leaderboard/page.tsx    → /leaderboard
│   ├── profile/page.tsx        → /profile
│   ├── notifications/page.tsx  → /notifications
│   ├── settings/page.tsx       → /settings
│   └── layout.tsx              # Applies sidebar & header
├── login/page.tsx              → /login
├── signup/page.tsx             → /signup
└── page.tsx                    → /
```

### Layout Hierarchy
```
Root Layout (app/layout.tsx)
├── Public Pages (no layout)
│   ├── / (Landing)
│   ├── /login
│   └── /signup
└── Protected Layout (app/(protected)/layout.tsx)
    ├── Sidebar Navigation
    ├── TopHeader
    └── Page Content
```

## Performance Optimization

### Current Optimizations
- ✅ Code splitting with Next.js
- ✅ Image optimization ready
- ✅ CSS-in-JS with Tailwind
- ✅ Component lazy loading ready

### For Production
1. Add image optimization with `next/image`
2. Implement dynamic imports for large components
3. Add caching headers for static assets
4. Implement database indexing
5. Add CDN for static content
6. Optimize bundle size

## Development Workflow

### Adding a New Page
1. Create folder: `app/(protected)/feature/page.tsx`
2. Add to sidebar navigation in `components/layout/Sidebar.tsx`
3. Create UI components in `components/feature/`
4. Add types in `lib/types.ts` (if needed)
5. Use constants from `lib/constants.ts`

### Adding a New Component
1. Create in `components/ui/` or `components/[feature]/`
2. Export with proper TypeScript types
3. Add stories/examples for reference

### Styling Guidelines
- Use Tailwind utility classes
- Leverage CSS custom properties from `globals.css`
- Maintain consistent spacing (use scale: 4, 8, 12, 16, 24, 32)
- Use semantic color names: `primary`, `secondary`, `accent`, `destructive`, `muted`

## Testing & Debugging

### Debug Logging
```typescript
console.log('[v0] Variable:', variable)  // With prefix for clarity
```

### Common Issues
- **Import paths**: Always use absolute imports with `@/`
- **Component missing**: Check shadcn/ui installation
- **Styling not applied**: Verify CSS import in layout.tsx
- **Routes not working**: Check `(protected)` layout.tsx exists

## Database Schema (Future)

For backend integration, ensure these tables exist:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  name VARCHAR,
  created_at TIMESTAMP
);

-- Experiences
CREATE TABLE experiences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  company VARCHAR,
  role VARCHAR,
  rounds JSON,
  rating DECIMAL,
  created_at TIMESTAMP
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  company VARCHAR,
  role VARCHAR,
  stage VARCHAR,
  applied_at TIMESTAMP
);
```

## Deployment

### Vercel Deployment (Recommended)
1. Push code to GitHub
2. Connect repository in Vercel
3. Environment variables automatically set
4. Deploy with one click

### Self-hosted
1. Build: `pnpm build`
2. Start: `pnpm start`
3. Set production environment variables
4. Configure reverse proxy (nginx)

## Support & Documentation

- Next.js Docs: https://nextjs.org
- shadcn/ui: https://ui.shadcn.com
- Tailwind: https://tailwindcss.com
- TypeScript: https://www.typescriptlang.org
