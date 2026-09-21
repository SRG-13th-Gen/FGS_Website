# Frontend Development & Architecture

This document describes the frontend application architecture, component hierarchy, client boundaries, routing structure, and developer workflows for Flor de Grace School Inc. (FGS).

Visual tokens, typography, and UI styling standards are specified in [DESIGN.md](DESIGN.md).

---

## 1. Technology Stack & Foundations

- **Framework**: Next.js (App Router) with React 19 and TypeScript.
- **Styling**: Tailwind CSS v4 using inline `@theme` tokens in `src/app/globals.css`.
- **UI Primitives**: Installed shadcn Radix Nova primitives in `src/components/ui` (Button, Card, Carousel, Dialog, Form, Input, Textarea, Tooltip, Sheet, etc.).
- **Icons**: Lucide React icons (`lucide-react`).
- **Carousel**: Embla Carousel React (`embla-carousel-react`) via shadcn carousel primitive.

---

## 2. Directory & Component Hierarchy

Public-facing components reside in `src/components/public`, admin editorial interfaces in `src/app/admin`, and shared utilities/data models in `src/lib`.

```
src/
├── app/
│   ├── layout.tsx              # Root HTML shell, providers, metadata
│   ├── page.tsx                # Public landing page (Hero, Montessori Banner, About, Admission, Contact)
│   ├── globals.css             # Tailwind v4 import, theme tokens, school brand variables
│   ├── admin/
│   │   ├── layout.tsx          # Dedicated admin portal shell & navigation header
│   │   └── page.tsx            # Article/Announcement authoring form with live preview & captioning
│   └── news/
│       └── [slug]/
│           └── page.tsx        # Dynamic full article view with image gallery & captions
├── components/
│   ├── providers.tsx           # ThemeProvider, TooltipProvider, Sonner Toaster
│   ├── public/
│   │   ├── navbar.tsx          # Sticky responsive navigation with scroll-triggered brand text
│   │   ├── footer.tsx          # Comprehensive dark footer with school crest and DepEd info
│   │   ├── clubs-section.tsx   # Interactive carousel for school clubs & activities
│   │   ├── gallery-section.tsx # 5-photo mosaic grid with expandable 'View More' toggle
│   │   └── news-section.tsx    # News & announcements grid with 'View More' toggle & detail routing
│   └── ui/                     # Official shadcn Radix primitives (Button, Card, Input, etc.)
└── lib/
    ├── articles.ts             # Central article data structures, sample stories, helper accessors
    └── utils.ts                # Tailwind clsx + twMerge utility function (`cn`)
```

---

## 3. Custom Public Components & Features

### 3.1 Sticky Navigation (`src/components/public/navbar.tsx`)

- Client boundary (`"use client"`).
- Dynamic brand title transition: The school crest stays permanently visible; the text _"Flor de Grace School Inc."_ smoothly slides and fades in (`opacity-0 -translate-x-2` to `opacity-100 translate-x-0`) once scrolled past the hero fold (`> 80px`).
- Mobile drawer using Radix `Sheet` containing navigation links, inquiry CTA, and school hours.

### 3.2 Landing Page (`src/app/page.tsx`)

- Composed of modular, accessible sections:
  1. **Hero**: High-impact graduation background image, italic tagline, and dual action CTAs.
  2. **Montessori Quote & Classroom Banner**: Full-bleed classroom image with dark overlay and centered quote.
  3. **About Us**: Campus narrative accompanied by subtle glassmorphic Mission (brand green) and Vision (amber) cards.
  4. **Admission**: Preschool & Elementary program cards, 3 category requirements (Old, New, Transferees), and 3-step enrollment guide.
  5. **Clubs & Activities**: Embedded `<ClubsSection />`.
  6. **Photo Gallery**: Embedded `<GallerySection />`.
  7. **News & Announcements**: Embedded `<NewsSection />`.
  8. **Contact Us**: Embedded inquiry form with hours, location, and interactive phone/email cards.

### 3.3 Clubs Carousel (`src/components/public/clubs-section.tsx`)

- Embla Carousel implementation with touch-drag support on mobile and prev/next buttons on desktop.
- Displays responsive card slides (1 per view on mobile, 2 on tablet, 3 on desktop).
- Features real-time active slide indicators (pagination dots) responding to scroll events.

### 3.4 Photo Gallery (`src/components/public/gallery-section.tsx`)

- Default view displays a curated 5-image mosaic (1 large featured photo on the left, 4 in a 2x2 grid on the right).
- An upper-right pill button (`View More / Show Less`) with animated chevron expands or collapses additional 5-image sets smoothly without route changes.

### 3.5 News & Announcements (`src/components/public/news-section.tsx`)

- 3-column card grid rendering articles from `src/lib/articles.ts`.
- Filterable category tags (`Announcements`, `Events`, `Clubs`).
- Upper-right `View More / Show Less` toggle button.
- Direct link to full story view (`/news/[slug]`).

### 3.6 Full Article View (`src/app/news/[slug]/page.tsx`)

- Dynamic route rendering individual articles with full editorial body.
- Displays author, publication date, read time, and category pill.
- Supports multi-image layout with dedicated photo captions.
- Includes breadcrumb navigation back to home/news.

### 3.7 Admin Publishing Portal (`src/app/admin/page.tsx`)

- Administrative interface for school staff to compose articles, stories, and announcements.
- Supported Fields:
  - Title input with character suggestions.
  - Category selector (`Announcements`, `Events`, `Clubs`).
  - Article Body text area with paragraph formatting.
  - Multiple image uploader with preview thumbnails and individual caption input fields per image.
- Dual-tab view: _Write & Edit_ mode and _Live Preview_ mode to inspect exact public appearance before publishing.

---

## 4. Performance & Mobile Rendering Rules

1. **Avoid Nested `backdrop-filter` in Tall Sections**:
   - Applying `backdrop-filter` (e.g. `backdrop-blur`) on full-section overlays that stretch thousands of pixels on mobile stacks creates excessive GPU composite memory allocations.
   - This previously caused iOS Safari and mobile Chrome to drop render layers, resulting in blank white screens in the Admission section.
   - **Rule**: Use high-contrast solid card surfaces (`bg-white border border-neutral-200 shadow-sm`) and solid/tinted section overlays (`bg-neutral-50/90`) rather than nested backdrop filters for tall stacked layouts.
2. **Local Image Optimization**:
   - Use Next.js `<Image>` with explicit dimensions or `fill` and responsive `sizes` to eliminate layout shift (CLS).
   - High-quality WebP assets are stored under `public/images/`.

---

## 5. Developer Quality Commands

Run these checks from the repository root:

- `pnpm dev`: Start Next.js App Router development server at `http://localhost:3000`.
- `pnpm typecheck`: Run TypeScript compiler validation (`tsc --noEmit`).
- `pnpm lint`: Run ESLint checks across all pages and components.
- `pnpm format:check`: Verify Prettier formatting compliance.
- `pnpm test:e2e`: Run Playwright end-to-end tests against a production build.
- `pnpm verify`: Run complete quality pipeline (lint, typecheck, format, test, build).
