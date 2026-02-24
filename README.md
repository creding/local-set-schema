# `local-seo-schema`

A highly opinionated, type-safe JSON-LD graph builder for Next.js and React.

Most schema libraries (like `next-seo` or `react-schemaorg`) force you to write isolated JSON-LD snippets. This means you have a `<BreadcrumbJsonLd>` here and a `<FAQPageJsonLd>` there, but Google has to _guess_ how they relate.

**`local-seo-schema` is different.** It is designed specifically for Local SEO and Home Service companies (Agencies, Roofers, Plumbers, Contractors). Instead of isolated snippets, it automatically builds a **fully interconnected Schema.org ecosystem** (an `@graph`).

It explicitly tells Google: _"This `FAQPage` is about this `Service`, which is provided by this `LocalBusiness`, which is a subsidiary of this parent `Organization` (Brand)."_

### Features

- **Zero Schema Bloat**: Spoke pages tightly focus on their specific content without repeating global brand schema.
- **City Hub & Spoke Built-In**: Automatically handles the complex relationship between your canonical Brand and your individual City / Service Area pages.
- **Site-Agnostic Setup**: Write your core `OrganizationProfile` config once, and pass it anywhere.

## Installation

```sh
npm install local-seo-schema
# or
yarn add local-seo-schema
# or
pnpm add local-seo-schema
```

---

## Quick Start

### 1. Define your Profile Details

Create a central configuration file (`lib/schema.ts`) to act as the single source of truth for the local business details.

```ts
import { OrganizationProfile } from "local-seo-schema";

export const myBrandProfile: OrganizationProfile = {
  name: "Mario's Pipes & Drains",
  legalName: "Mario Plumbing LLC",
  url: "https://marioplumbing.com",
  businessType: "Plumber",
  description: "24/7 emergency plumbers in Brooklyn.",
  logoUrl: "https://marioplumbing.com/logo.png",
  contact: {
    telephone: "+1-555-0198",
    address: {
      streetAddress: "123 Pipe Way",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      postalCode: "11201",
      addressCountry: "US",
    },
  },
  openingHours: [
    {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
};
```

### 2. Add the Global Brand Schema (App Layout)

In your root layout or homepage component, use `<JsonLdOrganization>` to define the parent company and the broad services it offers.

```tsx
import { JsonLdOrganization } from "local-seo-schema";
import { myBrandProfile } from "@/lib/schema";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <JsonLdOrganization
          profile={myBrandProfile}
          knowsAbout={["Drain Cleaning", "Pipe Repair"]}
          areaServed={[
            { name: "Brooklyn", region: "NY" },
            { name: "Queens", region: "NY" },
          ]}
          offers={[
            {
              name: "Drain Cleaning",
              url: "https://marioplumbing.com/drain-cleaning/",
            },
          ]}
          includeGlobalSignals={true}
        />
        {children}
      </body>
    </html>
  );
}
```

### 3. Build a Nested Service Graph (Targeted Spoke Pages)

When building a specific service or location page, use our composite graph features to generate tightly focused schemas without bloating the `<head>`.

```tsx
import { JsonLdService } from "local-seo-schema";

export default function DrainCleaningPage() {
  return (
    <>
      <JsonLdService
        pageUrl="https://marioplumbing.com/drain-cleaning/"
        title="Drain Cleaning Services in Brooklyn"
        description="Professional hydro-jetting and root removal."
        serviceName="Drain Cleaning"
        serviceType="PlumbingService"
        category="Home Services"
        organizationId="https://marioplumbing.com/#organization" // Auto-links to the layout schema!
        websiteId="https://marioplumbing.com/#website"
        breadcrumbItems={[
          { name: "Home", item: "https://marioplumbing.com/" },
          {
            name: "Drain Cleaning",
            item: "https://marioplumbing.com/drain-cleaning/",
          },
        ]}
        faqQuestions={[
          {
            question: "How long does it take?",
            answer: "Usually under 1 hour.",
          },
        ]}
      />
      <main>...</main>
    </>
  );
}
```

_Behind the scenes, this will stitch together and inject a single `<script>` containing a `WebPage`, `BreadcrumbList`, `Service`, and `FAQPage` — properly referencing each other via `@id`._

---

## File Architecture

