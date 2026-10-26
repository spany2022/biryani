import { business, formatAddress } from "@/data/business";
import { categories } from "@/data/menu";
import type { MenuItem } from "@/lib/types";

/** schema.org Restaurant + Menu. Only confirmed business fields are included. */
export function restaurantJsonLd(menu: MenuItem[]) {
  const base = business.siteUrl ?? undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: business.name,
    servesCuisine: ["Hyderabadi", "Indian", "Biryani"],
    ...(base ? { url: base } : {}),
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(business.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: formatAddress(business.address),
            addressLocality: business.address.city,
            postalCode: business.address.postalCode,
            addressCountry: "IN",
          },
        }
      : {}),
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: categories.map((c) => ({
        "@type": "MenuSection",
        name: c.name,
        hasMenuItem: menu
          .filter((m) => m.category === c.id)
          .map((m) => ({
            "@type": "MenuItem",
            name: m.name,
            description: m.description,
            ...(m.isVeg ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
            offers: m.portions.map((p) => ({
              "@type": "Offer",
              name: p.label,
              price: p.price,
              priceCurrency: "INR",
              availability: m.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            })),
          })),
      })),
    },
  };
}
