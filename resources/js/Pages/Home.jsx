import Hero from '../Components/Hero';
import { Bundles, Categories, DiscountBanner, Featured, Marquee, Pillars, SizeGuide, TrackSection } from '../Components/Sections';

export default function Home({ products }) {
  return (
    <>
      <Hero />
      <Marquee />
      <Categories />
      <Featured products={products} />
      <DiscountBanner />
      <Bundles />
      <Pillars />
      <SizeGuide />
      <TrackSection />
    </>
  );
}