| Export Area         | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| **`JsonLd.tsx`**    | Easy-to-use React configuration components (injects the `<script>` tag) |
| **`generators.ts`** | Low-level schema functions for building explicit sub-graphs.            |
| **`types.ts`**      | All TypeScript interfaces (e.g. `OrganizationProfile`, `SiteInfo`)      |

## `@id` Graph Linking Conventions

The secret to `local-seo-schema` is the strict anchor patterns. We use the following consistent IDs so Google can map entities across pages. If you supply `organizationId` strings to our composite generators, they will automatically stitch together.

| Entity Type        | Default pattern (`@id`)        | Note                                   |
| ------------------ | ------------------------------ | -------------------------------------- |
| Brand Organization | `{canonicalUrl}/#brand`        | The global corporation/publisher       |
| Local Business     | `{canonicalUrl}/#organization` | The specific physical service provider |
| WebSite            | `{canonicalUrl}/#website`      | The parent properties site             |

---

## Full API Reference

### React Helper Components

These components can be used anywhere in your React/Next.js tree.

- `<JsonLdOrganization>` (Global Homepage layout)
- `<JsonLdService>` (Service Hub pages)
- `<JsonLdGallery>` (Portfolio / Image Galleries)
- `<JsonLdFAQ>` (Standalone FAQ pages)
- `<JsonLdArticle>` (For Blogs / News)
- `<JsonLdProduct>` (For Ecommerce)
- `<JsonLdHowTo>` (Step-by-step guides)
- `<JsonLdEvent>` (Event pages)
- `<JsonLdCourse>` (Courses/Educational)
- `<JsonLdJobPosting>` (Careers / Hiring)
- `<JsonLdCustom>` (Escape hatch for raw schema-dts data)

### Component Generator Props

When using the lower-level React Components OR the composite graph functions, you must provide data matching these TypeScript interfaces.

#### `OrganizationProfile`

Used heavily by the global `<JsonLdOrganization>` layout setup.

```ts
interface OrganizationProfile {
  name: string;
  url: string; // Absolute canonical base url
  businessType: string; // e.g. "RoofingContractor", "Plumber", "LocalBusiness"
  contact: {
    telephone: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
    };
  };
  // Optional Fields:
  legalName?: string;
  personBasePath?: string; // Base path for Person @id anchors. Defaults to "/about/"
  logoUrl?: string;
  imageUrl?: string;
  description?: string;
  searchUrlTemplate?: string; // e.g. "https://example.com/search?q={search_term_string}"
  socialLinks?: string[];
  priceRange?: string;
  hasMap?: string;
  openingHours?: {
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }[];
  credentials?: {
    name: string;
    recognizedBy: string;
    recognizedByType?: string;
  }[];
  memberOf?: { name: string; url?: string; type?: string }[];
  founders?: {
    id: string;
    name: string;
    jobTitle?: string;
    sameAs?: string[];
  }[];
  employees?: {
    id: string;
    name: string;
    jobTitle?: string;
    sameAs?: string[];
  }[];
  aggregateRating?: AggregateRating;
  reviews?: Review[];
}
```

#### `ServicePageGraphOptions`

Extensively automates the `JsonLdService` component wiring.

```ts
interface ServicePageGraphOptions {
  pageUrl: string;
  title: string;
  description: string;
  serviceName: string;
  serviceDescription: string;
  websiteId: string;
  organizationId: string;

  // Optional Enhancement Fields
  serviceType?: string;
  category?: string;
  areaServed?: { name: string; region?: string; country?: string }[];
  offerCatalogName?: string;
  offerItems?: (string | { name: string; url?: string })[];
  aggregateRating?: AggregateRating;
  imageUrl?: string;
  breadcrumbItems?: BreadcrumbItem[];
  faqQuestions?: FAQItem[];
}
```

### Composite Page Graph Generators (Advanced Users)

If you don't want to use the `<JsonLd...>` React components (e.g. you are composing logic outside of React or need extreme customizability), you can use the raw `generator` functions. They return an object containing the `.graphItems` array that you can inject safely into your own script tags or the `<JsonLdCustom>` component.

- `generateStandardPageGraph(options)`
- `generateServicePageGraph(options)`
- `generateCityHubGraph(options)`
- `generateCityServicePageGraph(options)`
- `generateCollectionPageGraph(options)`
- `generateProjectPageGraph(options)`
- `generateBlogHubGraph(options)`
- `generateArticlePageGraph(options)`
- `generateImageGalleryGraph(options)`
