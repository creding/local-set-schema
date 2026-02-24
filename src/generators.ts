import {
  ArticleSchemaProps,
  BreadcrumbSchemaOptions,
  CourseSchemaProps,
  EventSchemaProps,
  FaqSchemaOptions,
  HowToSchemaProps,
  JobPostingSchemaProps,
  OrganizationProfile,
  ProductSchemaProps,
  RecipeSchemaProps,
  ServiceGraphNodeOptions,
  SoftwareApplicationSchemaProps,
  WebPageSchemaOptions,
  WebSiteSchemaOptions,
} from "./types";
import { buildAggregateRating } from "./utils";

export function generateOrganizationSchema({
  url,
  personBasePath,
  founders,
  employees,
  legalName,
  name,
  logoUrl,
  contact,
  socialLinks,
  businessType,
  imageUrl,
  priceRange,
  hasMap,
  openingHours,
  credentials,
  memberOf,
  aggregateRating,
  reviews,
}: OrganizationProfile) {
  const brandId = `${url}/#brand`;
  const localId = `${url}/#organization`;
  const baseSiteUrl = url.replace(/\/+$/, "");
  const rawPersonBasePath = personBasePath || "/about/";
  const formattedPersonBasePath = rawPersonBasePath.startsWith("/")
    ? rawPersonBasePath
    : `/${rawPersonBasePath}`;
  const personBaseUrl = `${baseSiteUrl}${formattedPersonBasePath.endsWith("/") ? formattedPersonBasePath : `${formattedPersonBasePath}/`}`;

  const leadership = founders?.map((member) => ({
    "@type": "Person" as const,
    "@id": `${personBaseUrl}#${member.id}`,
    name: member.name,
    jobTitle: member.jobTitle,
    worksFor: { "@id": brandId },
    ...(member.sameAs ? { sameAs: member.sameAs } : {}),
  }));

  const allEmployees = employees?.map((member) => ({
    "@type": "Person" as const,
    "@id": `${personBaseUrl}#${member.id}`,
    name: member.name,
    jobTitle: member.jobTitle,
    worksFor: { "@id": brandId },
    ...(member.sameAs ? { sameAs: member.sameAs } : {}),
  }));

  return [
    // Parent Organization (The Brand)
    {
      "@type": "Organization",
      "@id": brandId,
      name: legalName || name,
      url: url,
      ...(logoUrl ? { logo: logoUrl } : {}),
      ...(contact
        ? {
            contactPoint: {
              "@type": "ContactPoint",
              telephone: contact.telephone,
              contactType: contact.contactType || "customer service",
              ...(contact.email ? { email: contact.email } : {}),
            },
          }
        : {}),
      ...(founders || employees
        ? {
            founder: leadership?.map((person) => ({
              "@type": "Person",
              "@id": person["@id"],
            })),
            employee: allEmployees,
          }
        : {}),
      ...(socialLinks ? { sameAs: socialLinks } : {}),
    },
    // Local Business (The Service Provider)
    {
      "@type": businessType,
      "@id": localId,
      parentOrganization: { "@id": brandId },
      name: name,
      url: url,
      ...(logoUrl ? { logo: logoUrl } : {}),
      ...(imageUrl ? { image: imageUrl } : {}),
      telephone: contact.telephone,
      ...(contact.email ? { email: contact.email } : {}),
      address: {
        "@type": "PostalAddress",
        streetAddress: contact.address.streetAddress,
        addressLocality: contact.address.addressLocality,
        addressRegion: contact.address.addressRegion,
        postalCode: contact.address.postalCode,
        addressCountry: contact.address.addressCountry || "US",
      },
      ...(contact.geo
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: contact.geo.latitude,
              longitude: contact.geo.longitude,
            },
          }
        : {}),
      ...(priceRange ? { priceRange: priceRange } : {}),
      ...(hasMap ? { hasMap: hasMap } : {}),
      ...(openingHours && openingHours.length > 0
        ? {
            openingHoursSpecification: openingHours.map((spec) => ({
              "@type": "OpeningHoursSpecification",
              dayOfWeek: spec.dayOfWeek,
              opens: spec.opens,
              closes: spec.closes,
            })),
          }
        : {}),
      ...(credentials && credentials.length > 0
        ? {
            hasCredential: credentials.map((cred) => ({
              "@type": "EducationalOccupationalCredential",
              name: cred.name,
              recognizedBy: {
                "@type": cred.recognizedByType || "Organization",
                name: cred.recognizedBy,
              },
            })),
          }
        : {}),
      ...(memberOf && memberOf.length > 0
        ? {
            memberOf: memberOf.map((member) => ({
              "@type": member.type || "Organization",
              name: member.name,
              ...(member.url ? { url: member.url } : {}),
            })),
          }
        : {}),
      ...(aggregateRating
        ? {
            aggregateRating: buildAggregateRating(aggregateRating),
          }
        : {}),
      ...(reviews && reviews.length > 0
        ? {
            review: reviews.map((review) => ({
              "@type": "Review",
              author: {
                "@type": "Person",
                name: review.author,
              },
              datePublished: review.datePublished,
              reviewRating: {
                "@type": "Rating",
                ratingValue: review.ratingValue,
                bestRating: review.bestRating || 5,
                worstRating: review.worstRating || 1,
              },
              ...(review.reviewBody ? { reviewBody: review.reviewBody } : {}),
              ...(review.publisher
                ? {
                    publisher: {
                      "@type": "Organization",
                      name: review.publisher,
                    },
                  }
                : {}),
            })),
          }
        : {}),
    },
  ];
}

