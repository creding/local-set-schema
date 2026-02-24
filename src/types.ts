export type SchemaValue =
  | string
  | number
  | boolean
  | null
  | SchemaNode
  | SchemaValue[];

export interface SchemaNode {
  "@context"?: string;
  "@type"?: string | string[];
  "@id"?: string;
  [key: string]: SchemaValue | undefined;
}

export interface AggregateRating {
  ratingValue: number;
  reviewCount?: number;
  ratingCount?: number;
  bestRating?: number; // Defaults to 5
  worstRating?: number; // Defaults to 1
}

export interface Review {
  author: string;
  datePublished: string; // YYYY-MM-DD
  reviewBody?: string;
  ratingValue: number;
  bestRating?: number; // Defaults to 5
  worstRating?: number; // Defaults to 1
  publisher?: string; // e.g. "Google", "Yelp"
}

export interface OrganizationProfile {
  name: string;
  legalName?: string;
  url: string;
  personBasePath?: string; // defaults to "/about/"
  logoUrl?: string;
  imageUrl?: string;
  description?: string;
  searchUrlTemplate?: string; // e.g. "https://example.com/search?q={search_term_string}"
  /** e.g., "RoofingContractor", "Plumber", "LocalBusiness", "HVACBusiness" */
  businessType: string;
  contact: {
    telephone: string;
    contactType?: string; // defaults to "customer service"
    email?: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry?: string;
    };
    geo?: {
      latitude: number;
      longitude: number;
    };
  };
  socialLinks?: string[];
  priceRange?: string; // e.g., "$$"
  hasMap?: string; // Google Maps URL
  openingHours?: Array<{
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }>;
  credentials?: Array<{
    name: string;
    recognizedBy: string;
    recognizedByType?: string; // defaults to "Organization", e.g., "GovernmentOrganization"
  }>;
  memberOf?: Array<{
    name: string;
    url?: string;
    type?: string; // defaults to "Organization"
  }>;
  founders?: Array<{
    id: string;
    name: string;
    jobTitle?: string;
    sameAs?: string[];
  }>;
  employees?: Array<{
    id: string;
    name: string;
    jobTitle?: string;
    sameAs?: string[];
  }>;
  aggregateRating?: AggregateRating;
  reviews?: Review[];
}

export interface ServiceOffer {
  name: string;
  url: string;
  description?: string;
}

export interface ServiceArea {
  name: string;
  region: string;
  country?: string;
}

export interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  provider: {
    "@id": string;
  };
  offers?: ServiceOffer[];
  areaServed?: ServiceArea[];
  parentService?: {
    name: string;
    url: string;
  };
  aggregateRating?: AggregateRating;
  reviews?: Review[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ProjectImage {
  url: string;
  caption: string;
  width?: number;
  height?: number;
  location?: string;
  creatorId?: string;
}

export interface ArticleSchemaProps {
  headline: string;
  url: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  publisherName?: string;
  publisherLogo?: string;
  description?: string;
  articleBody?: string;
}

export interface ProductSchemaProps {
  name: string;
  image: string[];
  description?: string;
  sku?: string;
  mpn?: string;
  brand?: string;
  offers?: {
    price: number | string;
    priceCurrency: string;
    availability?: string; // e.g. "https://schema.org/InStock"
    url?: string;
    priceValidUntil?: string;
  };
  aggregateRating?: AggregateRating;
  reviews?: Review[];
}

export interface SoftwareApplicationSchemaProps {
  name: string;
  operatingSystem: string;
  applicationCategory: string;
  offers?: {
    price: number | string;
    priceCurrency: string;
  };
  aggregateRating?: AggregateRating;
}

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export interface HowToSchemaProps {
  name: string;
  description?: string;
  image?: string;
  totalTime?: string; // ISO 8601 duration e.g. "PT30M"
  estimatedCost?: {
    currency: string;
    value: string;
  };
  steps: HowToStep[];
}

export interface EventSchemaProps {
  name: string;
  startDate: string;
  endDate?: string;
  eventAttendanceMode?: string; // e.g. "https://schema.org/OfflineEventAttendanceMode"
  eventStatus?: string; // e.g. "https://schema.org/EventScheduled"
  location?: {
    type?: "Place" | "VirtualLocation";
    name?: string;
    url?: string;
    address?: {
      streetAddress?: string;
      addressLocality: string;
      addressRegion: string;
      postalCode?: string;
      addressCountry: string;
    };
  };
  image?: string[];
  description?: string;
  offers?: {
    url: string;
    price: number | string;
    priceCurrency: string;
    availability?: string;
    validFrom?: string;
  };
  performer?: {
    name: string;
    type?: "Person" | "Organization";
  };
  organizer?: {
    name: string;
    url?: string;
  };
}

export interface VideoObjectSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string[];
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string; // ISO 8601 duration
}

