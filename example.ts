// =============================================================================
// JSON-LD Toolkit — Exhaustive Usage Examples
//
// Demonstrates every generator function and React component in the toolkit.
// Nothing here is imported by the app at runtime — it is documentation only.
// =============================================================================

import type {
  LocalBusinessConfig,
  OrganizationProfile,
  SiteInfo,
} from "./types";

// =============================================================================
// 1. SITE-LEVEL CONFIGURATION — define once in src/lib/content.ts
// =============================================================================

export const demoSiteInfo: SiteInfo = {
  url: "https://marioplumbing.example.com",
  legalName: "Mario Plumbing LLC",
  contactPagePath: "/contact/",
};

export const demoLocalBusinessConfig: LocalBusinessConfig = {
  businessType: "Plumber",
  legalName: "Mario Plumbing LLC",
  baseUrl: "https://marioplumbing.example.com",
  cityPageBasePath: "/areas-we-serve/",
  phone: "+1-555-0198",
  imageUrl: "https://marioplumbing.example.com/images/og-image.webp",
  address: {
    streetAddress: "123 Pipe Way",
    addressLocality: "Brooklyn",
    addressRegion: "NY",
    postalCode: "11201",
    addressCountry: "US",
  },
  openingHours: [
    {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    { dayOfWeek: ["Saturday"], opens: "09:00", closes: "14:00" },
  ],
  stateName: "New York",
  priceRange: "$$",
  credentials: [
    {
      name: "Licensed Master Plumber",
      recognizedBy: "State of New York",
      recognizedByType: "GovernmentOrganization",
    },
    {
      name: "EPA WaterSense Partner",
      recognizedBy: "U.S. Environmental Protection Agency",
      recognizedByType: "GovernmentOrganization",
    },
  ],
};

// =============================================================================
// 2. ORGANIZATION PROFILE — used by JsonLdOrganization
// =============================================================================

export const demoProfile: OrganizationProfile = {
  name: "Mario's Pipes & Drains",
  legalName: "Mario Plumbing LLC",
  url: "https://marioplumbing.example.com",
  personBasePath: "/about/",
  logoUrl: "https://marioplumbing.example.com/logo.png",
  imageUrl: "https://marioplumbing.example.com/images/og-image.webp",
  description: "Top-rated emergency plumbers serving Brooklyn and Queens.",
  searchUrlTemplate:
    "https://marioplumbing.example.com/search?q={search_term_string}",
  businessType: "Plumber",
  contact: {
    telephone: "+1-555-0198",
    contactType: "customer service",
    email: "help@marioplumbing.example.com",
    address: {
      streetAddress: "123 Pipe Way",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      postalCode: "11201",
      addressCountry: "US",
    },
    geo: { latitude: 40.6782, longitude: -73.9442 },
  },
  socialLinks: [
    "https://facebook.com/marioplumbing",
    "https://instagram.com/marioplumbing",
    "https://linkedin.com/company/marioplumbing",
  ],
  priceRange: "$$",
  hasMap: "https://maps.google.com/?cid=123456789",
  openingHours: [
    {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    { dayOfWeek: ["Saturday"], opens: "09:00", closes: "14:00" },
  ],
  credentials: [
    {
      name: "Licensed Master Plumber",
      recognizedBy: "State of New York",
      recognizedByType: "GovernmentOrganization",
    },
  ],
  memberOf: [
    {
      name: "Plumbing-Heating-Cooling Contractors Association",
      url: "https://www.phccweb.org/",
      type: "Organization",
    },
  ],
  founders: [
    {
      id: "mario",
      name: "Mario Rossi",
      jobTitle: "Founder & Master Plumber",
      sameAs: ["https://linkedin.com/in/mario-rossi"],
    },
  ],
  employees: [{ id: "luigi", name: "Luigi Rossi", jobTitle: "Lead Plumber" }],
  aggregateRating: {
    ratingValue: 4.9,
    reviewCount: 214,
    bestRating: 5,
    worstRating: 1,
  },
  reviews: [
    {
      author: "Sarah K.",
      datePublished: "2025-01-10",
      reviewBody: "Fixed our burst pipe at 2am. Lifesavers.",
      ratingValue: 5,
      publisher: "Google",
    },
    {
      author: "Tom B.",
      datePublished: "2025-02-20",
      ratingValue: 5,
      publisher: "Yelp",
    },
  ],
};

// =============================================================================
// 3. REACT COMPONENT EXAMPLES
// =============================================================================

/*
──────────────────────────────────────────────────────────────────────────────
3a. JsonLdOrganization — Root layout.tsx
    Builds: Brand Organization (#brand) + Local Business (#organization) + WebSite
──────────────────────────────────────────────────────────────────────────────

import { JsonLdOrganization } from "@/lib/jsonld/JsonLd";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JsonLdOrganization
          profile={demoProfile}
          knowsAbout={["Emergency Pipe Repair", "Water Heater Installation", "Drain Cleaning"]}
          areaServed={[
            { name: "Brooklyn", region: "NY", country: "US" },
            { name: "Queens", region: "NY" },
          ]}
          offers={[
            { name: "Emergency Pipe Repair", url: "https://marioplumbing.example.com/emergency/" },
            { name: "Drain Cleaning", url: "https://marioplumbing.example.com/drain-cleaning/" },
            { name: "Water Heater Installation", url: "https://marioplumbing.example.com/water-heaters/", description: "Same-day replacement" },
          ]}
          offerCatalogName="Plumbing Services"
          includeGlobalSignals={true}
        />
        {children}
      </body>
    </html>
  );
}


──────────────────────────────────────────────────────────────────────────────
3b. JsonLdOrganization — About page with standalone Person nodes
    Person @ids match HTML anchor fragments (id="mario") on the about page.
    Pass includeGlobalSignals={false} on spoke pages to avoid bloating schema.
──────────────────────────────────────────────────────────────────────────────

import { JsonLdOrganization } from "@/lib/jsonld/JsonLd";
import { generateStandardPageGraph } from "@/lib/jsonld/generators";

const pageUrl = "https://marioplumbing.example.com/about/";

const { graphItems: baseGraphItems } = generateStandardPageGraph({
  pageUrl,
  pageType: "AboutPage",
  title: "About Mario's Pipes & Drains",
  description: "Meet the team behind Brooklyn's top-rated plumbing company.",
  websiteId: "https://marioplumbing.example.com/#website",
  organizationId: "https://marioplumbing.example.com/#organization",
  brandId: "https://marioplumbing.example.com/#brand",
  aboutId: "https://marioplumbing.example.com/#brand",
  breadcrumbItems: [
    { name: "Home", item: "https://marioplumbing.example.com/" },
    { name: "About", item: pageUrl },
  ],
});

const personNodes = (demoProfile.founders ?? []).map((member) => ({
  "@type": "Person",
  "@id": `${pageUrl}#${member.id}`,
  name: member.name,
  jobTitle: member.jobTitle,
  url: pageUrl,
  worksFor: { "@id": "https://marioplumbing.example.com/#brand" },
  ...(member.sameAs ? { sameAs: member.sameAs } : {}),
}));

<JsonLdOrganization
  profile={demoProfile}
  graphItems={[...baseGraphItems, ...personNodes]}
  includeGlobalSignals={false}
/>


──────────────────────────────────────────────────────────────────────────────
3c. JsonLdService — Standalone service landing page
    Builds: WebPage + BreadcrumbList + Service + optional FAQPage
──────────────────────────────────────────────────────────────────────────────

import { JsonLdService } from "@/lib/jsonld/JsonLd";

<JsonLdService
  pageUrl="https://marioplumbing.example.com/drain-cleaning/"
  title="Drain Cleaning Services in Brooklyn"
  description="Professional drain cleaning and hydro-jetting."
  serviceName="Drain Cleaning"
  serviceDescription="We clear clogged drains fast using hydro-jetting and snaking."
  serviceType="PlumbingService"
  category="Home Services"
  offerCatalogName="Drain Services"
  offerItems={[
    { name: "Hydro-Jetting", url: "https://marioplumbing.example.com/drain-cleaning/hydro-jetting/" },
    "Drain Snaking",
    "Sewer Camera Inspection",
  ]}
  areaServed={[{ name: "Brooklyn", region: "NY" }, { name: "Queens", region: "NY" }]}
  aggregateRating={{ ratingValue: 4.9, reviewCount: 87 }}
  imageUrl="https://marioplumbing.example.com/images/drain-cleaning.webp"
  websiteId="https://marioplumbing.example.com/#website"
  organizationId="https://marioplumbing.example.com/#organization"
  breadcrumbItems={[
    { name: "Home", item: "https://marioplumbing.example.com/" },
    { name: "Services", item: "https://marioplumbing.example.com/services/" },
    { name: "Drain Cleaning", item: "https://marioplumbing.example.com/drain-cleaning/" },
  ]}
  faqQuestions={[
    { question: "How long does drain cleaning take?", answer: "Most jobs take 30–90 minutes." },
    { question: "Do you offer same-day service?", answer: "Yes, same-day in Brooklyn and Queens." },
  ]}
/>


──────────────────────────────────────────────────────────────────────────────
3d. generateCityHubGraph — City hub page (pure generator)
    Builds: WebPage + BreadcrumbList + Service (nested catalogs) + LocalBusiness
    serviceCategories array maps to the OfferCatalog categories.
──────────────────────────────────────────────────────────────────────────────

import { generateCityHubGraph } from "@/lib/jsonld/generators";
import { JsonLdOrganization } from "@/lib/jsonld/JsonLd";

const { graphItems } = generateCityHubGraph({
  pageUrl: "https://marioplumbing.example.com/areas-we-serve/brooklyn/",
  title: "Plumbing Services in Brooklyn, NY",
  description: "Expert plumbing services for Brooklyn homeowners.",
  city: { slug: "brooklyn", name: "Brooklyn", lat: 40.6782, lng: -73.9442 },
  serviceCategories: [
    {
      categoryName: "Indoor Plumbing",
      services: [
        { slug: "drain-cleaning", name: "Drain Cleaning" },
        { slug: "pipe-repair", name: "Pipe Repair" },
      ],
    },
    {
      categoryName: "Outdoor Plumbing",
      services: [
        { slug: "emergency-plumbing", name: "Emergency Plumbing" },
        { slug: "water-heaters", name: "Water Heater Installation" },
      ],
    },
  ],
  hubProviderName: "Plumbing Services in Brooklyn",
  hubProviderType: "Plumber",
  localBusinessConfig: demoLocalBusinessConfig,
  websiteId: "https://marioplumbing.example.com/#website",
  organizationId: "https://marioplumbing.example.com/#organization",
  brandId: "https://marioplumbing.example.com/#brand",
  breadcrumbItems: [
    { name: "Home", item: "https://marioplumbing.example.com/" },
    { name: "Areas We Serve", item: "https://marioplumbing.example.com/areas-we-serve/" },
    { name: "Brooklyn", item: "https://marioplumbing.example.com/areas-we-serve/brooklyn/" },
  ],
});

<JsonLdOrganization profile={demoProfile} graphItems={graphItems} includeGlobalSignals={false} />


──────────────────────────────────────────────────────────────────────────────
3e. generateCityServicePageGraph — City + service page (pure generator)
    Builds: WebPage + BreadcrumbList + Service + city LocalBusiness
    Service.provider and WebPage.about both point to the city #localbusiness node.
──────────────────────────────────────────────────────────────────────────────

import { generateCityServicePageGraph } from "@/lib/jsonld/generators";

const { graphItems } = generateCityServicePageGraph({
  pageUrl: "https://marioplumbing.example.com/areas-we-serve/brooklyn/drain-cleaning/",
  title: "Drain Cleaning in Brooklyn, NY",
  description: "Fast, professional drain cleaning in Brooklyn.",
  serviceName: "Drain Cleaning in Brooklyn",
  serviceDescription: "We clear clogged drains fast using hydro-jetting and snaking.",
  serviceType: "PlumbingService",
  offerCatalogName: "Drain Services",
  offerItems: ["Hydro-Jetting", "Drain Snaking", "Sewer Camera Inspection"],
  service: { slug: "drain-cleaning", name: "Drain Cleaning" },
  city: { slug: "brooklyn", name: "Brooklyn", lat: 40.6782, lng: -73.9442 },
  localBusinessConfig: demoLocalBusinessConfig,
  aggregateRating: { ratingValue: 4.9, reviewCount: 52 },
  websiteId: "https://marioplumbing.example.com/#website",
  organizationId: "https://marioplumbing.example.com/#organization",
  brandId: "https://marioplumbing.example.com/#brand",
  breadcrumbItems: [
    { name: "Home", item: "https://marioplumbing.example.com/" },
    { name: "Brooklyn", item: "https://marioplumbing.example.com/areas-we-serve/brooklyn/" },
    { name: "Drain Cleaning", item: "https://marioplumbing.example.com/areas-we-serve/brooklyn/drain-cleaning/" },
  ],
  faqQuestions: [
    { question: "Do you serve all of Brooklyn?", answer: "Yes, we cover all Brooklyn neighborhoods." },
  ],
});


──────────────────────────────────────────────────────────────────────────────
3f. generateCollectionPageGraph — Portfolio index page (pure generator)
    Builds: CollectionPage + BreadcrumbList + ImageObject[] (license/copyright)
──────────────────────────────────────────────────────────────────────────────

import { generateCollectionPageGraph } from "@/lib/jsonld/generators";

const { graphItems } = generateCollectionPageGraph({
  pageUrl: "https://marioplumbing.example.com/projects/",
  title: "Our Project Gallery",
  description: "Browse completed plumbing projects across Brooklyn and Queens.",
  siteInfo: demoSiteInfo,
  organizationId: "https://marioplumbing.example.com/#organization",
  websiteId: "https://marioplumbing.example.com/#website",
  images: [
    {
      id: "https://marioplumbing.example.com/projects/#img-1",
      url: "https://marioplumbing.example.com/images/project-pipe-repair.webp",
      name: "Pipe Repair in Park Slope",
      caption: "Full copper re-pipe for a 1920s brownstone.",
      locationName: "Park Slope, Brooklyn",
    },
  ],
  items: [
    { url: "https://marioplumbing.example.com/projects/park-slope-pipe-repair/", name: "Park Slope Pipe Repair" },
  ],
  breadcrumbItems: [
    { name: "Home", item: "https://marioplumbing.example.com/" },
    { name: "Projects", item: "https://marioplumbing.example.com/projects/" },
  ],
});


──────────────────────────────────────────────────────────────────────────────
3g. generateProjectPageGraph — Individual project detail page (pure generator)
    Builds: WebPage + BreadcrumbList + CreativeWork + ImageObject[]
    CreativeWork includes locationCreated, creator (E-E-A-T), and optional review.
──────────────────────────────────────────────────────────────────────────────

import { generateProjectPageGraph } from "@/lib/jsonld/generators";

const { graphItems } = generateProjectPageGraph({
  pageUrl: "https://marioplumbing.example.com/projects/park-slope-pipe-repair/",
  title: "Full Copper Re-Pipe — Park Slope Brownstone",
  description: "Complete copper re-pipe for a 1920s Park Slope brownstone.",
  projectName: "Park Slope Copper Re-Pipe",
  projectDescription: "We replaced all original galvanized pipes with modern copper throughout a 3-story brownstone.",
  siteInfo: demoSiteInfo,
  organizationId: "https://marioplumbing.example.com/#organization",
  websiteId: "https://marioplumbing.example.com/#website",
  datePublished: "2025-06-10",
  locationCreated: { name: "Park Slope, Brooklyn", latitude: 40.6726, longitude: -73.9774 },
  aboutServiceIds: ["https://marioplumbing.example.com/pipe-repair/#service"],
  images: [
    {
      id: "https://marioplumbing.example.com/projects/park-slope-pipe-repair/#img-0",
      url: "https://marioplumbing.example.com/images/park-slope-before.webp",
      name: "Before: Corroded Galvanized Pipes",
      caption: "Original galvanized pipes showing heavy corrosion.",
      locationName: "Park Slope, Brooklyn",
    },
    {
      id: "https://marioplumbing.example.com/projects/park-slope-pipe-repair/#img-1",
      url: "https://marioplumbing.example.com/images/park-slope-after.webp",
      name: "After: New Copper Plumbing",
      caption: "Completed copper re-pipe with full pressure test.",
      locationName: "Park Slope, Brooklyn",
    },
  ],
  review: {
    authorName: "David L.",
    ratingValue: 5,
    bestRating: 5,
    reviewBody: "Mario's team finished a 3-day job in 2 days. Spotless work.",
  },
  breadcrumbItems: [
    { name: "Home", item: "https://marioplumbing.example.com/" },
    { name: "Projects", item: "https://marioplumbing.example.com/projects/" },
    { name: "Park Slope Re-Pipe", item: "https://marioplumbing.example.com/projects/park-slope-pipe-repair/" },
  ],
});


──────────────────────────────────────────────────────────────────────────────
3h. generateBlogHubGraph — Blog index page (pure generator)
    Builds: WebPage + BreadcrumbList + Blog
    Blog.publisher → #brand (not #organization)
──────────────────────────────────────────────────────────────────────────────

import { generateBlogHubGraph } from "@/lib/jsonld/generators";

const { graphItems } = generateBlogHubGraph({
  pageUrl: "https://marioplumbing.example.com/blog/",
  title: "Plumbing Tips & Advice | Mario's Pipes & Drains",
  description: "Expert plumbing advice for Brooklyn and Queens homeowners.",
  blogName: "Mario's Plumbing Blog",
  blogDescription: "Tips, guides, and news from Brooklyn's top-rated plumbers.",
  websiteId: "https://marioplumbing.example.com/#website",
  organizationId: "https://marioplumbing.example.com/#organization",
  brandId: "https://marioplumbing.example.com/#brand",
  breadcrumbItems: [
    { name: "Home", item: "https://marioplumbing.example.com/" },
    { name: "Blog", item: "https://marioplumbing.example.com/blog/" },
  ],
  blogPosts: [
    {
      headline: "How to Unclog a Drain Safely",
      url: "https://marioplumbing.example.com/blog/how-to-unclog-drain/",
    },
    {
      headline: "signs You Need a New Water Heater",
      url: "https://marioplumbing.example.com/blog/water-heater-signs/",
    },
  ],
});


──────────────────────────────────────────────────────────────────────────────
3i. generateArticlePageGraph — Blog post page (pure generator)
    Builds: WebPage + BreadcrumbList + Article (or BlogPosting)
    Article.author.worksFor → #brand; Article.publisher → #organization
──────────────────────────────────────────────────────────────────────────────

import { generateArticlePageGraph } from "@/lib/jsonld/generators";

const { graphItems } = generateArticlePageGraph({
  pageUrl: "https://marioplumbing.example.com/blog/signs-you-need-new-water-heater/",
  title: "7 Signs You Need a New Water Heater",
  description: "Learn the warning signs that your water heater is failing.",
  headline: "7 Signs You Need a New Water Heater",
  articleType: "BlogPosting",
  datePublished: "2025-04-01",
  dateModified: "2025-04-15",
  authorName: "Mario Rossi",
  authorUrl: "https://marioplumbing.example.com/about/#mario",
  authorId: "https://marioplumbing.example.com/about/#mario",
  authorJobTitle: "Founder & Master Plumber",
  imageUrl: "https://marioplumbing.example.com/images/water-heater-signs.webp",
  websiteId: "https://marioplumbing.example.com/#website",
  organizationId: "https://marioplumbing.example.com/#organization",
  brandId: "https://marioplumbing.example.com/#brand",
  breadcrumbItems: [
    { name: "Home", item: "https://marioplumbing.example.com/" },
    { name: "Blog", item: "https://marioplumbing.example.com/blog/" },
    { name: "7 Signs You Need a New Water Heater", item: "https://marioplumbing.example.com/blog/signs-you-need-new-water-heater/" },
  ],
  faqQuestions: [
    { question: "How long do water heaters last?", answer: "Most tank water heaters last 8–12 years." },
    { question: "Can I replace a water heater myself?", answer: "We recommend hiring a licensed plumber for safety and code compliance." },
  ],
});


──────────────────────────────────────────────────────────────────────────────
3j. JsonLdGallery — Project gallery component
    Renders ImageGallery + ImageObject[] with license/copyright/geo metadata.
    storage_path starting with "http" is used as-is; relative paths get siteInfo.url prepended.
──────────────────────────────────────────────────────────────────────────────

import { JsonLdGallery } from "@/lib/jsonld/JsonLd";

const projects: GalleryProject[] = [
  {
    id: "proj-1",
    title: "Park Slope Copper Re-Pipe",
    description: "Full copper re-pipe for a 1920s brownstone.",
    images: [{ storage_path: "/images/park-slope-after.webp", alt_text: "New copper plumbing in Park Slope" }],
    latitude: 40.6726,
    longitude: -73.9774,
    neighborhood_tag: "Park Slope",
    completion_date: "2025-06-10",
    city: { name: "Brooklyn" },
    service: { name: "Pipe Repair" },
  },
  {
    id: "proj-2",
    title: "Astoria Tankless Water Heater",
    description: "Same-day tankless water heater installation.",
    images: [
      { storage_path: "https://cdn.example.com/images/astoria-wh.webp", alt_text: "Tankless water heater in Astoria" },
      { storage_path: "/images/astoria-wh-2.webp", alt_text: "Installation detail" },
    ],
    latitude: 40.7721,
    longitude: -73.9302,
    completion_date: "2025-07-22",
    city: { name: "Queens" },
    services: [{ name: "Water Heater Installation" }, { name: "Emergency Plumbing" }],
  },
];

<JsonLdGallery
  projects={projects}
  pathname="/projects/"
  organizationId="https://marioplumbing.example.com/#organization"
  siteInfo={demoSiteInfo}
/>


──────────────────────────────────────────────────────────────────────────────
3k. JsonLdFAQ — Standalone FAQ page
──────────────────────────────────────────────────────────────────────────────

import { JsonLdFAQ } from "@/lib/jsonld/JsonLd";

const faqItems: FAQItem[] = [
  { question: "Do you offer free estimates?", answer: "Yes, all estimates are free with no obligation." },
  { question: "Are you licensed and insured?", answer: "Yes, fully licensed in New York with $2M liability insurance." },
  { question: "Do you offer emergency plumbing?", answer: "Yes, 24/7 emergency plumbing in Brooklyn and Queens." },
  { question: "How quickly can you respond?", answer: "We typically arrive within 60 minutes for emergencies." },
];

<JsonLdFAQ
  questions={faqItems}
  pageUrl="https://marioplumbing.example.com/faq/"
  publisherId="https://marioplumbing.example.com/#brand"
/>


──────────────────────────────────────────────────────────────────────────────
3l. JsonLdArticle — Blog post (standalone component, not graph-based)
──────────────────────────────────────────────────────────────────────────────

import { JsonLdArticle } from "@/lib/jsonld/JsonLd";

const articleProps: ArticleSchemaProps = {
  headline: "7 Signs You Need a New Water Heater",
  url: "https://marioplumbing.example.com/blog/signs-you-need-new-water-heater/",
  image: ["https://marioplumbing.example.com/images/water-heater-signs.webp"],
  datePublished: "2025-04-01",
  dateModified: "2025-04-15",
  authorName: "Mario Rossi",
  authorUrl: "https://marioplumbing.example.com/about/#mario",
  publisherName: "Mario's Pipes & Drains",
  publisherLogo: "https://marioplumbing.example.com/logo.png",
  description: "Learn the warning signs that your water heater is failing before it floods your home.",
};

<JsonLdArticle {...articleProps} />


──────────────────────────────────────────────────────────────────────────────
3m. JsonLdProduct — Product page
──────────────────────────────────────────────────────────────────────────────

import { JsonLdProduct } from "@/lib/jsonld/JsonLd";

const productProps: ProductSchemaProps = {
  name: "Rheem Performance Platinum Tankless Water Heater",
  image: ["https://marioplumbing.example.com/images/rheem-platinum.webp"],
  description: "ENERGY STAR certified tankless water heater with Wi-Fi connectivity.",
  sku: "RHEEM-ECOH200DVLN",
  mpn: "ECOH200DVLN",
  brand: "Rheem",
  offers: {
    price: 1299.99,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://marioplumbing.example.com/products/rheem-platinum/",
    priceValidUntil: "2026-12-31",
  },
  aggregateRating: { ratingValue: 4.8, reviewCount: 156 },
  reviews: [
    { author: "Jennifer M.", datePublished: "2025-03-10", ratingValue: 5, reviewBody: "Endless hot water and our gas bill dropped 30%.", publisher: "Google" },
  ],
};

<JsonLdProduct {...productProps} />


──────────────────────────────────────────────────────────────────────────────
3n. JsonLdHowTo — Step-by-step guide
──────────────────────────────────────────────────────────────────────────────

import { JsonLdHowTo } from "@/lib/jsonld/JsonLd";

const howToProps: HowToSchemaProps = {
  name: "How to Shut Off Your Home's Water Supply",
  description: "A step-by-step guide to shutting off water in an emergency.",
  image: "https://marioplumbing.example.com/images/shutoff-valve.webp",
  totalTime: "PT5M",
  estimatedCost: { currency: "USD", value: "0" },
  steps: [
    { name: "Locate the Main Shutoff", text: "Find the main water shutoff valve, usually near the water meter or where the main line enters the house." },
    { name: "Turn the Valve", text: "Turn clockwise (righty-tighty) until it stops. For ball valves, rotate 90 degrees." },
    { name: "Verify Water is Off", text: "Open a faucet to confirm no water flows.", url: "https://marioplumbing.example.com/emergency/" },
  ],
};

<JsonLdHowTo {...howToProps} />

──────────────────────────────────────────────────────────────────────────────
3o. JsonLdEvent — In-person or virtual event
──────────────────────────────────────────────────────────────────────────────

import { JsonLdEvent } from "@/lib/jsonld/JsonLd";

const eventProps: EventSchemaProps = {
  name: "Free Plumbing Inspection Day",
  startDate: "2026-05-10T09:00:00-05:00",
  endDate: "2026-05-10T17:00:00-05:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  description: "Free plumbing inspections for homeowners in the Brooklyn area.",
  image: ["https://marioplumbing.example.com/images/event.webp"],
  location: {
    type: "Place",
    name: "Mario Plumbing HQ",
    address: {
      streetAddress: "123 Pipe Way",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      postalCode: "11201",
      addressCountry: "US",
    },
  },
  offers: {
    url: "https://marioplumbing.example.com/events/inspection-day/",
    price: 0,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    validFrom: "2026-04-01",
  },
  organizer: { name: "Mario's Pipes & Drains", url: "https://marioplumbing.example.com/" },
};

<JsonLdEvent {...eventProps} />


──────────────────────────────────────────────────────────────────────────────
3p. JsonLdRecipe — Recipe content (food/lifestyle sites)
──────────────────────────────────────────────────────────────────────────────

import { JsonLdRecipe } from "@/lib/jsonld/JsonLd";

const recipeProps: RecipeSchemaProps = {
  name: "Classic Banana Bread",
  image: ["https://example.com/images/banana-bread.webp"],
  author: "Jane Doe",
  datePublished: "2024-01-15",
  description: "Moist and delicious banana bread.",
  prepTime: "PT15M",
  cookTime: "PT60M",
  totalTime: "PT75M",
  recipeYield: "1 loaf",
  recipeCategory: "Bread",
  recipeCuisine: "American",
  keywords: "banana bread, easy baking",
  calories: "250 calories",
  recipeIngredient: ["3 ripe bananas", "1/3 cup melted butter", "3/4 cup sugar"],
  recipeInstructions: [
    { name: "Preheat", text: "Preheat oven to 350°F." },
    { name: "Mix", text: "Mash bananas and mix with butter." },
    { name: "Bake", text: "Pour into loaf pan and bake 60 minutes." },
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 204 },
  video: {
    name: "Banana Bread Tutorial",
    description: "Watch how to make this recipe.",
    thumbnailUrl: ["https://example.com/images/video-thumb.webp"],
    uploadDate: "2024-01-15",
    contentUrl: "https://example.com/videos/banana-bread.mp4",
    duration: "PT5M",
  },
};

<JsonLdRecipe {...recipeProps} />


──────────────────────────────────────────────────────────────────────────────
3q. JsonLdSoftwareApplication — App store-style software listing
──────────────────────────────────────────────────────────────────────────────

import { JsonLdSoftwareApplication } from "@/lib/jsonld/JsonLd";

<JsonLdSoftwareApplication
  name="PlumbingPro Estimator"
  operatingSystem="iOS, Android, Web"
  applicationCategory="BusinessApplication"
  offers={{ price: 0, priceCurrency: "USD" }}
  aggregateRating={{ ratingValue: 4.7, ratingCount: 1200 }}
/>


──────────────────────────────────────────────────────────────────────────────
3r. JsonLdCourse — Online course page
──────────────────────────────────────────────────────────────────────────────

import { JsonLdCourse } from "@/lib/jsonld/JsonLd";

const courseProps: CourseSchemaProps = {
  name: "Plumbing Basics for Homeowners",
  description: "Learn how to identify common plumbing problems and when to call a pro.",
  provider: { name: "Mario's Pipes & Drains", url: "https://marioplumbing.example.com/" },
};

<JsonLdCourse {...courseProps} />


──────────────────────────────────────────────────────────────────────────────
3s. JsonLdJobPosting — Careers / jobs page
──────────────────────────────────────────────────────────────────────────────

import { JsonLdJobPosting } from "@/lib/jsonld/JsonLd";

const jobProps: JobPostingSchemaProps = {
  title: "Licensed Plumber",
  description: "Join our crew as a full-time licensed plumber in the Brooklyn area. Competitive pay, company van, and full benefits.",
  datePosted: "2026-01-01",
  validThrough: "2026-06-30",
  employmentType: "FULL_TIME",
  hiringOrganization: {
    name: "Mario's Pipes & Drains",
    url: "https://marioplumbing.example.com/",
    logo: "https://marioplumbing.example.com/logo.png",
  },
  jobLocation: {
    streetAddress: "123 Pipe Way",
    addressLocality: "Brooklyn",
    addressRegion: "NY",
    postalCode: "11201",
    addressCountry: "US",
  },
  baseSalary: {
    currency: "USD",
    value: { minValue: 28, maxValue: 45, unitText: "HOUR" },
  },
};

<JsonLdJobPosting {...jobProps} />


──────────────────────────────────────────────────────────────────────────────
3t. JsonLdCustom — Escape hatch for any schema not covered above
──────────────────────────────────────────────────────────────────────────────

import { JsonLdCustom } from "@/lib/jsonld/JsonLd";

// Raw node
<JsonLdCustom
  data={{
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Mario's Pipes & Drains",
    url: "https://marioplumbing.example.com/",
    telephone: "+1-555-0198",
  }}
/>

// Full @graph (when you need multiple nodes in one script tag)
<JsonLdCustom
  data={{
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://marioplumbing.example.com/#brand", name: "Mario Plumbing LLC" },
      { "@type": "WebSite", "@id": "https://marioplumbing.example.com/#website", url: "https://marioplumbing.example.com" },
    ],
  }}
/>


// =============================================================================
// 4. PURE GENERATOR FUNCTION EXAMPLES
//    Use these when you need full control over @graph composition.
// =============================================================================

──────────────────────────────────────────────────────────────────────────────
4a. generateOrganizationSchema — returns [brandNode, localBusinessNode]
──────────────────────────────────────────────────────────────────────────────

import { generateOrganizationSchema } from "@/lib/jsonld/generators";

const [brandSchema, localBusinessSchema] = generateOrganizationSchema(demoProfile);


──────────────────────────────────────────────────────────────────────────────
4b. generateWebSiteSchema — WebSite node with optional SearchAction
──────────────────────────────────────────────────────────────────────────────

import { generateWebSiteSchema } from "@/lib/jsonld/generators";

const websiteSchema = generateWebSiteSchema({
  url: "https://marioplumbing.example.com",
  name: "Mario's Pipes & Drains",
  description: "Top-rated emergency plumbers serving Brooklyn and Queens.",
  organizationId: "https://marioplumbing.example.com/#brand",
  searchUrlTemplate: "https://marioplumbing.example.com/search?q={search_term_string}",
});


──────────────────────────────────────────────────────────────────────────────
4c. generateWebPageSchema — WebPage node with optional pageType override
──────────────────────────────────────────────────────────────────────────────

import { generateWebPageSchema } from "@/lib/jsonld/generators";

const webPageSchema = generateWebPageSchema({
  pageUrl: "https://marioplumbing.example.com/about/",
  pageType: "AboutPage",
  title: "About Us",
  description: "Meet the team behind Brooklyn's top-rated plumbing company.",
  websiteId: "https://marioplumbing.example.com/#website",
  breadcrumbId: "https://marioplumbing.example.com/about/#breadcrumb",
  mainEntityId: "https://marioplumbing.example.com/#organization",
  aboutId: "https://marioplumbing.example.com/#brand",
  imageUrl: "https://marioplumbing.example.com/images/team.webp",
});


──────────────────────────────────────────────────────────────────────────────
4d. generateBreadcrumbSchema — BreadcrumbList node
──────────────────────────────────────────────────────────────────────────────

import { generateBreadcrumbSchema } from "@/lib/jsonld/generators";

const breadcrumbSchema = generateBreadcrumbSchema({
  id: "https://marioplumbing.example.com/about/#breadcrumb",
  items: [
    { name: "Home", item: "https://marioplumbing.example.com/" },
    { name: "About", item: "https://marioplumbing.example.com/about/" },
  ],
});


──────────────────────────────────────────────────────────────────────────────
4e. generateFaqSchema — FAQPage node
──────────────────────────────────────────────────────────────────────────────

import { generateFaqSchema } from "@/lib/jsonld/generators";

const faqSchema = generateFaqSchema({
  questions: [
    { question: "Are you licensed?", answer: "Yes, licensed in New York." },
    { question: "Do you offer free estimates?", answer: "Yes, all estimates are free." },
  ],
  pageUrl: "https://marioplumbing.example.com/faq/",
  publisherId: "https://marioplumbing.example.com/#brand",
});


──────────────────────────────────────────────────────────────────────────────
4f. generateServiceGraphNode — standalone Service node
──────────────────────────────────────────────────────────────────────────────

import { generateServiceGraphNode } from "@/lib/jsonld/generators";

const serviceNode = generateServiceGraphNode({
  id: "https://marioplumbing.example.com/drain-cleaning/#service",
  url: "https://marioplumbing.example.com/drain-cleaning/",
  name: "Drain Cleaning",
  description: "Professional drain cleaning and hydro-jetting.",
  serviceType: "PlumbingService",
  providerId: "https://marioplumbing.example.com/#organization",
  areaServed: [{ name: "Brooklyn", region: "NY" }, { name: "Queens", region: "NY" }],
  offerCatalogName: "Drain Services",
  offerItems: [
    { name: "Hydro-Jetting", url: "https://marioplumbing.example.com/drain-cleaning/hydro-jetting/" },
    "Drain Snaking",
  ],
  aggregateRating: { ratingValue: 4.9, reviewCount: 87 },
});


──────────────────────────────────────────────────────────────────────────────
4g. generateStandardPageGraph — base graph builder used by all page generators
    Returns { webPageSchema, breadcrumbSchema, faqSchema?, graphItems }
──────────────────────────────────────────────────────────────────────────────

import { generateStandardPageGraph } from "@/lib/jsonld/generators";

const { webPageSchema, breadcrumbSchema, faqSchema, graphItems } = generateStandardPageGraph({
  pageUrl: "https://marioplumbing.example.com/contact/",
  pageType: "ContactPage",
  title: "Contact Mario's Pipes & Drains",
  description: "Get in touch for a free estimate or emergency plumbing service.",
  websiteId: "https://marioplumbing.example.com/#website",
  organizationId: "https://marioplumbing.example.com/#organization",
  brandId: "https://marioplumbing.example.com/#brand",
  aboutId: "https://marioplumbing.example.com/#organization",
  imageUrl: "https://marioplumbing.example.com/images/contact.webp",
  breadcrumbItems: [
    { name: "Home", item: "https://marioplumbing.example.com/" },
    { name: "Contact", item: "https://marioplumbing.example.com/contact/" },
  ],
  faqQuestions: [
    { question: "What areas do you serve?", answer: "We serve Brooklyn, Queens, and Manhattan." },
  ],
});

// Spread graphItems into JsonLdOrganization or JsonLdCustom:
<JsonLdOrganization profile={demoProfile} graphItems={graphItems} includeGlobalSignals={false} />


──────────────────────────────────────────────────────────────────────────────
4h. generateImageGalleryGraph — standalone ImageGallery node (not page-level)
    Used by JsonLdGallery internally; call directly for custom gallery embeds.
──────────────────────────────────────────────────────────────────────────────

import { generateImageGalleryGraph } from "@/lib/jsonld/generators";

const galleryProjects: GalleryProject[] = [
  {
    id: "proj-1",
    title: "Park Slope Copper Re-Pipe",
    images: [{ storage_path: "/images/park-slope-after.webp", alt_text: "New copper plumbing" }],
    latitude: 40.6726,
    longitude: -73.9774,
    completion_date: "2025-06-10",
    city: { name: "Brooklyn" },
    service: { name: "Pipe Repair" },
  },
];

const galleryNode = generateImageGalleryGraph({
  pathname: "/projects/",
  projects: galleryProjects,
  organizationId: "https://marioplumbing.example.com/#organization",
  siteInfo: demoSiteInfo,
});
*/
