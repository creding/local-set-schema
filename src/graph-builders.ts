import {
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateServiceGraphNode,
  generateWebPageSchema,
} from "./generators";
import {
  ArticlePageGraphOptions,
  BlogHubGraphOptions,
  CityHubGraphOptions,
  CityServicePageGraphOptions,
  CollectionPageGraphOptions,
  FAQItem,
  ImageGalleryGraphOptions,
  ProjectPageGraphOptions,
  SchemaNode,
  ServicePageGraphOptions,
  StandardPageGraphOptions,
} from "./types";
import { buildLocalBusinessSchema } from "./utils";

/** Builds a complete, interconnected schema graph for a standard informational page. Returns a base `webPageSchema` along with an array of all connected nodes (Breadcrumbs, FAQ, etc.). */
export function generateStandardPageGraph(options: StandardPageGraphOptions) {
  const breadcrumbId = `${options.pageUrl}#breadcrumb`;
  const faqId = `${options.pageUrl}#faq`;
  const hasFaq = Boolean(
    options.faqQuestions && options.faqQuestions.length > 0,
  );
  const webPageSchema = generateWebPageSchema({
    pageUrl: options.pageUrl,
    pageType: options.pageType,
    title: options.title,
    description: options.description,
    websiteId: options.websiteId,
    mainEntityId: options.mainEntityId || options.organizationId,
    // Use explicit aboutId if provided, otherwise fall back to organizationId
    aboutId: options.aboutId ?? options.organizationId,
    breadcrumbId,
    imageUrl: options.imageUrl,
    ...(hasFaq ? { hasPartIds: [faqId] } : {}),
  });
  const breadcrumbSchema = generateBreadcrumbSchema({
    id: breadcrumbId,
    items: options.breadcrumbItems,
  });
  const brandId =
    options.brandId ??
    options.websiteId?.replace("/#website", "/#brand") ??
    undefined;
  const faqSchema = hasFaq
    ? generateFaqSchema({
        questions: options.faqQuestions as FAQItem[],
        pageUrl: options.pageUrl,
        publisherId: brandId,
      })
    : undefined;
  return {
    webPageSchema,
    breadcrumbSchema,
    ...(faqSchema ? { faqSchema } : {}),
    graphItems: [
      webPageSchema,
      breadcrumbSchema,
      ...(faqSchema ? [faqSchema] : []),
    ],
  };
}

/** Builds a complete schema graph for a Service page. It injects a main `Service` node connected to the overarching `WebPage` node. */
export function generateServicePageGraph(options: ServicePageGraphOptions) {
  const serviceId = `${options.pageUrl}#service`;
  const standardGraph = generateStandardPageGraph({
    ...options,
    mainEntityId: options.mainEntityId || serviceId,
  });
  const serviceSchema = {
    ...generateServiceGraphNode({
      id: serviceId,
      url: options.pageUrl,
      name: options.serviceName,
      description: options.serviceDescription,
      serviceType: options.serviceType,
      providerId: options.organizationId || "",
      areaServed: options.areaServed,
      image: options.imageUrl,
      offerCatalogName: options.offerCatalogName,
      offerItems: options.offerItems,
      category: options.category,
      aggregateRating: options.aggregateRating,
      reviews: options.reviews,
    }),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceLocation: {
        "@type": "Place",
        name: "On-site at Customer Location",
      },
    },
  };
  return {
    ...standardGraph,
    serviceSchema,
    graphItems: [...standardGraph.graphItems, serviceSchema],
  };
}

/** Builds a complete schema graph for a Collection page (like a portfolio index), creating an `ItemList` of the enclosed URLs. */
export function generateCollectionPageGraph(
  options: CollectionPageGraphOptions,
) {
  const standardGraph = generateStandardPageGraph({
    ...options,
    pageType: "CollectionPage",
  });
  const {
    url: siteUrl,
    legalName,
    contactPagePath = "/contact/",
  } = options.siteInfo;
  const projectImageObjects = options.images.map((image) => ({
    "@type": "ImageObject",
    "@id": image.id,
    url: image.url,
    contentUrl: image.url,
    ...(image.name ? { name: image.name } : {}),
    ...(image.caption ? { caption: image.caption } : {}),
    license: "https://creativecommons.org/licenses/by-nd/4.0/",
    acquireLicensePage: `${siteUrl}${contactPagePath}`,
    copyrightNotice: `© ${new Date().getFullYear()} ${legalName}`,
    creditText: legalName,
    ...(options.organizationId
      ? {
          creator: {
            "@type": "Organization",
            "@id": options.organizationId,
            name: legalName,
          },
        }
      : {}),
    ...(image.locationName
      ? {
          contentLocation: {
            "@type": "Place",
            name: image.locationName,
          },
        }
      : {}),
  }));
  const collectionWebPageSchema = {
    ...standardGraph.webPageSchema,
    // primaryImageOfPage references the first project's hero image
    ...(projectImageObjects[0]
      ? { primaryImageOfPage: { "@id": projectImageObjects[0]["@id"] } }
      : {}),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: options.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: item.url,
        name: item.name,
      })),
    },
  };
  const updatedGraphItems = standardGraph.graphItems.map((item) =>
    item["@id"] === collectionWebPageSchema["@id"]
      ? collectionWebPageSchema
      : item,
  );
  return {
    ...standardGraph,
    webPageSchema: collectionWebPageSchema,
    graphItems: [...updatedGraphItems, ...projectImageObjects],
  };
}