export interface RecipeSchemaProps {
  name: string;
  image: string[];
  author: string;
  datePublished: string;
  description: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  keywords?: string;
  recipeYield?: string | number;
  recipeCategory?: string;
  recipeCuisine?: string;
  calories?: string;
  recipeIngredient: string[];
  recipeInstructions: HowToStep[];
  aggregateRating?: AggregateRating;
  video?: VideoObjectSchemaProps;
}

export interface CourseSchemaProps {
  name: string;
  description: string;
  provider: {
    name: string;
    url?: string;
  };
}

export interface JobPostingSchemaProps {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string | string[]; // e.g. "FULL_TIME"
  hiringOrganization: {
    name: string;
    url?: string;
    logo?: string;
  };
  jobLocation: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  baseSalary?: {
    currency: string;
    value: {
      minValue: number;
      maxValue: number;
      unitText: string; // e.g. "HOUR", "WEEK", "MONTH", "YEAR"
    };
  };
}

/** Minimal site metadata needed by image-generating functions. */
export interface SiteInfo {
  /** Canonical origin, no trailing slash. e.g. "https://patriot-roof.com" */
  url: string;
  /** Full legal name used in copyright notices. */
  legalName: string;
  /** Path to the contact/license page. Defaults to "/contact/". */
  contactPagePath?: string;
}

/** Generic service area (replaces Patriot's CityData). */
export interface ServiceAreaData {
  slug: string;
  name: string;
  lat?: number | null;
  lng?: number | null;
}

/** Minimal service shape needed for offer catalog generation. */
export interface ServiceEntry {
  slug: string;
  name: string;
}

/** Generic project shape for generateImageGalleryGraph (replaces Project from DAL). */
export interface GalleryProject {
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

/** Full config for generating a city-level LocalBusiness node. */
export interface LocalBusinessConfig {
  /** Schema.org type. Defaults to "RoofingContractor". */
  businessType?: string;
  legalName: string;
  baseUrl: string;
  /** Base path for city pages. Defaults to "/areas-we-serve/". */
  cityPageBasePath?: string;
  phone: string;
  imageUrl?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry?: string;
  };
  openingHours: { dayOfWeek: string[]; opens: string; closes: string }[];
  credentials?: {
    name: string;
    recognizedBy: string;
    recognizedByType?: string;
  }[];
  /** State name used in areaServed.containedInPlace. Defaults to inferred from address.addressRegion. */
  stateName?: string;
  priceRange?: string;
}

