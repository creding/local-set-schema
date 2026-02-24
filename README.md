# Reusable JSON-LD Toolkit

A reusable, type-safe JSON-LD toolkit for Next.js/React projects. **Site-agnostic** — all site data is passed through typed option interfaces, making it portable across any project.

## Installation

```sh
npm install local-seo-schema
# or
yarn add local-seo-schema
# or
pnpm add local-seo-schema
```

## File Map

| File                | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| `types.ts`          | All TypeScript input interfaces (Single source of truth)   |
| `generators.ts`     | Pure schema generation functions (Logic only)              |
| `graph-builders.ts` | Complex page-level schema graph builders                   |
| `utils.ts`          | Shared utilities and schema builder helpers                |
| `JsonLd.tsx`        | React `<script type="application/ld+json">` render helpers |
| `example.ts`        | Annotated usage examples for every generator and component |

---

## Core Configuration Interfaces (types.ts)

### `SiteInfo`

Minimal site metadata for `ImageObject` license/copyright fields.

```ts
interface SiteInfo {
  url: string; // Canonical origin, no trailing slash
  legalName: string; // Full legal name for copyright notices
  contactPagePath?: string; // Defaults to "/contact/"
}
```

### `LocalBusinessConfig`

Full config for city-level `LocalBusiness` nodes with trust signals.

```ts
interface LocalBusinessConfig {
  businessType?: string; // Defaults to "RoofingContractor"
  legalName: string;
  baseUrl: string;
  cityPageBasePath?: string; // Defaults to "/areas-we-serve/"
  phone: string;
  imageUrl?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string; // Two-letter abbreviation, e.g. "AL"
    postalCode: string;
    addressCountry?: string; // Defaults to "US"
  };
  openingHours: { dayOfWeek: string[]; opens: string; closes: string }[];
  stateName?: string; // Full state name. Defaults to addressRegion value.
  priceRange?: string;
  credentials?: {
    name: string;
    recognizedBy: string;
    recognizedByType?: string;
  }[];
}
```

### `ServiceAreaData`

```ts
interface ServiceAreaData {
  slug: string;
  name: string;
  lat?: number | null;
  lng?: number | null;
}
```

### `ServiceEntry`

```ts
interface ServiceEntry {
  slug: string;
  name: string;
}
```

### `GalleryProject`

```ts
interface GalleryProject {
  id: string;
  title: string;
  description?: string | null;
  images: { storage_path: string; alt_text?: string | null }[];
  latitude?: number | null;
  longitude?: number | null;
  neighborhood_tag?: string | null;
  completion_date?: string | null;
  city?: { name: string } | null;
  service?: { name: string } | null;
  services?: { name: string }[];
}
```

---

## `OrganizationProfile` (types.ts)

Central profile object used by `JsonLdOrganization` and `generateOrganizationSchema`.

```ts
interface OrganizationProfile {
  name: string;
  legalName?: string;
  url: string;
  personBasePath?: string; // Base path for Person @id anchors. Defaults to "/about/"
  logoUrl?: string;
  imageUrl?: string;
  description?: string;
  searchUrlTemplate?: string; // e.g. "https://example.com/search?q={search_term_string}"
  businessType: string; // e.g. "RoofingContractor", "Plumber", "LocalBusiness"
  contact: {
    telephone: string;
    contactType?: string;
    email?: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry?: string;
    };
    geo?: { latitude: number; longitude: number };
  };
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

---

## React Components (`JsonLd.tsx`)

All components render a `<script type="application/ld+json">` tag. Mount in Server Components.

### `JsonLdOrganization` — Global layout component

Builds one `@graph`: Brand `Organization` (`#brand`) + Local business (`#organization`) + `WebSite` + any `graphItems`.

```tsx
<JsonLdOrganization
  profile={myProfile}
  knowsAbout={["Roof Repair", "Siding", "Gutters"]}
  areaServed={[
    { name: "Birmingham", region: "AL", country: "US" },
    { name: "Hoover", region: "AL" },
  ]}
  offers={[
    { name: "Roof Replacement", url: "https://example.com/roof-replacement/" },
    {
      name: "Siding",
      url: "https://example.com/siding/",
      description: "Fiber cement siding",
    },
  ]}
  offerCatalogName="Roofing & Home Exterior Services"
  includeGlobalSignals={true} // Set false on spoke pages to keep schema focused
  graphItems={[webPageSchema, breadcrumbSchema]}
/>
```