export function generateWebPageSchema({
  pageUrl,
  pageType,
  title,
  description,
  breadcrumbId,
  mainEntityId,
  aboutId,
  hasPartIds,
  imageUrl,
  websiteId,
}: WebPageSchemaOptions) {
  return {
    "@type": pageType || "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    ...(description ? { description } : {}),
    ...(websiteId ? { isPartOf: { "@id": websiteId } } : {}),
    ...(breadcrumbId ? { breadcrumb: { "@id": breadcrumbId } } : {}),
    ...(mainEntityId ? { mainEntity: { "@id": mainEntityId } } : {}),
    ...(aboutId ? { about: { "@id": aboutId } } : {}),
    ...(hasPartIds && hasPartIds.length > 0
      ? {
          hasPart: hasPartIds.map((id) => ({ "@id": id })),
        }
      : {}),
    ...(imageUrl
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: imageUrl,
          },
        }
      : {}),
    ...(pageType === "ContactPage"
      ? {
          potentialAction: {
            "@type": "CommunicateAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: pageUrl,
              inLanguage: "en-US",
              actionPlatform: [
                "http://schema.org/DesktopWebPlatform",
                "http://schema.org/MobileWebPlatform",
              ],
            },
          },
        }
      : {}),
  };
}

export function generateBreadcrumbSchema({
  id,
  items,
}: BreadcrumbSchemaOptions) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export function generateServiceGraphNode({
  id,
  url,
  name,
  description,
  serviceType,
  providerId,
  areaServed,
  image,
  offerCatalogName,
  offerItems,
  category,
  aggregateRating,
  reviews,
}: ServiceGraphNodeOptions) {
  return {
    "@type": "Service",
    "@id": id,
    url,
    name,
    ...(image ? { image } : {}),
    description,
    serviceType,
    category,
    provider: {
      "@id": providerId,
    },
    ...(areaServed && Array.isArray(areaServed)
      ? {
          areaServed: areaServed.map((area: any) => ({
            "@type": "City",
            name: area.name || area,
            ...(area.region
              ? {
                  containedInPlace: {
                    "@type": "State",
                    name: area.region,
                  },
                }
              : {}),
          })),
        }
      : areaServed
        ? { areaServed }
        : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: offerCatalogName,
      itemListElement: offerItems.map((item) => {
        const itemName = typeof item === "string" ? item : item.name;
        const itemUrl = typeof item === "string" ? undefined : item.url;
        return {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: itemName,
            ...(itemUrl ? { url: itemUrl } : {}),
          },
        };
      }),
    },
    ...(aggregateRating
      ? { aggregateRating: buildAggregateRating(aggregateRating) }
      : {}),
    ...(reviews && reviews.length > 0
      ? {
          review: reviews.map((review) => ({
            "@type": "Review",
            author: {
              "@type": "Person",
              name: review.authorName,
            },
            datePublished: review.datePublished,
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.ratingValue,
              bestRating: review.bestRating || 5,
            },
            ...(review.reviewBody ? { reviewBody: review.reviewBody } : {}),
            ...(review.publisherName
              ? {
                  publisher: {
                    "@type": "Organization",
                    name: review.publisherName,
                  },
                }
              : {}),
          })),
        }
      : {}),
  };
}

export function generateWebSiteSchema({
  url,
  name,
  description,
  organizationId,
  searchUrlTemplate,
}: WebSiteSchemaOptions) {
  return {
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url: url,
    name,
    ...(description ? { description } : {}),
    ...(organizationId ? { publisher: { "@id": organizationId } } : {}),
    ...(searchUrlTemplate
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: searchUrlTemplate,
            },
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
    inLanguage: "en-US",
  };
}