/** Builds a complete schema graph for a specific Project/Case Study page. Links the `WebPage` to a `CreativeWork` node containing an `ImageGallery`. */
export function generateProjectPageGraph(options: ProjectPageGraphOptions) {
  const projectId = `${options.pageUrl}#project`;
  const standardGraph = generateStandardPageGraph({
    ...options,
    mainEntityId: options.mainEntityId || projectId,
  });
  const {
    url: siteUrl,
    legalName,
    contactPagePath = "/contact/",
  } = options.siteInfo;
  const projectImageObjects = options.images.map((image) => ({
    "@type": "ImageObject",
    "@id": image.id,
    url: image.url,
    contentUrl: image.url,
    ...(image.name ? { name: image.name } : {}),
    ...(image.caption ? { caption: image.caption } : {}),
    license: "https://creativecommons.org/licenses/by-nd/4.0/",
    acquireLicensePage: `${siteUrl}${contactPagePath}`,
    copyrightNotice: `© ${new Date().getFullYear()} ${legalName}`,
    creditText: legalName,
    ...(options.organizationId
      ? {
          creator: {
            "@type": "Organization",
            "@id": options.organizationId,
            name: legalName,
          },
        }
      : {}),
    ...(image.locationName
      ? {
          contentLocation: {
            "@type": "Place",
            name: image.locationName,
          },
        }
      : {}),
  }));
  const projectSchema = {
    "@type": "CreativeWork",
    "@id": projectId,
    name: options.projectName,
    description: options.projectDescription,
    ...(options.datePublished ? { datePublished: options.datePublished } : {}),
    image: projectImageObjects.map((img) => ({ "@id": img["@id"] })),
    hasPart: projectImageObjects.map((img) => ({ "@id": img["@id"] })),
    // Link the work back to the organization that created it (E-E-A-T)
    ...(options.organizationId
      ? { creator: { "@id": options.organizationId } }
      : {}),
    ...(options.locationCreated
      ? {
          locationCreated: {
            "@type": "Place",
            name: options.locationCreated.name,
            ...(options.locationCreated.latitude &&
            options.locationCreated.longitude
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: options.locationCreated.latitude,
                    longitude: options.locationCreated.longitude,
                  },
                }
              : {}),
          },
        }
      : {}),
    ...(options.aboutServiceIds && options.aboutServiceIds.length > 0
      ? {
          about: options.aboutServiceIds.map((id) => ({ "@id": id })),
        }
      : {}),
    ...(options.review
      ? {
          review: {
            "@type": "Review",
            author: {
              "@type": "Person",
              name: options.review.authorName,
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: options.review.ratingValue,
              bestRating: options.review.bestRating || 5,
            },
            ...(options.review.reviewBody
              ? { reviewBody: options.review.reviewBody }
              : {}),
          },
        }
      : {}),
  };
  const webPageSchema = {
    ...standardGraph.webPageSchema,
    // primaryImageOfPage only — image hasPart belongs on the CreativeWork, not the WebPage
    ...(projectImageObjects[0]
      ? { primaryImageOfPage: { "@id": projectImageObjects[0]["@id"] } }
      : {}),
  };
  const updatedGraphItems = standardGraph.graphItems.map((item) =>
    item["@id"] === webPageSchema["@id"] ? webPageSchema : item,
  );
  return {
    ...standardGraph,
    webPageSchema,
    projectSchema,
    graphItems: [...updatedGraphItems, projectSchema, ...projectImageObjects],
  };
}