| Prop                   | Type                            | Default                      | Description                                                  |
| ---------------------- | ------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| `profile`              | `OrganizationProfile`           | required                     | Full org profile                                             |
| `graphItems`           | `SchemaNode[]`                  | `[]`                         | Extra nodes merged into `@graph`                             |
| `knowsAbout`           | `string[]`                      | —                            | Topics the local business knows about                        |
| `areaServed`           | `{ name, region?, country? }[]` | —                            | Cities/regions served                                        |
| `offers`               | `{ name, url, description? }[]` | —                            | Services offered                                             |
| `offerCatalogName`     | `string`                        | `"${profile.name} Services"` | Name for the `OfferCatalog`                                  |
| `includeGlobalSignals` | `boolean`                       | `true`                       | Whether to add `knowsAbout`, `areaServed`, `hasOfferCatalog` |

---

### `JsonLdService` — Service landing pages

Renders `WebPage` + `BreadcrumbList` + `Service` + optional `FAQPage` in one `@graph`.

```tsx
<JsonLdService
  pageUrl="https://example.com/roofing-services/roof-repair/"
  title="Roof Repair Services"
  description="Expert leak detection and shingle repair."
  serviceName="Professional Roof Repair"
  serviceDescription="We fix leaks, missing shingles, and storm damage."
  serviceType="RoofingService"
  category="Home Services"
  offerCatalogName="Repair Services"
  offerItems={[
    { name: "Shingle Repair", url: "https://example.com/shingle-repair/" },
    "Flashing Repair",
  ]}
  areaServed={[{ name: "Birmingham", region: "AL" }]}
  aggregateRating={{ ratingValue: 4.9, reviewCount: 87 }}
  imageUrl="https://example.com/images/roof-repair.webp"
  websiteId="https://example.com/#website"
  organizationId="https://example.com/#organization"
  breadcrumbItems={[
    { name: "Home", item: "https://example.com/" },
    { name: "Roofing", item: "https://example.com/roofing-services/" },
    {
      name: "Roof Repair",
      item: "https://example.com/roofing-services/roof-repair/",
    },
  ]}
  faqQuestions={[
    {
      question: "How long does a repair take?",
      answer: "Most repairs take 1–3 hours.",
    },
  ]}
/>
```

---

### `JsonLdGallery` — Project gallery pages

Renders an `ImageGallery` node with `ImageObject` children (license, copyright, geo metadata).

```tsx
<JsonLdGallery
  projects={projects}
  pathname="/projects/"
  organizationId="https://example.com/#organization"
  siteInfo={{
    url: "https://example.com",
    legalName: "My Company LLC",
    contactPagePath: "/contact/",
  }}
/>
```

---

### `JsonLdFAQ` — Standalone FAQ

```tsx
<JsonLdFAQ
  questions={[
    {
      question: "Do you offer free estimates?",
      answer: "Yes, all estimates are free.",
    },
    { question: "Are you licensed?", answer: "Yes, licensed in Alabama." },
  ]}
  pageUrl="https://example.com/faq/"
  publisherId="https://example.com/#brand"
/>
```

---

### `JsonLdArticle` — Blog posts / news

```tsx
<JsonLdArticle
  headline="5 Signs You Need a New Roof"
  url="https://example.com/blog/signs-you-need-new-roof/"
  image={["https://example.com/images/roof-signs.webp"]}
  datePublished="2025-03-15"
  dateModified="2025-04-01"
  authorName="Justin Smith"
  authorUrl="https://example.com/about/#justin"
  publisherName="My Company"
  publisherLogo="https://example.com/logo.png"
  description="Learn the top warning signs that your roof needs replacing."
/>
```

---

### `JsonLdProduct` — Product pages

```tsx
<JsonLdProduct
  name="GAF Timberline HDZ Shingles"
  image={["https://example.com/images/gaf-shingles.webp"]}
  description="Industry-leading architectural shingles."
  sku="GAF-HDZ-BLK"
  brand="GAF"
  offers={{
    price: 89.99,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://example.com/products/gaf-hdz/",
    priceValidUntil: "2026-12-31",
  }}
  aggregateRating={{ ratingValue: 4.8, reviewCount: 312 }}
  reviews={[
    {
      author: "John D.",
      datePublished: "2025-06-01",
      ratingValue: 5,
      reviewBody: "Held up through two storms.",
      publisher: "Google",
    },
  ]}
/>
```

