# Flordegrace School Website — Implementation Plan

## 1. Overview

The website will use a **headless WordPress + Next.js architecture**.

- **Public Website:** `https://flordegraceschoolinc.com`
- **Team Admin:** `https://flordegraceschoolinc.com/admin`
- **Client CMS:** `https://cms.flordegraceschoolinc.com/wp-admin`
- **CMS API:** `https://cms.flordegraceschoolinc.com/wp-json/wp/v2`

WordPress remains the **single source of truth for website content**. The client manages content using the normal WordPress admin, while the development team can manage the same content using a custom Next.js `/admin` interface.

The Next.js admin must not maintain a second copy of WordPress posts, pages, categories, or media.

---

## 2. High-Level Architecture

```text
                     CLIENT / SCHOOL STAFF
                             |
                             v
            cms.flordegraceschoolinc.com/wp-admin
                             |
                             v
                  +----------------------+
                  |      WordPress       |
                  |----------------------|
                  | Posts / Pages        |
                  | Media                |
                  | Categories           |
                  | Gutenberg            |
                  | REST API             |
                  +----------+-----------+
                             |
                    WordPress REST API
                             |
           +-----------------+-----------------+
           |                                   |
           v                                   v
+----------------------+            +----------------------+
| Next.js Public Site  |            | Next.js /admin      |
|----------------------|            |----------------------|
| SSG / ISR            |            | Team CRUD interface |
| SEO                   |            | Protected routes    |
| Public pages          |            | Server-side API     |
+----------+-----------+            +----------+-----------+
           |                                   |
           +-----------------+-----------------+
                             |
                             v
                         Visitors
```

### Content Flow

```text
Client -> WordPress /wp-admin -> WordPress content

Team -> Next.js /admin -> Next.js server -> WordPress REST API -> WordPress content

Public Website -> WordPress REST API -> Next.js cache / ISR -> Visitors
```

---

## 3. Hosting Structure

```text
Hostinger
|
+-- flordegraceschoolinc.com
|   +-- Next.js
|       +-- Public website
|       +-- /admin
|       +-- ISR / caching
|       +-- Revalidation endpoint
|
+-- cms.flordegraceschoolinc.com
    +-- WordPress
        +-- MySQL / MariaDB
```

Docker will be used **only for local development**, not for production deployment.

---

## 4. Technology Stack

### Frontend

- **Next.js** — App Router
- **React**
- **TypeScript**
- **Tailwind CSS** — styling
- **shadcn/ui** — reusable UI components
- **Lucide React** — icons
- **Next.js Image** — image optimization
- **Next.js Metadata API** — SEO metadata

### Forms and Validation

- **React Hook Form** — form handling
- **Zod** — validation
- **Sonner** — notifications/toasts

### CMS

- **WordPress** — headless CMS
- **Gutenberg** — client editor
- **WordPress REST API** — content API
- **WordPress Media Library** — media management
- **WordPress Application Passwords** — server-to-server API authentication

### Database

- **MySQL / MariaDB** — WordPress database
- **MySQL / MariaDB** — optional Next.js application database
- **Drizzle ORM** — only for Next.js-owned tables

The Next.js application must **not directly modify WordPress database tables**. WordPress content should be managed through the REST API.

### Data Fetching

- **Native Next.js `fetch()`** for WordPress content
- **Server Actions / Route Handlers** for protected mutations

Native `fetch()` is preferred over Axios for WordPress content because it integrates directly with Next.js caching and revalidation.

### Development and Deployment

- **Node.js**
- **npm or pnpm**
- **Docker Compose** — local WordPress and MySQL only
- **GitHub** — source control
- **Hostinger** — production hosting
- **Hostinger MCP** — optional deployment/operations assistance
- **GitHub Actions** — optional later for CI/CD

---

## 5. WordPress Content Model

WordPress owns all content visible on the public website.

### Posts / Announcements

```text
Post
- id
- title
- slug
- content
- excerpt
- featured_image
- status
- author
- categories
- published_at
- updated_at
```

Possible categories:

```text
Announcement
News
Advisory
Event
```

### Pages

Used for editable informational pages such as:

```text
About
Admissions
Programs
Contact
Other school information
```

### Media

```text
Media
- id
- file_url
- mime_type
- title
- alt_text
- caption
- uploaded_at
```

WordPress Media Library remains the source of truth for uploaded media.

---

## 6. Database Architecture

### A. WordPress Database

WordPress manages its own MySQL/MariaDB schema.

Conceptually it stores:

```text
WordPress Database
|
+-- Posts / Pages
+-- Post Metadata
+-- Users
+-- User Metadata
+-- Categories / Taxonomies
+-- Media Metadata
+-- WordPress Settings
+-- Plugin Data
```

Next.js should access this content through the WordPress REST API rather than direct SQL queries.