/** Builds a complete schema graph for a Blog index/hub page. Injects a `Blog` node as the main entity of the page. */
export function generateBlogHubGraph(options: BlogHubGraphOptions) {
  const blogId = `${options.pageUrl}#blog`;
  const standardGraph = generateStandardPageGraph({
    ...options,
    mainEntityId: options.mainEntityId || blogId,
  });
  const brandId =
    options.brandId ??
    options.websiteId?.replace("/#website", "/#brand") ??
    undefined;
  const blogSchema = {
    "@type": "Blog",
    "@id": blogId,
    name: options.blogName,
    description: options.blogDescription,
    url: options.pageUrl,
    // Blog is published by the Brand (parent org), not the LocalBusiness
    ...(brandId ? { publisher: { "@id": brandId } } : {}),
    inLanguage: "en-US",
    ...(options.blogPosts && options.blogPosts.length > 0
      ? {
          blogPost: options.blogPosts.map((post) => ({
            "@type": "BlogPosting",
            headline: post.headline,
            url: post.url,
          })),
        }
      : {}),
  };
  const webPageSchema = {
    ...standardGraph.webPageSchema,
    mainEntity: { "@id": blogId },
  };
  const updatedGraphItems = standardGraph.graphItems.map((item) =>
    item["@id"] === webPageSchema["@id"] ? webPageSchema : item,
  );
  return {
    ...standardGraph,
    webPageSchema,
    blogSchema,
    graphItems: [...updatedGraphItems, blogSchema],
  };
}

/** Builds a complete schema graph for an individual Article or Blog Post. Links the `WebPage` to the `Article` node and attributes authorship. */
export function generateArticlePageGraph(options: ArticlePageGraphOptions) {
  const articleId = `${options.pageUrl}#article`;
  const standardGraph = generateStandardPageGraph({
    ...options,
    mainEntityId: options.mainEntityId || articleId,
  });
  const articleSchema = {
    "@type": options.articleType || "Article",
    "@id": articleId,
    headline: options.headline,
    name: options.headline,
    ...(options.description ? { description: options.description } : {}),
    ...(options.imageUrl ? { image: [options.imageUrl] } : {}),
    ...(options.datePublished ? { datePublished: options.datePublished } : {}),
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
    author: options.authorId
      ? { "@id": options.authorId }
      : {
          "@type": "Person",
          name: options.authorName,
          ...(options.authorJobTitle
            ? { jobTitle: options.authorJobTitle }
            : {}),
          ...(options.authorUrl ? { url: options.authorUrl } : {}),
          // Authors work for the Brand (parent org), not the LocalBusiness
          ...((options.brandId ??
          options.websiteId?.replace("/#website", "/#brand"))
            ? {
                worksFor: {
                  "@id":
                    options.brandId ??
                    options.websiteId!.replace("/#website", "/#brand"),
                },
              }
            : {}),
        },
    ...(options.articleBody ? { articleBody: options.articleBody } : {}),
    ...(options.organizationId
      ? { publisher: { "@id": options.organizationId } }
      : {}),
    isPartOf: { "@id": `${options.pageUrl}#webpage` },
    mainEntityOfPage: { "@id": `${options.pageUrl}#webpage` },
  };
  return {
    ...standardGraph,
    articleSchema,
    graphItems: [...standardGraph.graphItems, articleSchema],
  };
}

/** Builds a complete schema graph for a 'City Hub' page (e.g., '/areas-we-serve/brooklyn'). Injects a robust `LocalBusiness` node specific to the city, and a high-level `Service` node containing nested `OfferCatalogs` for available services. */
export function generateCityHubGraph(options: CityHubGraphOptions) {
  const serviceId = `${options.pageUrl}#service`;
  const cityBasePath =
    options.localBusinessConfig.cityPageBasePath ?? "/areas-we-serve/";
  const localBusinessId = `${options.localBusinessConfig.baseUrl}${cityBasePath}${options.city.slug}/#localbusiness`;
  const standardGraph = generateStandardPageGraph({
    ...options,
    mainEntityId: options.mainEntityId || serviceId,
    // City hub page is specifically about the local business entity for this city
    aboutId: localBusinessId,
  });
  const serviceSchema = {
    ...generateServiceGraphNode({
      id: serviceId,
      url: options.pageUrl,
      name: options.hubProviderName || `Services in ${options.city.name}`,
      description: options.description || "",
      serviceType: options.hubProviderType || "General Services",
      category: options.hubCategory,
      providerId: localBusinessId,
      areaServed: {
        "@type": "City",
        name: options.city.name,
        containedInPlace: {
          "@type": "State",
          name: options.localBusinessConfig.address.addressRegion,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: options.city.lat,
          longitude: options.city.lng,
        },
      },
      offerCatalogName: `Services Available in ${options.city.name}`,
      offerItems: [],
    }),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Services Available in ${options.city.name}`,
      itemListElement: options.serviceCategories.map((category) => ({
        "@type": "OfferCatalog",
        name: category.categoryName,
        itemListElement: category.services.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            url: `${options.localBusinessConfig.baseUrl}${cityBasePath}${options.city.slug}/${s.slug}/`,
          },
        })),
      })),
    },
  };
  const localBusinessSchema = buildLocalBusinessSchema(
    localBusinessId,
    options.organizationId ??
      `${options.localBusinessConfig.baseUrl}/#organization`,
    options.city,
    options.localBusinessConfig,
  );
  return {
    ...standardGraph,
    serviceSchema,
    localBusinessSchema,
    graphItems: [
      ...standardGraph.graphItems,
      serviceSchema,
      localBusinessSchema,
    ],
  };
}