---

### `JsonLdHowTo` — Step-by-step guides

```tsx
<JsonLdHowTo
  name="How to Inspect Your Roof After a Storm"
  description="A step-by-step guide to safely assessing storm damage."
  image="https://example.com/images/roof-inspection.webp"
  totalTime="PT30M"
  estimatedCost={{ currency: "USD", value: "0" }}
  steps={[
    { name: "Stay Safe", text: "Do not climb on a wet or damaged roof." },
    {
      name: "Check from Ground",
      text: "Use binoculars to spot missing shingles.",
    },
    {
      name: "Document Damage",
      text: "Photograph all visible damage for your insurance claim.",
      image: "https://example.com/images/document.webp",
    },
  ]}
/>
```

---

### `JsonLdEvent` — Events

```tsx
<JsonLdEvent
  name="Free Roof Inspection Day"
  startDate="2026-05-10T09:00:00-05:00"
  endDate="2026-05-10T17:00:00-05:00"
  eventAttendanceMode="https://schema.org/OfflineEventAttendanceMode"
  eventStatus="https://schema.org/EventScheduled"
  description="Free roof inspections for homeowners in the Birmingham area."
  image={["https://example.com/images/event.webp"]}
  location={{
    type: "Place",
    name: "Patriot Roofing HQ",
    address: {
      streetAddress: "123 Main St",
      addressLocality: "Birmingham",
      addressRegion: "AL",
      postalCode: "35209",
      addressCountry: "US",
    },
  }}
  offers={{
    url: "https://example.com/events/inspection-day/",
    price: 0,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    validFrom: "2026-04-01",
  }}
  organizer={{ name: "My Company", url: "https://example.com/" }}
/>
```

---

### `JsonLdRecipe` — Recipes

```tsx
<JsonLdRecipe
  name="Classic Banana Bread"
  image={["https://example.com/images/banana-bread.webp"]}
  author="Jane Doe"
  datePublished="2024-01-15"
  description="Moist and delicious banana bread."
  prepTime="PT15M"
  cookTime="PT60M"
  totalTime="PT75M"
  recipeYield="1 loaf"
  recipeCategory="Bread"
  recipeCuisine="American"
  keywords="banana bread, easy baking"
  calories="250 calories"
  recipeIngredient={[
    "3 ripe bananas",
    "1/3 cup melted butter",
    "3/4 cup sugar",
  ]}
  recipeInstructions={[
    { name: "Preheat", text: "Preheat oven to 350°F." },
    { name: "Mix", text: "Mash bananas and mix with butter." },
    { name: "Bake", text: "Pour into loaf pan and bake 60 minutes." },
  ]}
  aggregateRating={{ ratingValue: 4.9, reviewCount: 204 }}
  video={{
    name: "Banana Bread Tutorial",
    description: "Watch how to make this recipe.",
    thumbnailUrl: ["https://example.com/images/video-thumb.webp"],
    uploadDate: "2024-01-15",
    contentUrl: "https://example.com/videos/banana-bread.mp4",
    duration: "PT5M",
  }}
/>
```

---

### `JsonLdSoftwareApplication`

```tsx
<JsonLdSoftwareApplication
  name="My Roofing App"
  operatingSystem="iOS, Android"
  applicationCategory="BusinessApplication"
  offers={{ price: 0, priceCurrency: "USD" }}
  aggregateRating={{ ratingValue: 4.7, ratingCount: 1200 }}
/>
```

---

### `JsonLdCourse`

```tsx
<JsonLdCourse
  name="Roofing Basics for Homeowners"
  description="Learn how to identify common roofing problems and when to call a pro."
  provider={{ name: "My Company", url: "https://example.com/" }}
/>
```

---

### `JsonLdJobPosting`

```tsx
<JsonLdJobPosting
  title="Roofing Installer"
  description="Join our crew as a full-time roofing installer in the Birmingham area."
  datePosted="2026-01-01"
  validThrough="2026-06-30"
  employmentType="FULL_TIME"
  hiringOrganization={{
    name: "My Company",
    url: "https://example.com/",
    logo: "https://example.com/logo.png",
  }}
  jobLocation={{
    streetAddress: "123 Main St",
    addressLocality: "Birmingham",
    addressRegion: "AL",
    postalCode: "35209",
    addressCountry: "US",
  }}
  baseSalary={{
    currency: "USD",
    value: { minValue: 22, maxValue: 35, unitText: "HOUR" },
  }}
/>
```