export function generateFaqSchema({
  questions,
  pageUrl,
  publisherId,
}: FaqSchemaOptions) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    ...(publisherId ? { publisher: { "@id": publisherId } } : {}),
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function generateArticleSchema({
  headline,
  image,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  publisherName,
  publisherLogo,
  description,
  url,
  articleBody,
}: ArticleSchemaProps) {
  return {
    "@type": "Article",
    headline: headline,
    image: image,
    datePublished: datePublished,
    ...(dateModified ? { dateModified: dateModified } : {}),
    author: {
      "@type": "Person",
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {}),
    },
    ...(publisherName
      ? {
          publisher: {
            "@type": "Organization",
            name: publisherName,
            ...(publisherLogo
              ? {
                  logo: {
                    "@type": "ImageObject",
                    url: publisherLogo,
                  },
                }
              : {}),
          },
        }
      : {}),
    ...(description ? { description: description } : {}),
    ...(articleBody ? { articleBody: articleBody } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export function generateProductSchema({
  name,
  image,
  description,
  sku,
  mpn,
  brand,
  offers,
  aggregateRating,
  reviews,
}: ProductSchemaProps) {
  return {
    "@type": "Product",
    name: name,
    image: image,
    ...(description ? { description: description } : {}),
    ...(sku ? { sku: sku } : {}),
    ...(mpn ? { mpn: mpn } : {}),
    ...(brand
      ? {
          brand: {
            "@type": "Brand",
            name: brand,
          },
        }
      : {}),
    ...(offers
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: offers.priceCurrency,
            price: offers.price,
            ...(offers.availability
              ? { availability: offers.availability }
              : {}),
            ...(offers.url ? { url: offers.url } : {}),
            ...(offers.priceValidUntil
              ? { priceValidUntil: offers.priceValidUntil }
              : {}),
          },
        }
      : {}),
    ...(aggregateRating
      ? {
          aggregateRating: buildAggregateRating(aggregateRating),
        }
      : {}),
    ...(reviews && reviews.length > 0
      ? {
          review: reviews.map((review) => ({
            "@type": "Review",
            author: {
              "@type": "Person",
              name: review.author,
            },
            datePublished: review.datePublished,
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.ratingValue,
              bestRating: review.bestRating || 5,
              worstRating: review.worstRating || 1,
            },
            ...(review.reviewBody ? { reviewBody: review.reviewBody } : {}),
            ...(review.publisher
              ? {
                  publisher: {
                    "@type": "Organization",
                    name: review.publisher,
                  },
                }
              : {}),
          })),
        }
      : {}),
  };
}

export function generateSoftwareApplicationSchema({
  name,
  operatingSystem,
  applicationCategory,
  offers,
  aggregateRating,
}: SoftwareApplicationSchemaProps) {
  return {
    "@type": "SoftwareApplication",
    name: name,
    operatingSystem: operatingSystem,
    applicationCategory: applicationCategory,
    ...(offers
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: offers.priceCurrency,
            price: offers.price,
          },
        }
      : {}),
    ...(aggregateRating
      ? {
          aggregateRating: buildAggregateRating(aggregateRating, "ratingCount"),
        }
      : {}),
  };
}

export function generateHowToSchema({
  name,
  description,
  image,
  totalTime,
  estimatedCost,
  steps,
}: HowToSchemaProps) {
  return {
    "@type": "HowTo",
    name: name,
    ...(description ? { description: description } : {}),
    ...(image ? { image: image } : {}),
    ...(totalTime ? { totalTime: totalTime } : {}),
    ...(estimatedCost
      ? {
          estimatedCost: {
            "@type": "MonetaryAmount",
            currency: estimatedCost.currency,
            value: estimatedCost.value,
          },
        }
      : {}),
    step: steps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      ...(step.url ? { url: step.url } : {}),
      ...(step.image ? { image: step.image } : {}),
    })),
  };
}

