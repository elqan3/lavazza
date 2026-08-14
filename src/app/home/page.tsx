import Navbar from "@/features/home/components/Navbar";
import HeroSection from "@/features/home/components/HeroSection";
import ServicesSection from "@/features/home/components/ServicesSection";
import PopularDrinksSection from "@/features/home/components/PopularDrinksSection";
import WhyLavazaSection from "@/features/home/components/WhyLavazaSection";
import AboutSection from "@/features/home/components/AboutSection";
import QuoteSection from "@/features/home/components/QuoteSection";
import MoodSpacePreview from "@/features/home/components/MoodSpacePreview";
import ContactSection from "@/features/home/components/ContactSection";
import Footer from "@/features/home/components/Footer";


export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <ServicesSection />
        <PopularDrinksSection />
        <WhyLavazaSection />
        <AboutSection />
        <QuoteSection />
        <MoodSpacePreview />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