---

### `JsonLdCustom` — Escape hatch

```tsx
<JsonLdCustom
  data={{
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "My Shop",
    url: "https://example.com/",
  }}
/>
```

---

## Pure Generator Functions (`generators.ts`)

Use these directly when you need full control over `@graph` composition in a Server Component, or when you want to assemble a custom graph from individual nodes.

---

### `generateOrganizationSchema(profile)`

Returns `[brandNode, localBusinessNode]`. The brand node is typed `Organization`; the local business node is typed by `profile.businessType`. Used internally by `JsonLdOrganization`.

```ts
const [brandSchema, localBusinessSchema] =
  generateOrganizationSchema(myProfile);
```

---

### `generateWebSiteSchema(url, name, description?, organizationId?, searchUrlTemplate?)`

Returns a `WebSite` node. If `searchUrlTemplate` is provided, a `SearchAction` is added.

```ts
const websiteSchema = generateWebSiteSchema(
  "https://example.com",
  "My Company",
  "Expert roofing services.",
  "https://example.com/#brand",
  "https://example.com/search?q={search_term_string}",
);
```

| Param               | Type      | Description                     |
| ------------------- | --------- | ------------------------------- |
| `url`               | `string`  | Canonical site origin           |
| `name`              | `string`  | Site name                       |
| `description`       | `string?` | Site description                |
| `organizationId`    | `string?` | `@id` of the publisher node     |
| `searchUrlTemplate` | `string?` | URL template for `SearchAction` |

---

### `generateWebPageSchema(options)`

Returns a `WebPage` node. Use `pageType` to emit `AboutPage`, `ContactPage`, `CollectionPage`, etc.

```ts
const webPage = generateWebPageSchema({
  pageUrl: "https://example.com/about/",
  pageType: "AboutPage", // defaults to "WebPage"
  title: "About Us",
  description: "Learn about our team.",
  websiteId: "https://example.com/#website",
  breadcrumbId: "https://example.com/about/#breadcrumb",
  mainEntityId: "https://example.com/#organization",
  aboutId: "https://example.com/#brand",
  imageUrl: "https://example.com/images/team.webp",
});
```

| Option         | Type      | Description                                          |
| -------------- | --------- | ---------------------------------------------------- |
| `pageUrl`      | `string`  | Canonical page URL (also used as `@id` base)         |
| `pageType`     | `string?` | Schema.org `@type`. Defaults to `"WebPage"`          |
| `title`        | `string`  | Page `name`                                          |
| `description`  | `string`  | Page `description`                                   |
| `websiteId`    | `string`  | `@id` of the parent `WebSite` node                   |
| `breadcrumbId` | `string?` | `@id` of the associated `BreadcrumbList`             |
| `mainEntityId` | `string?` | Override `mainEntity`. Defaults to `organizationId`. |
| `aboutId`      | `string?` | Override `about`. Defaults to `organizationId`.      |
| `imageUrl`     | `string?` | `primaryImageOfPage` URL                             |

---

### `generateBreadcrumbSchema(id, items)`

Returns a `BreadcrumbList` node.

```ts
const breadcrumb = generateBreadcrumbSchema(
  "https://example.com/about/#breadcrumb",
  [
    { name: "Home", item: "https://example.com/" },
    { name: "About", item: "https://example.com/about/" },
  ],
);
```

| Param   | Type               | Description                                        |
| ------- | ------------------ | -------------------------------------------------- |
| `id`    | `string`           | `@id` for this breadcrumb node                     |
| `items` | `BreadcrumbItem[]` | `{ name: string; item: string }[]` — ordered trail |

---

### `generateFaqSchema(questions, pageUrl, publisherId?)`

Returns a `FAQPage` node. If `publisherId` is provided, a `publisher` reference is added (should be `#brand`).

```ts
const faq = generateFaqSchema(
  [{ question: "Are you licensed?", answer: "Yes, licensed in Alabama." }],
  "https://example.com/faq/",
  "https://example.com/#brand",
);
```

---

### `generateServiceGraphNode(options)`

Returns a standalone `Service` node with an optional `OfferCatalog` and `ServiceChannel`. Used internally by the service page graph generators.