/** Builds a complete schema graph for a specific service in a specific city (e.g., '/areas-we-serve/brooklyn/roof-repair'). Injects both a city-specific `LocalBusiness` node and a targeted `Service` node. */
export function generateCityServicePageGraph(
  options: CityServicePageGraphOptions,
) {
  const cityBasePath =
    options.localBusinessConfig.cityPageBasePath ?? "/areas-we-serve/";
  const localBusinessId = `${options.localBusinessConfig.baseUrl}${cityBasePath}${options.city.slug}/#localbusiness`;
  const serviceGraph = generateServicePageGraph({
    ...options,
    organizationId: localBusinessId, // Override provider to be the local business
    // City+service page is specifically about the local business entity for this city
    aboutId: localBusinessId,
  });
  const localBusinessSchema = buildLocalBusinessSchema(
    localBusinessId,
    options.organizationId ??
      `${options.localBusinessConfig.baseUrl}/#organization`,
    options.city,
    options.localBusinessConfig,
  );
  return {
    ...serviceGraph,
    localBusinessSchema,
    graphItems: [...serviceGraph.graphItems, localBusinessSchema],
  };
}

/** Generates an array of `ImageObject` schema nodes for a gallery. Converts a list of project records into license-attributed schema images. */
export function generateImageGalleryGraph({
  projects,
  pathname,
  organizationId,
  siteInfo,
}: ImageGalleryGraphOptions): SchemaNode | null {
  if (projects.length === 0) return null;
  const { url: siteUrl, legalName, contactPagePath = "/contact/" } = siteInfo;
  const resolvedOrganizationId = organizationId ?? `${siteUrl}/#organization`;
  const normalizedPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const pageUrl = `${siteUrl}${normalizedPathname}`;
  const imageObjects = projects.flatMap((project) =>
    project.images.map((img, idx) => ({
      "@type": "ImageObject",
      "@id": `${pageUrl}#gallery-image-${project.id}-${idx}`,
      contentUrl: img.storage_path.startsWith("http")
        ? img.storage_path
        : `${siteUrl}${img.storage_path}`,
      name: img.alt_text || `${project.title} – Photo ${idx + 1}`,
      description: project.description || project.title,
      ...(project.latitude &&
        project.longitude && {
          contentLocation: {
            "@type": "Place",
            name: project.neighborhood_tag || project.city?.name || "",
            geo: {
              "@type": "GeoCoordinates",
              latitude: project.latitude,
              longitude: project.longitude,
            },
          },
        }),
      ...(project.completion_date && {
        dateCreated: project.completion_date,
      }),
      license: "https://creativecommons.org/licenses/by-nd/4.0/",
      acquireLicensePage: `${siteUrl}${contactPagePath}`,
      copyrightNotice: `© ${new Date().getFullYear()} ${legalName}`,
      creditText: legalName,
      creator: {
        "@type": "Organization",
        "@id": resolvedOrganizationId,
        name: legalName,
      },
      ...(project.services && project.services.length > 0
        ? {
            about: project.services.map((s) => ({
              "@type": "Service",
              name: s.name,
            })),
          }
        : project.service
          ? {
              about: [
                {
                  "@type": "Service",
                  name: project.service.name,
                },
              ],
            }
          : {}),
    })),
  );
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${pageUrl}#gallery`,
    name: "Project Gallery",
    isPartOf: { "@id": `${pageUrl}#webpage` },
    about: { "@id": resolvedOrganizationId },
    image: imageObjects,
  };
}
