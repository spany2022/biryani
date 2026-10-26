/**
 * Guest reviews — VERIFIED DATA ONLY.
 *
 * Add a review here only when it comes from a reliable source (e.g. the restaurant's
 * Google Business Profile) and you have permission to republish it with the guest's
 * name. Never write or paraphrase reviews. While this list is empty, the section
 * explains that reviews will appear here instead of showing placeholders.
 */

export type Review = {
  quote: string;
  author: string;
  /** ISO date of the original review. */
  date: string;
  source: "Google" | "Zomato" | "Swiggy" | "Direct";
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Guest photo of their food, only with permission. */
  photo?: { src: string; alt: string };
};

export const reviews: Review[] = [];

/** Aggregate rating — copy it from the live profile and update `asOf` whenever you do. */
export const rating: { value: number; count: number; source: string; asOf: string } | null = null;