```ts
const serviceNode = generateServiceGraphNode({
  id: "https://example.com/roof-repair/#service",
  url: "https://example.com/roof-repair/",
  name: "Roof Repair",
  description: "Expert leak detection and repair.",
  serviceType: "RoofingService",
  providerId: "https://example.com/#organization",
  areaServed: [{ name: "Birmingham", region: "AL" }],
  offerCatalogName: "Repair Services",
  offerItems: [
    { name: "Shingle Repair", url: "https://example.com/shingle-repair/" },
    "Flashing Repair",
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 87 },
});
```

| Option             | Type                             | Description                                       |
| ------------------ | -------------------------------- | ------------------------------------------------- |
| `id`               | `string`                         | `@id` for this service node                       |
| `url`              | `string`                         | Canonical URL of the service page                 |
| `name`             | `string`                         | Service name                                      |
| `description`      | `string`                         | Service description                               |
| `serviceType`      | `string?`                        | Schema.org service type (e.g. `"RoofingService"`) |
| `category`         | `string?`                        | Broad category (e.g. `"Home Services"`)           |
| `providerId`       | `string?`                        | `@id` of the providing org/local business         |
| `areaServed`       | `{ name, region?, country? }[]?` | Geographic coverage                               |
| `offerCatalogName` | `string?`                        | Name for the `OfferCatalog`                       |
| `offerItems`       | `(string \| { name, url? })[]?`  | Individual offers — strings or objects            |
| `aggregateRating`  | `AggregateRating?`               | Star rating data                                  |
| `imageUrl`         | `string?`                        | Service image                                     |

---

### Leaf schema generators

These accept a typed props object (matching the interfaces in `types.ts`) and return a single schema node. They are used internally by the corresponding React components but can be called directly when building custom graphs.

| Function                                   | Input type                       | Output `@type`               |
| ------------------------------------------ | -------------------------------- | ---------------------------- |
| `generateArticleSchema(props)`             | `ArticleSchemaProps`             | `Article` (or `BlogPosting`) |
| `generateProductSchema(props)`             | `ProductSchemaProps`             | `Product`                    |
| `generateSoftwareApplicationSchema(props)` | `SoftwareApplicationSchemaProps` | `SoftwareApplication`        |
| `generateHowToSchema(props)`               | `HowToSchemaProps`               | `HowTo`                      |
| `generateEventSchema(props)`               | `EventSchemaProps`               | `Event`                      |
| `generateRecipeSchema(props)`              | `RecipeSchemaProps`              | `Recipe`                     |
| `generateCourseSchema(props)`              | `CourseSchemaProps`              | `Course`                     |
| `generateJobPostingSchema(props)`          | `JobPostingSchemaProps`          | `JobPosting`                 |

Example — building a custom graph with `generateArticleSchema` directly:

```ts
import { generateArticleSchema } from "@/lib/jsonld/generators";
import { JsonLdCustom } from "@/lib/jsonld/JsonLd";

const articleNode = generateArticleSchema({
  headline: "5 Signs You Need a New Roof",
  url: "https://example.com/blog/signs/",
  image: ["https://example.com/images/roof.webp"],
  datePublished: "2025-03-15",
  authorName: "Justin Smith",
  authorUrl: "https://example.com/about/#justin",
  publisherName: "My Company",
  publisherLogo: "https://example.com/logo.png",
});

<JsonLdCustom
  data={{
    "@context": "https://schema.org",
    "@graph": [articleNode, breadcrumbNode],
  }}
/>
```

---

### Composite page graph generators

These are the highest-level helpers. Each one calls `generateStandardPageGraph` internally and adds one or more domain-specific nodes on top. All return `{ graphItems, ...individualSchemas }` — pass `graphItems` to `JsonLdOrganization` or `JsonLdCustom`.

| Generator                               | Nodes produced                                                           |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `generateStandardPageGraph(options)`    | `WebPage` + `BreadcrumbList` + optional `FAQPage`                        |
| `generateServicePageGraph(options)`     | Standard + `Service` + `ServiceChannel`                                  |
| `generateCityHubGraph(options)`         | Standard + `Service` (two nested `OfferCatalog`s) + city `LocalBusiness` |
| `generateCityServicePageGraph(options)` | Standard + `Service` + city `LocalBusiness`                              |
| `generateCollectionPageGraph(options)`  | `CollectionPage` + `BreadcrumbList` + `ImageObject[]`                    |
| `generateProjectPageGraph(options)`     | Standard + `CreativeWork` + `ImageObject[]`                              |
| `generateBlogHubGraph(options)`         | Standard + `Blog`                                                        |
| `generateArticlePageGraph(options)`     | Standard + `Article`                                                     |
| `generateImageGalleryGraph(options)`    | `ImageGallery` + `ImageObject[]` (standalone, not page-level)            |

