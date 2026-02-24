import { LocalBusinessConfig, ServiceAreaData } from "./types";

export function buildAggregateRating(
  input: {
    ratingValue: number;
    reviewCount?: number;
    ratingCount?: number;
    bestRating?: number;
    worstRating?: number;
  },
  countKey: "reviewCount" | "ratingCount" = "reviewCount",
) {
  const count =
    countKey === "ratingCount"
      ? (input.ratingCount ?? input.reviewCount)
      : (input.reviewCount ?? input.ratingCount);

  return {
    "@type": "AggregateRating",
    ratingValue: input.ratingValue,
    ...(count !== undefined ? { [countKey]: count } : {}),
    bestRating: input.bestRating || 5,
    worstRating: input.worstRating || 1,
  };
}

/** Shared builder for city-level LocalBusiness entities.
 *  Includes full trust signals so Google doesn't need to traverse parentOrganization. */
export function buildLocalBusinessSchema(
  localBusinessId: string,
  parentOrganizationId: string,
  city: ServiceAreaData,
  config: LocalBusinessConfig,
) {
  const cityBasePath = config.cityPageBasePath ?? "/areas-we-serve/";
  const stateName = config.stateName ?? config.address.addressRegion;
  return {
    "@type": config.businessType ?? "LocalBusiness",
    "@id": localBusinessId,
    parentOrganization: { "@id": parentOrganizationId },
    name: `${config.legalName} of ${city.name}`,
    description: `Expert services in ${city.name}, ${stateName}.`,
    url: `${config.baseUrl}${cityBasePath}${city.slug}/`,
    ...(config.imageUrl ? { image: config.imageUrl } : {}),
    telephone: config.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.address.streetAddress,
      addressLocality: config.address.addressLocality,
      addressRegion: config.address.addressRegion,
      postalCode: config.address.postalCode,
      addressCountry: config.address.addressCountry ?? "US",
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "State",
        name: stateName,
      },
    },
    ...(city.lat && city.lng
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: city.lat,
            longitude: city.lng,
          },
        }
      : {}),
    ...(config.priceRange ? { priceRange: config.priceRange } : {}),
    openingHoursSpecification: config.openingHours.map((spec) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: spec.dayOfWeek,
      opens: spec.opens,
      closes: spec.closes,
    })),
    ...(config.credentials && config.credentials.length > 0
      ? {
          hasCredential: config.credentials.map((cred) => ({
            "@type": "EducationalOccupationalCredential",
            name: cred.name,
            recognizedBy: {
              "@type": cred.recognizedByType ?? "GovernmentOrganization",
              name: cred.recognizedBy,
            },
          })),
        }
      : {}),
  };
}
