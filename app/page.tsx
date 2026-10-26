import Footer from "@/components/layout/Footer";
import Closing from "@/components/sections/Closing";
import Dining from "@/components/sections/Dining";
import DumArt from "@/components/sections/DumArt";
import Feasts from "@/components/sections/Feasts";
import Hero from "@/components/sections/Hero";
import Reviews from "@/components/sections/Reviews";
import RoyalMenu from "@/components/sections/RoyalMenu";
import Signature from "@/components/sections/Signature";
import Story from "@/components/sections/Story";
import WhyUs from "@/components/sections/WhyUs";
import { business } from "@/data/business";
import { getMenu } from "@/lib/store";
import { restaurantJsonLd } from "@/lib/structured-data";

export default async function Home() {
  const menu = await getMenu();
  return (
    <>
      <main id="main" tabIndex={-1}>
        <Hero />
        <Story />
        <Signature />
        <DumArt />
        <RoyalMenu />
        <Dining />
        <WhyUs />
        <Reviews />
        {(business.services.familyPacks || business.services.eventCatering) && <Feasts />}
        <Closing />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd(menu)).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