### `generateStandardPageGraph` — options reference

All composite generators accept these base options plus their own additions.

| Option            | Type               | Description                                                                                      |
| ----------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| `pageUrl`         | `string`           | Canonical page URL                                                                               |
| `pageType`        | `string?`          | Schema.org `@type`. Defaults to `"WebPage"`                                                      |
| `title`           | `string`           | Page `name`                                                                                      |
| `description`     | `string`           | Page `description`                                                                               |
| `websiteId`       | `string`           | `@id` of the `WebSite` node                                                                      |
| `organizationId`  | `string`           | `@id` of the local business / org node                                                           |
| `brandId`         | `string?`          | `@id` of the parent brand. Used as `publisher` on FAQ/Blog. Derived from `websiteId` if omitted. |
| `aboutId`         | `string?`          | Override `about` on the `WebPage`. Defaults to `organizationId`.                                 |
| `mainEntityId`    | `string?`          | Override `mainEntity`. Defaults to `organizationId`.                                             |
| `imageUrl`        | `string?`          | `primaryImageOfPage` URL                                                                         |
| `breadcrumbItems` | `BreadcrumbItem[]` | Breadcrumb trail                                                                                 |
| `faqQuestions`    | `FAQItem[]?`       | Generates a `FAQPage` node linked via `hasPart`                                                  |

---

## Graph ID Conventions

| Node                 | `@id` pattern                                | Notes                                               |
| -------------------- | -------------------------------------------- | --------------------------------------------------- |
| Brand Organization   | `{url}/#brand`                               | Parent org, used as `publisher` on FAQ/Blog/Article |
| Local Business       | `{url}/#organization`                        | The service-providing entity                        |
| WebSite              | `{url}/#website`                             | `publisher` → `#brand`                              |
| City LocalBusiness   | `{url}/areas-we-serve/{slug}/#localbusiness` | `parentOrganization` → `#organization`              |
| WebPage              | `{pageUrl}#webpage`                          |                                                     |
| BreadcrumbList       | `{pageUrl}#breadcrumb`                       |                                                     |
| FAQPage              | `{pageUrl}#faq`                              |                                                     |
| Service              | `{pageUrl}#service`                          |                                                     |
| Article              | `{pageUrl}#article`                          |                                                     |
| Blog                 | `{pageUrl}#blog`                             |                                                     |
| Project/CreativeWork | `{pageUrl}#project`                          |                                                     |
| ImageGallery         | `{pageUrl}#gallery`                          |                                                     |
| Person               | `{personBaseUrl}#${member.id}`               | Anchors to HTML `id` attribute on the about page    |

---

## Best Practices

1. **Absolute URLs** — Always use `https://...` for `url`, `logoUrl`, and all `@id` values.
2. **Stable IDs** — Use the anchor patterns above consistently so Google can merge nodes across pages.
3. **Brand vs. LocalBusiness** — FAQ, Blog, and Article nodes should use `#brand` as `publisher`. Service and city nodes should use `#organization` or `#localbusiness` as `provider`.
4. **`brandId` propagation** — Pass `brandId` (or `websiteId`) into `generateStandardPageGraph` so FAQ/Blog publisher is set correctly without hardcoding.
5. **`includeGlobalSignals: false`** — Set this on spoke pages (service, city, blog) to avoid bloating the schema with org-level signals that belong only on the homepage.
6. **Central config** — Define `SiteInfo` and `LocalBusinessConfig` in `src/lib/content.ts` and import them into page components. Never hardcode URLs or business details inside generators.
7. **`siteInfo` on image generators** — Always pass `siteInfo` to `generateCollectionPageGraph`, `generateProjectPageGraph`, and `generateImageGalleryGraph` so `ImageObject` nodes include proper `license`, `acquireLicensePage`, `copyrightNotice`, and `creditText`.

---

## Validation Workflow

1. View page source and copy the `<script type="application/ld+json">` block.
2. Validate at:
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Schema Markup Validator](https://validator.schema.org/)
3. Confirm the `#brand`, `#organization`, and city `#localbusiness` nodes are correctly interconnected via `parentOrganization`.
4. Confirm `FAQPage` and `Blog` nodes reference `#brand` (not `#organization`) as `publisher`.