export interface WebPageSchemaOptions {
  pageUrl: string;
  pageType?: string;
  title: string;
  description?: string;
  breadcrumbId?: string;
  mainEntityId?: string;
  aboutId?: string;
  hasPartIds?: string[];
  imageUrl?: string;
  websiteId?: string;
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface BreadcrumbSchemaOptions {
  id: string;
  items: BreadcrumbItem[];
}

export interface WebSiteSchemaOptions {
  url: string;
  name: string;
  description?: string;
  organizationId?: string;
  searchUrlTemplate?: string;
}

export interface FaqSchemaOptions {
  questions: FAQItem[];
  pageUrl: string;
  publisherId?: string;
}

export interface ServiceGraphNodeOptions {
  id: string;
  url: string;
  name: string;
  description: string;
  serviceType: string;
  providerId: string;
  areaServed?: SchemaValue;
  image?: string;
  offerCatalogName: string;
  offerItems: Array<{ name: string; url?: string } | string>;
  category?: string;
  aggregateRating?: AggregateRating;
  reviews?: Array<{
    authorName: string;
    datePublished: string;
    ratingValue: number;
    bestRating?: number;
    reviewBody?: string;
    publisherName?: string;
  }>;
}

export interface StandardPageGraphOptions {
  pageUrl: string;
  pageType?: string;
  title: string;
  description?: string;
  websiteId?: string;
  organizationId?: string;
  /** Override the entity the WebPage is `about`. Defaults to organizationId. */
  aboutId?: string;
  mainEntityId?: string;
  imageUrl?: string;
  breadcrumbItems: BreadcrumbItem[];
  faqQuestions?: FAQItem[];
  /**
   * @id of the Brand / parent Organization node (e.g. "https://example.com/#brand").
   * Used as publisher for FAQPage and Blog nodes, and as author.worksFor on Articles.
   * Derived from websiteId when not supplied (replaces /#website with /#brand).
   */
  brandId?: string;
}

export interface ServicePageGraphOptions extends StandardPageGraphOptions {
  serviceName: string;
  serviceType: string;
  serviceDescription: string;
  areaServed?: SchemaValue;
  offerCatalogName: string;
  offerItems: Array<{ name: string; url?: string } | string>;
  category?: string;
  aggregateRating?: AggregateRating;
  reviews?: Array<{
    authorName: string;
    datePublished: string;
    ratingValue: number;
    bestRating?: number;
    reviewBody?: string;
    publisherName?: string;
  }>;
}

export interface CollectionPageGraphOptions extends StandardPageGraphOptions {
  /** Site metadata used for ImageObject license/copyright fields. */
  siteInfo: SiteInfo;
  images: {
    id: string;
    url: string;
    name?: string;
    caption?: string;
    locationName?: string;
  }[];
  items: {
    url: string;
    name: string;
  }[];
}

export interface ProjectPageGraphOptions extends StandardPageGraphOptions {
  /** Site metadata used for ImageObject license/copyright fields. */
  siteInfo: SiteInfo;
  projectName: string;
  projectDescription: string;
  images: {
    id: string;
    url: string;
    name?: string;
    caption?: string;
    locationName?: string;
  }[];
  datePublished?: string;
  locationCreated?: {
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  aboutServiceIds?: string[];
  review?: {
    authorName: string;
    ratingValue: number;
    bestRating?: number;
    reviewBody?: string;
  };
}

export interface BlogHubGraphOptions extends StandardPageGraphOptions {
  blogName: string;
  blogDescription: string;
  blogPosts?: Array<{
    headline: string;
    url: string;
  }>;
}

export interface ArticlePageGraphOptions extends StandardPageGraphOptions {
  articleType?: string; // e.g., "BlogPosting", "NewsArticle", "Article"
  headline: string;
  datePublished?: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  authorId?: string;
  authorJobTitle?: string;
  articleBody?: string;
}

export interface CityHubGraphOptions extends StandardPageGraphOptions {
  city: ServiceAreaData;
  serviceCategories: Array<{
    categoryName: string;
    services: ServiceEntry[];
  }>;
  /** Name of the top-level service node (e.g., "Roofing & Home Services in Brooklyn"). */
  hubProviderName?: string;
  /** Type of the top-level service node (e.g., "Roofing & Home Exterior Services"). */
  hubProviderType?: string;
  /** Category of the service catalog (e.g., "Roofing & Exteriors"). */
  hubCategory?: string;
  /** Config used to build the city-level LocalBusiness entity. */
  localBusinessConfig: LocalBusinessConfig;
}

export interface CityServicePageGraphOptions extends ServicePageGraphOptions {
  city: ServiceAreaData;
  service: ServiceEntry;
  /** Config used to build the city-level LocalBusiness entity. */
  localBusinessConfig: LocalBusinessConfig;
}

export interface ImageGalleryGraphOptions {
  projects: GalleryProject[];
  pathname: string;
  organizationId?: string;
  /** Site metadata for ImageObject license/copyright/creator fields. */
  siteInfo: SiteInfo;
}
