/**
 * Business details — the single source of truth for everything factual on the site.
 *
 * Every field set to `null` is intentionally unconfirmed. The UI renders a tasteful
 * "to be announced" state for null values and hides actions (call, directions,
 * reviews link) that would otherwise point nowhere. Replace them with the
 * restaurant's verified details before launch — nothing here should be guessed.
 */

export type OpeningHours = {
  /** e.g. "Mon – Thu" */
  days: string;
  /** e.g. "12:00 – 23:00" */
  hours: string;
};

export type SocialLink = {
  label: "Instagram" | "Facebook" | "YouTube" | "X" | "WhatsApp";
  href: string;
};

export type Services = {
  delivery: boolean;
  pickup: boolean;
  /** Table reservation requests (the restaurant confirms by phone). */
  reservations: boolean;
  /** Family packs, party orders, office lunches, events, bulk orders. */
  familyPacks: boolean;
  partyOrders: boolean;
  officeLunch: boolean;
  eventCatering: boolean;
  bulkOrders: boolean;
};

export type Business = {
  /** Placeholder brand name — replace with the restaurant's real name. */
  name: string;
  /** Urdu rendering of the name, used as a calligraphic accent. */
  nameUrdu: string;
  descriptor: string;
  siteUrl: string | null;
  address: {
    street: string;
    locality: string;
    city: string;
    postalCode: string;
  } | null;
  mapsUrl: string | null;
  phone: string | null;
  email: string | null;
  hours: OpeningHours[] | null;
  /** Google Business Profile URL, used for the "Read reviews" link. */
  googleProfileUrl: string | null;
  social: SocialLink[];
  services: Services;
};

export const business: Business = {
  name: "Noor",
  nameUrdu: "نور",
  descriptor: "Hyderabadi Dum House",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
  address: null,
  mapsUrl: null,
  phone: null,
  email: null,
  hours: null,
  googleProfileUrl: null,
  social: [],
  // Sample service set for the demo. Switch off anything the restaurant doesn't offer
  // and the matching UI disappears.
  services: {
    delivery: true,
    pickup: true,
    reservations: true,
    familyPacks: true,
    partyOrders: true,
    officeLunch: true,
    eventCatering: true,
    bulkOrders: true,
  },
};

export const formatAddress = (a: NonNullable<Business["address"]>) =>
  [a.street, a.locality, a.city, a.postalCode].filter(Boolean).join(", ");

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
