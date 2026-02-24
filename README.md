# `local-seo-schema`

A highly opinionated, type-safe JSON-LD graph builder for Next.js and React.

Most schema libraries (like `next-seo` or `react-schemaorg`) force you to write isolated JSON-LD snippets. This means you have a `<BreadcrumbJsonLd>` here and a `<FAQPageJsonLd>` there, but Google has to _guess_ how they relate.

**`local-seo-schema` is different.** It is designed specifically for Local SEO and Home Service companies (Agencies, Roofers, Plumbers, Contractors). Instead of isolated snippets, it automatically builds a **fully interconnected Schema.org ecosystem** (an `@graph`).

It explicitly tells Google: _"This `FAQPage` is about this `Service`, which is provided by this `LocalBusiness`, which is a subsidiary of this parent `Organization` (Brand)."_

### How it works natively

1. You render the `<JsonLdOrganization>` component directly on your pages (e.g., inside `page.tsx` files). This establishes the foundation: the Brand, the LocalBusiness, and the WebSite.
2. For specific spoke pages (like a Service page or City Hub), you use one of our **Graph Builder Helpers** to generate the specific nodes for that page (e.g., `WebPage`, `Service`, `FAQPage`).
3. You pass those generated nodes into the `<JsonLdOrganization>` component for that page via the `graphItems` prop. The component stitches them all into one massive, interconnected `<script>` tag.

## Installation

```sh
npm install local-seo-schema
# or
yarn add local-seo-schema
# or
pnpm add local-seo-schema
```

---

## Quick Start (The Intended Pattern)

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

### 2. The Homepage

Render `<JsonLdOrganization>` directly on your homepage. Turn `includeGlobalSignals` to `true` to embed your broad services, service areas, and company-wide information.

_(Note: We recommend placing this component at the page level, not in the Next.js Root Layout, to prevent hydration and schema rendering issues)._

```tsx
import { JsonLdOrganization } from "local-seo-schema";
import { myBrandProfile } from "@/lib/schema";

export default function HomePage() {
  return (
    <>
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
      <main>
        <h1>Welcome to Mario's Pipes</h1>
      </main>
    </>
  );
}
```

### 3. Spoke Pages (The Graph Injection Pattern)

When building a specific service or location page, use our `generate...Graph` helpers. They return a `graphItems` array that you inject straight back into the `<JsonLdOrganization>` component for that specific page.

Notice we set `includeGlobalSignals={false}` here to prevent the homepage bloat from copying over to the tight, specific service page.

```tsx
import { JsonLdOrganization, generateServicePageGraph } from "local-seo-schema";
import { myBrandProfile } from "@/lib/schema";

export default function DrainCleaningPage() {
  // 1. Build the specific graph for this exact page
  const { graphItems } = generateServicePageGraph({
    pageUrl: "https://marioplumbing.com/drain-cleaning/",
    title: "Drain Cleaning Services in Brooklyn",
    description: "Professional hydro-jetting and root removal.",
    serviceName: "Drain Cleaning",
    serviceDescription: "Clear clogged drains fast.",
    serviceType: "PlumbingService",
    category: "Home Services",
    organizationId: "https://marioplumbing.com/#organization", // Auto-links to the component below!
    websiteId: "https://marioplumbing.com/#website",
    breadcrumbItems: [
      { name: "Home", item: "https://marioplumbing.com/" },
      {
        name: "Drain Cleaning",
        item: "https://marioplumbing.com/drain-cleaning/",
      },
    ],
    faqQuestions: [
      { question: "How long does it take?", answer: "Usually under 1 hour." },
    ],
  });

  return (
    <>
      {/* 2. Inject the graphItems into the Organization component for this page */}
      <JsonLdOrganization
        profile={myBrandProfile}
        graphItems={graphItems}
        includeGlobalSignals={false}
      />
      <main>...</main>
    </>
  );
}
```

---

## File Architecture

| Export Area             | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| **`JsonLd.tsx`**        | Easy-to-use React configuration components (injects the `<script>` tag)       |
| **`graph-builders.ts`** | High-level helpers that generate complete, interconnected `graphItems` arrays |
| **`generators.ts`**     | Low-level schema functions for building explicit sub-graphs.                  |
| **`types.ts`**          | All TypeScript interfaces (e.g. `OrganizationProfile`, `SiteInfo`)            |

## `@id` Graph Linking Conventions

The secret to `local-seo-schema` is the strict anchor patterns. We use the following consistent IDs so Google can map entities across pages. When you supply `organizationId` or `websiteId` strings to our composite generators, they rely on these exact anchors to stitch together inside `<JsonLdOrganization>`.

| Entity Type        | Default pattern (`@id`)        | Note                                   |
| ------------------ | ------------------------------ | -------------------------------------- |
| Brand Organization | `{canonicalUrl}/#brand`        | The global corporation/publisher       |
| Local Business     | `{canonicalUrl}/#organization` | The specific physical service provider |
| WebSite            | `{canonicalUrl}/#website`      | The parent properties site             |

---

## Full API Reference

### Component Generator Props

When using the lower-level React Components OR the composite graph functions, you must provide data matching these TypeScript interfaces.

#### `OrganizationProfile`

Used heavily by the global `<JsonLdOrganization>` setup.

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

### Composite Page Graph Builders (The Core Tools)

These are the functions you will use constantly. They return an object containing `.graphItems` (an array of schema elements) which you pass directly to `<JsonLdOrganization>` on your pages.

- `generateStandardPageGraph(options)` — Emits WebPage, BreadcrumbList, and FAQPage.
- `generateServicePageGraph(options)` — Standard + Service.
- `generateCityHubGraph(options)` — Standard + LocalBusiness (city variant) + Service (catalogues).
- `generateCityServicePageGraph(options)` — Standard + LocalBusiness (city variant) + Service.
- `generateProjectPageGraph(options)` — Standard + CreativeWork + ImageObjects.
- `generateCollectionPageGraph(options)` — Standard + ImageList.
- `generateBlogHubGraph(options)` — Standard + Blog.
- `generateArticlePageGraph(options)` — Standard + Article (BlogPosting).
- `generateImageGalleryGraph(options)` — Standalone ImageGallery generator, no wrapper.

### Smaller Standalone React Components

If you don't need the massive interconnected graphs for a page, you can use these lightweight wrapper components.

- `<JsonLdService>` (Wraps `generateServicePageGraph`)
- `<JsonLdGallery>` (Wraps `generateImageGalleryGraph`)
- `<JsonLdFAQ>` (Wrapper for standalone FAQ)
- `<JsonLdArticle>` (For Blogs / News)
- `<JsonLdProduct>` (For Ecommerce)
- `<JsonLdHowTo>` (Step-by-step guides)
- `<JsonLdEvent>` (Event pages)
- `<JsonLdCourse>` (Courses/Educational)
- `<JsonLdJobPosting>` (Careers / Hiring)
- `<JsonLdCustom>` (Escape hatch for raw schema-dts data)