### B. Next.js Application Database

A separate application database is optional and should contain only data that belongs to the Next.js application.

Initial possible schema:

```text
team_users
- id
- name
- email
- password_hash or auth_provider_id
- role
- created_at
- updated_at

admin_audit_logs
- id
- team_user_id
- action
- resource_type
- resource_id
- metadata
- created_at

app_settings
- id
- key
- value
- updated_at
```

### Data Ownership

| Data | Source of Truth |
|---|---|
| Posts / Announcements | WordPress |
| Pages | WordPress |
| Media | WordPress |
| Categories | WordPress |
| Client users | WordPress |
| Team `/admin` users | Next.js app DB or auth provider |
| Team audit logs | Next.js app DB |
| Internal settings | Next.js app DB |

---

## 7. Next.js Application Structure

```text
src/
|
+-- app/
|   +-- (public)/
|   |   +-- page.tsx
|   |   +-- announcements/
|   |   +-- about/
|   |   +-- ...
|   |
|   +-- admin/
|   |   +-- page.tsx
|   |   +-- posts/
|   |   +-- media/
|   |   +-- categories/
|   |
|   +-- api/
|       +-- revalidate/
|
+-- components/
|   +-- ui/
|   +-- public/
|   +-- admin/
|
+-- lib/
|   +-- wordpress/
|   +-- auth/
|   +-- db/
|   +-- validation/
|
+-- types/
```

The structure may change as detailed specifications are created.

---

## 8. WordPress REST API Integration

### Public Reads

Typical resources:

```text
GET /wp-json/wp/v2/posts
GET /wp-json/wp/v2/pages
GET /wp-json/wp/v2/categories
GET /wp-json/wp/v2/media
```

### Team `/admin` CRUD

The custom admin may support:

```text
Create post
Read posts
Update post
Delete post
Publish / unpublish post
Upload media
Manage categories
```

All authenticated WordPress requests must run **server-side**. WordPress credentials must never be exposed in browser code or `NEXT_PUBLIC_*` environment variables.

---

## 9. ISR and Revalidation

The public website will use Next.js caching and Incremental Static Regeneration where appropriate.

```text
WordPress
    |
    v
Next.js fetch + cache
    |
    v
ISR-generated pages
    |
    v
Visitors
```

### When the Team Updates Content

```text
/admin
   -> WordPress REST API
   -> WordPress updated
   -> Next.js revalidation
   -> Public content refreshed
```

### When the Client Updates Content

```text
WordPress publish/update
   -> webhook
   -> Next.js revalidation endpoint
   -> Public content refreshed
```

The revalidation endpoint should be protected by a shared secret.

---

## 10. Authentication Model

### Client

Uses normal WordPress authentication at:

```text
cms.flordegraceschoolinc.com/wp-admin
```

### Team

Uses the protected Next.js admin at:

```text
flordegraceschoolinc.com/admin
```

Initial team roles may include:

```text
Admin
Editor
Viewer
```

### WordPress Integration Account

A dedicated WordPress user should be created for the Next.js server integration.

```text
Next.js server
    -> WordPress Application Password
    -> WordPress REST API
```

The account should receive only the permissions required by the custom admin.

---

## 11. Local Development

Recommended local setup:

```text
Developer Machine
|
+-- Next.js
|   +-- localhost:3000
|
+-- Docker Compose
    +-- WordPress
    |   +-- localhost:8080
    |
    +-- MySQL
```

Example environment difference:

```text
Development:
WORDPRESS_URL=http://localhost:8080

Production:
WORDPRESS_URL=https://cms.flordegraceschoolinc.com
```

Secrets should be stored in environment variables and never committed to Git.

---

## 12. Initial Technology Baseline

| Area | Technology |
|---|---|
| Frontend Framework | Next.js |
| Language | TypeScript |
| UI | React |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Forms | React Hook Form |
| Validation | Zod |
| Icons | Lucide React |
| Notifications | Sonner |
| CMS | WordPress |
| CMS Editor | Gutenberg |
| CMS API | WordPress REST API |
| Database | MySQL / MariaDB |
| App ORM | Drizzle ORM, if needed |
| Caching | Next.js Cache + ISR |
| Local CMS/DB | Docker Compose |
| Source Control | GitHub |
| Production Hosting | Hostinger |

---

## 13. Deferred Specifications

The following will be defined later as separate requirements or technical specifications:

- Complete sitemap and page requirements
- Detailed UI/UX design
- Detailed `/admin` screens and workflows
- Final WordPress content types and custom fields
- Detailed role/permission rules
- Authentication implementation
- SEO requirements
- Forms and email handling
- Search
- Analytics
- Testing strategy
- CI/CD details
- Backup and recovery
- Security hardening
- Migration procedure

This document should remain the **high-level technical blueprint** and can be expanded once the remaining project specifications are finalized.
