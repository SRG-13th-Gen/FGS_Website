# Flor de Grace School (FGS) — Visual Design System & UI Specifications

This document defines the visual design language, color tokens, typography, component styling patterns, and responsive UI behaviors for the Flor de Grace School Inc. web application.

---

## 1. Brand Identity & Color Tokens

The visual identity is anchored on the official Flor de Grace School crest palette: vibrant growth green, warm academic gold/yellow, and crisp modern neutrals.

### 1.1 Brand Color Palette

Defined in `src/app/globals.css` and exposed through Tailwind CSS v4 `@theme inline`:

| Token | CSS Variable | Hex / Oklch Value | Usage & Intent |
| :--- | :--- | :--- | :--- |
| **`school-green`** | `--school-green` | `#54B435` | Primary brand color: buttons, key highlights, section accents, badges. |
| **`school-green-dark`** | `--school-green-dark` | `#3d8a27` | Hover states for primary actions, high-contrast dark green text on light badges. |
| **`school-green-light`** | `--school-green-light` | `#e8f5e3` | Subtle badge backgrounds, tint highlights, selected state backgrounds. |
| **`school-yellow`** | `--school-yellow` | `#eada2b` | Secondary brand accent: graduation motifs, secondary badges, decorative dividers. |
| **`school-yellow-light`** | `--school-yellow-light` | `#fdf9e0` | Warm tint backgrounds, alert cards, transferee category accents. |

### 1.2 Surface & Neutral Tokens

| Token | Tailored Utility | Purpose |
| :--- | :--- | :--- |
| **Canvas Background** | `bg-white` (`oklch(1 0 0)`) | Primary page backdrop for clean contrast. |
| **Secondary Background** | `bg-neutral-50` / `bg-neutral-100` | Alternating section backgrounds and input fill. |
| **Card Surface** | `bg-white border border-neutral-200` | Solid opaque card backgrounds ensuring fast mobile compositing. |
| **Primary Text** | `text-neutral-900` (`oklch(0.145 0 0)`) | High-contrast readability for headings and titles. |
| **Body Text** | `text-neutral-600` / `text-neutral-700` | Comfortable reading contrast for paragraphs and list items. |
| **Muted Text** | `text-neutral-400` / `text-neutral-500` | Timestamps, metadata, fine print, and input placeholders. |
| **Dark Theme (Footer & Banner)** | `bg-neutral-950` / `text-neutral-300` | Deep anchor contrast for classroom banner and footer. |

---

## 2. Typography & Text Hierarchy

### 2.1 Font Families
- **Primary Sans**: `ui-sans-serif, system-ui, sans-serif` — zero network latency, sharp system rendering across macOS, iOS, Windows, and Android.
- **Display / Tagline**: Font serif italic styling (`font-serif italic`) reserved for inspirational taglines and mottos.

### 2.2 Typographic Hierarchy

| Element | Sizing & Weight | Styling Rules |
| :--- | :--- | :--- |
| **Section Label** | `text-sm font-semibold uppercase` | `tracking-widest text-school-green` |
| **Section Heading (H2)** | `text-3xl font-bold sm:text-4xl` | `tracking-tight text-neutral-900` |
| **Heading Accent** | `h-1 w-16 rounded-full bg-school-green` | Centered decorative pill below section headings. |
| **Subheading (H3)** | `text-xl font-bold sm:text-2xl` | `text-neutral-900` for subsection titles. |
| **Card Heading (H4)** | `text-base font-semibold sm:text-lg font-bold` | Primary label within cards and modules. |
| **Body Copy** | `text-base` or `text-sm leading-relaxed` | `text-neutral-600` or `text-neutral-700`. |
| **Navbar Brand** | `text-sm font-normal sm:text-base` | Regular weight text that slides into view when scrolling past hero. |

---

## 3. UI Component Patterns & Visual Standards

### 3.1 Sticky Navigation Bar (`Navbar`)
- **Structure**: Fixed top navigation with blurred backdrop (`bg-white/95 backdrop-blur-md shadow-xs`).
- **Dynamic Brand Disclosure**:
  - The school crest logo (`/images/logo/fgs_logo.webp`) remains persistently visible at all times.
  - The text *"Flor de Grace School Inc."* is set to `font-normal` and smoothly translates and fades into view (`opacity-0 -translate-x-2` to `opacity-100 translate-x-0`) only when the user scrolls down past the hero fold (`> 80px`).
- **Desktop Links**: Horizontal list with hover color transition (`hover:text-school-green`).
- **Enroll CTA**: Compact rounded pill button with brand green gradient and subtle scale on hover.
- **Mobile Menu**: Responsive sheet drawer with full-height navigation links and quick-contact info.

