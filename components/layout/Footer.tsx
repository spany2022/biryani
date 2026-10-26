import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { business, formatAddress, telHref } from "@/data/business";
import { ordering } from "@/data/ordering";

const tbc = <span className="italic text-cream/45">To be announced</span>;

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="visit" className="on-dark relative border-t border-saffron/15 bg-midnight text-cream" aria-labelledby="visit-title">
      <div className="mx-auto max-w-[90rem] px-5 pb-10 pt-20 md:px-10">
        <div className="ornament mx-auto max-w-md" aria-hidden="true">
          <span className="urdu text-3xl">{business.nameUrdu}</span>
        </div>
        <h2 id="visit-title" className="sr-only">
          Visit {business.name}
        </h2>

        <div className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/60">
              Hyderabadi dum biryani, kebabs and Deccani classics — for the table, for takeaway, and for every celebration.
            </p>
          </div>

          <div>
            <h3 className="eyebrow flex items-center gap-2 text-saffron">
              <MapPin className="h-4 w-4" aria-hidden="true" /> Location
            </h3>
            <address className="mt-4 text-sm not-italic leading-relaxed text-cream/75">
              {business.address ? formatAddress(business.address) : tbc}
            </address>
            {business.mapsUrl && (
              <a
                href={business.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline mt-3 inline-block text-sm font-semibold text-saffron"
              >
                Get directions
              </a>
            )}
          </div>

          <div>
            <h3 className="eyebrow flex items-center gap-2 text-saffron">
              <Clock className="h-4 w-4" aria-hidden="true" /> Hours
            </h3>
            {business.hours ? (
              <dl className="mt-4 space-y-1 text-sm text-cream/75">
                {business.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-6">
                    <dt>{h.days}</dt>
                    <dd className="tabular-nums">{h.hours}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm">{tbc}</p>
            )}
          </div>

          <div>
            <h3 className="eyebrow flex items-center gap-2 text-saffron">
              <Phone className="h-4 w-4" aria-hidden="true" /> Contact
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-cream/75">
              <li>{business.phone ? <a href={telHref(business.phone)} className="link-underline">{business.phone}</a> : tbc}</li>
              {business.email && (
                <li>
                  <a href={`mailto:${business.email}`} className="link-underline">
                    {business.email}
                  </a>
                </li>
              )}
              {business.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-cream/10 pt-8 text-xs text-cream/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {business.name}. {ordering.mode === "demo" && "Demo website — sample menu, prices and photography."}
          </p>
          <nav aria-label="Footer" className="flex gap-6">
            <Link href="/#menu" className="link-underline">
              Menu
            </Link>
            <Link href="/checkout" className="link-underline">
              Checkout
            </Link>
            <Link href="/#feasts" className="link-underline">
              Catering
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
