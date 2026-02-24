import {
  generateArticleSchema,
  generateCourseSchema,
  generateEventSchema,
  generateFaqSchema,
  generateHowToSchema,
  generateJobPostingSchema,
  generateOrganizationSchema,
  generateProductSchema,
  generateRecipeSchema,
  generateSoftwareApplicationSchema,
  generateWebSiteSchema,
} from "./generators";
import {
  generateImageGalleryGraph,
  generateServicePageGraph,
} from "./graph-builders";
import {
  ArticleSchemaProps,
  CourseSchemaProps,
  EventSchemaProps,
  FAQItem,
  HowToSchemaProps,
  ImageGalleryGraphOptions,
  JobPostingSchemaProps,
  OrganizationProfile,
  ProductSchemaProps,
  RecipeSchemaProps,
  SchemaNode,
  ServicePageGraphOptions,
  SoftwareApplicationSchemaProps,
} from "./types";

interface JsonLdScriptProps {
  data: object;
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function JsonLdCustom({
  data,
}: {
  data: SchemaNode | { "@context": string; "@graph": SchemaNode[] };
}) {
  return <JsonLdScript data={data} />;
}

interface JsonLdOrganizationProps {
  profile: OrganizationProfile;
  /** Additional custom objects to merge into the @graph array */
  graphItems?: SchemaNode[];
  /** Knowledge graph topics e.g., ["Roof Repair", "Emergency Plumbing"] */
  knowsAbout?: string[];
  /** Override the areaServed for the local business */
  areaServed?: Array<{
    name: string;
    region?: string;
    country?: string;
  }>;
  /** Override the hasOfferCatalog for the local business */
  offers?: Array<{ name: string; url: string; description?: string }>;
  offerCatalogName?: string;
  /**
   * By default, includes broad local-business enrichment fields
   * like knowsAbout and hasOfferCatalog.
   * Set to false to keep spoke-page schema tightly focused.
   */
  includeGlobalSignals?: boolean;
}

export function JsonLdOrganization({
  profile,
  graphItems = [],
  knowsAbout,
  areaServed,
  offers,
  offerCatalogName,
  includeGlobalSignals = true,
}: JsonLdOrganizationProps) {
  const [brandSchema, localBusinessSchema] =
    generateOrganizationSchema(profile);

  // Cast so we can safely mutate/enrich
  const localSchema = localBusinessSchema as SchemaNode;

  if (includeGlobalSignals) {
    if (knowsAbout && knowsAbout.length > 0) {
      localSchema.knowsAbout = knowsAbout;
    }

    if (areaServed && areaServed.length > 0) {
      localSchema.areaServed = areaServed.map((area) => ({
        "@type": "City",
        name: area.name,
        ...(area.region
          ? {
              containedInPlace: {
                "@type": "State",
                name: area.region,
              },
            }
          : {}),
      }));
    }

    if (offers && offers.length > 0) {
      localSchema.hasOfferCatalog = {
        "@type": "OfferCatalog",
        name: offerCatalogName || `${profile.name} Services`,
        itemListElement: offers.map((offer) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: offer.name,
            url: offer.url,
            ...(offer.description ? { description: offer.description } : {}),
          },
        })),
      };
    }
  }

  const websiteSchema = generateWebSiteSchema({
    url: profile.url,
    name: profile.name,
    description: profile.description,
    organizationId: brandSchema["@id"] as string,
    searchUrlTemplate: profile.searchUrlTemplate,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [brandSchema, localSchema, websiteSchema, ...graphItems],
  };

  return <JsonLdScript data={jsonLd} />;
}

export function JsonLdService(props: ServicePageGraphOptions) {
  const { graphItems } = generateServicePageGraph(props);
  return (
    <JsonLdScript
      data={{ "@context": "https://schema.org", "@graph": graphItems }}
    />
  );
}

export function JsonLdGallery(props: ImageGalleryGraphOptions) {
  const schema = generateImageGalleryGraph(props);
  if (!schema) return null;
  return (
    <JsonLdScript data={{ "@context": "https://schema.org", ...schema }} />
  );
}

export function JsonLdFAQ({
  questions,
  pageUrl,
  publisherId,
}: {
  questions: FAQItem[];
  pageUrl: string;
  publisherId?: string;
}) {
  const schema = generateFaqSchema({ questions, pageUrl, publisherId });
  // Optional wrapper if not passing into Organization @graph directly
  const jsonLd = {
    "@context": "https://schema.org",
    ...schema,
  };
  return <JsonLdScript data={jsonLd} />;
}

export function JsonLdArticle(props: ArticleSchemaProps) {
  const schema = generateArticleSchema(props);
  return (
    <JsonLdScript data={{ "@context": "https://schema.org", ...schema }} />
  );
}

export function JsonLdProduct(props: ProductSchemaProps) {
  const schema = generateProductSchema(props);
  return (
    <JsonLdScript data={{ "@context": "https://schema.org", ...schema }} />
  );
}

export function JsonLdSoftwareApplication(
  props: SoftwareApplicationSchemaProps,
) {
  const schema = generateSoftwareApplicationSchema(props);
  return (
    <JsonLdScript data={{ "@context": "https://schema.org", ...schema }} />
  );
}

export function JsonLdHowTo(props: HowToSchemaProps) {
  const schema = generateHowToSchema(props);
  return (
    <JsonLdScript data={{ "@context": "https://schema.org", ...schema }} />
  );
}

export function JsonLdEvent(props: EventSchemaProps) {
  const schema = generateEventSchema(props);
  return (
    <JsonLdScript data={{ "@context": "https://schema.org", ...schema }} />
  );
}

export function JsonLdRecipe(props: RecipeSchemaProps) {
  const schema = generateRecipeSchema(props);
  return (
    <JsonLdScript data={{ "@context": "https://schema.org", ...schema }} />
  );
}

export function JsonLdCourse(props: CourseSchemaProps) {
  const schema = generateCourseSchema(props);
  return (
    <JsonLdScript data={{ "@context": "https://schema.org", ...schema }} />
  );
}

export function JsonLdJobPosting(props: JobPostingSchemaProps) {
  const schema = generateJobPostingSchema(props);
  return (
    <JsonLdScript data={{ "@context": "https://schema.org", ...schema }} />
  );
}