### 3.2 Hero Section
- **Visuals**: Full-bleed background image (`/images/general/graduation.webp`) with multi-stop dark gradient overlay (`bg-neutral-900/60 via-black/50 to-neutral-950/80`).
- **Composition**: Centered layout featuring:
  - School category pill: *"DepEd Recognized • Preschool to Grade 6"*.
  - Grand title: *"Flor de Grace School Inc."* in crisp white.
  - Green brand divider line.
  - Tagline in elegant serif italic: *"Nurturing young minds with excellence, values, and grace."*
  - Dual action buttons: Primary green *"Inquire / Enroll Now"* and frosted translucent *"Learn More"*.

### 3.3 Montessori Quote & Classroom Banner
- **Visuals**: Full-bleed classroom background (`/images/general/classroom.webp`) with dark overlay (`bg-neutral-950/75`).
- **Accents**: Warm gold/yellow decorative quotation marks (`text-school-yellow/60`) and centered philosophical quote by Dr. Maria Montessori.

### 3.4 About Us Section
- **Two-Column Narrative**: High-resolution campus photo on the left; narrative copy on the right.
- **Mission & Vision Cards**:
  - **Mission Card**: Subtle green border and tint (`border-school-green/30 bg-school-green/5`) with `<Compass className="text-school-green" />`.
  - **Vision Card**: Subtle warm amber border and tint (`border-amber-400/30 bg-amber-50/50`) with `<Lightbulb className="text-amber-500" />`.

### 3.5 Admission Section
- **Performance & Mobile Rule**: Uses solid opaque cards (`bg-white border border-neutral-200 shadow-sm`) over a `bg-neutral-50/90` section overlay. Avoids nested `backdrop-blur` filters to prevent GPU compositing drops and blank white screen bugs on iOS and mobile Chrome.
- **Programs**: Two equal cards (Preschool and Elementary) with Lucide icon headers (`<Blocks>` in school green, `<BookOpen>` in amber).
- **Requirements**: 3 distinct categories:
  - *Old Students*: Returning student badge.
  - *New Students*: Primary green highlighted border (`border-2 border-school-green/30`) with *"New Enrollment"* green pill.
  - *Transferees*: Yellow accent badge with complete clearance and moral requirements.
- **Enrollment Process**: 3-step numbered cards (`01 Inquire`, `02 Submit Requirements`, `03 Enroll`) with vertical brand green accent tabs.

### 3.6 Clubs & Activities Carousel
- **Component**: Embla Carousel (`src/components/public/clubs-section.tsx`).
- **Layout**: Fluid horizontally scrollable cards with responsive slide sizing (`basis-full sm:basis-1/2 lg:basis-1/3`).
- **Interactions**: Left/Right circular arrow navigation buttons with disabled opacity states, plus active dot indicators with transition animations.
- **Card Anatomy**: Image header with hover zoom (`group-hover:scale-105`), category badge, club title, description, and meeting schedule footer.

### 3.7 Photo Gallery Section
- **Component**: Mosaic grid (`src/components/public/gallery-section.tsx`).
- **Default View (1 Set)**: Asymmetric 5-photo mosaic:
  - 1 large featured vertical/square photo on the left.
  - 4 photos on the right arranged in a clean 2x2 grid.
- **View More / Show Less**: Interactive pill button at the top-right header with animated chevron icon (`ChevronDown` / `ChevronUp`) that expands additional 5-photo sets without page reload.

### 3.8 News & Announcements Section
- **Component**: Article card grid (`src/components/public/news-section.tsx`).
- **Card Design**: Rounded card with image thumbnail, category pill badge (`Announcements` in green, `Events` in blue, `Clubs` in purple), publication date, headline, excerpt, and arrow link (`Read full story →`).
- **Full Article View**: Clicking any article links directly to `/news/[slug]` with article reading view, multi-image gallery with individual captions, and breadcrumbs.
- **Pagination**: Includes an upper-right *"View More / Show Less"* pill button matching the Gallery design.

### 3.9 Admin Publishing Portal (`/admin`)
- **Workspace**: Dedicated, distraction-free administrative layout (`src/app/admin/layout.tsx`).
- **Form Layout**:
  - Sticky header with school branding, draft indicator, and Publish button.
  - Title input with character guidance.
  - Category selector (`Announcements`, `Events`, `Clubs`).
  - Rich body textarea.
  - Multiple image uploader with thumbnail previews, remove action, and dedicated individual caption inputs.
  - Tabbed interface switching between *Write & Edit* and *Live Preview* to inspect exactly how the published story will look.

---

## 4. Responsive Breakpoints

| Breakpoint | Width | Behavior |
| :--- | :--- | :--- |
| **Mobile (`< 640px`)** | Default | Single-column stacking, mobile slide-out drawer navigation, solid opaque cards, touch carousel drag. |
| **Tablet (`sm: 640px`)** | `640px` | 2-column admission cards, 2-column club carousel slide visibility. |
| **Desktop (`md / lg: 768px - 1024px`)** | `768px+` | 3-column requirement cards, 3-column news grid, asymmetric 5-image gallery mosaic. |
| **Container Max** | `max-w-7xl` (`1280px`) | Standard centered content container with consistent horizontal padding (`px-4 sm:px-6 lg:px-8`). |