export function generateEventSchema({
  name,
  startDate,
  endDate,
  eventAttendanceMode,
  eventStatus,
  image,
  description,
  location,
  offers,
  performer,
  organizer,
}: EventSchemaProps) {
  return {
    "@type": "Event",
    name: name,
    startDate: startDate,
    ...(endDate ? { endDate: endDate } : {}),
    ...(eventAttendanceMode
      ? { eventAttendanceMode: eventAttendanceMode }
      : {}),
    ...(eventStatus ? { eventStatus: eventStatus } : {}),
    ...(image ? { image: image } : {}),
    ...(description ? { description: description } : {}),
    ...(location
      ? {
          location:
            location.type === "VirtualLocation"
              ? {
                  "@type": "VirtualLocation",
                  ...(location.url ? { url: location.url } : {}),
                }
              : {
                  "@type": "Place",
                  ...(location.name ? { name: location.name } : {}),
                  ...(location.address
                    ? {
                        address: {
                          "@type": "PostalAddress",
                          ...(location.address.streetAddress
                            ? {
                                streetAddress: location.address.streetAddress,
                              }
                            : {}),
                          addressLocality: location.address.addressLocality,
                          addressRegion: location.address.addressRegion,
                          ...(location.address.postalCode
                            ? { postalCode: location.address.postalCode }
                            : {}),
                          addressCountry: location.address.addressCountry,
                        },
                      }
                    : {}),
                },
        }
      : {}),
    ...(offers
      ? {
          offers: {
            "@type": "Offer",
            url: offers.url,
            price: offers.price,
            priceCurrency: offers.priceCurrency,
            ...(offers.availability
              ? { availability: offers.availability }
              : {}),
            ...(offers.validFrom ? { validFrom: offers.validFrom } : {}),
          },
        }
      : {}),
    ...(performer
      ? {
          performer: {
            "@type": performer.type || "Person",
            name: performer.name,
          },
        }
      : {}),
    ...(organizer
      ? {
          organizer: {
            "@type": "Organization",
            name: organizer.name,
            ...(organizer.url ? { url: organizer.url } : {}),
          },
        }
      : {}),
  };
}

export function generateRecipeSchema({
  name,
  image,
  author,
  datePublished,
  description,
  recipeIngredient,
  prepTime,
  cookTime,
  totalTime,
  keywords,
  recipeYield,
  recipeCategory,
  recipeCuisine,
  calories,
  aggregateRating,
  video,
  recipeInstructions,
}: RecipeSchemaProps) {
  return {
    "@type": "Recipe",
    name: name,
    image: image,
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished: datePublished,
    description: description,
    recipeIngredient: recipeIngredient,
    ...(prepTime ? { prepTime: prepTime } : {}),
    ...(cookTime ? { cookTime: cookTime } : {}),
    ...(totalTime ? { totalTime: totalTime } : {}),
    ...(keywords ? { keywords: keywords } : {}),
    ...(recipeYield ? { recipeYield: recipeYield } : {}),
    ...(recipeCategory ? { recipeCategory: recipeCategory } : {}),
    ...(recipeCuisine ? { recipeCuisine: recipeCuisine } : {}),
    ...(calories
      ? {
          nutrition: {
            "@type": "NutritionInformation",
            calories: calories,
          },
        }
      : {}),
    ...(aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregateRating.ratingValue,
            reviewCount: aggregateRating.reviewCount,
            bestRating: aggregateRating.bestRating || 5,
            worstRating: aggregateRating.worstRating || 1,
          },
        }
      : {}),
    ...(video
      ? {
          video: {
            "@type": "VideoObject",
            name: video.name,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            uploadDate: video.uploadDate,
            ...(video.contentUrl ? { contentUrl: video.contentUrl } : {}),
            ...(video.embedUrl ? { embedUrl: video.embedUrl } : {}),
            ...(video.duration ? { duration: video.duration } : {}),
          },
        }
      : {}),
    recipeInstructions: recipeInstructions.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      ...(step.url ? { url: step.url } : {}),
      ...(step.image ? { image: step.image } : {}),
    })),
  };
}

export function generateCourseSchema({
  name,
  description,
  provider,
}: CourseSchemaProps) {
  return {
    "@type": "Course",
    name: name,
    description: description,
    provider: {
      "@type": "Organization",
      name: provider.name,
      ...(provider.url ? { url: provider.url } : {}),
    },
  };
}

export function generateJobPostingSchema({
  title,
  description,
  datePosted,
  validThrough,
  employmentType,
  hiringOrganization,
  jobLocation,
  baseSalary,
}: JobPostingSchemaProps) {
  return {
    "@type": "JobPosting",
    title: title,
    description: description,
    datePosted: datePosted,
    ...(validThrough ? { validThrough: validThrough } : {}),
    ...(employmentType ? { employmentType: employmentType } : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: hiringOrganization.name,
      ...(hiringOrganization.url ? { sameAs: hiringOrganization.url } : {}),
      ...(hiringOrganization.logo ? { logo: hiringOrganization.logo } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(jobLocation.streetAddress
          ? { streetAddress: jobLocation.streetAddress }
          : {}),
        addressLocality: jobLocation.addressLocality,
        addressRegion: jobLocation.addressRegion,
        ...(jobLocation.postalCode
          ? { postalCode: jobLocation.postalCode }
          : {}),
        addressCountry: jobLocation.addressCountry,
      },
    },
    ...(baseSalary
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: baseSalary.currency,
            value: {
              "@type": "QuantitativeValue",
              minValue: baseSalary.value.minValue,
              maxValue: baseSalary.value.maxValue,
              unitText: baseSalary.value.unitText,
            },
          },
        }
      : {}),
  };
}
