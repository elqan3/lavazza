import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ServicesSection from "./components/ServicesSection";
import PopularDrinksSection from "./components/PopularDrinksSection";
import WhyLavazaSection from "./components/WhyLavazaSection";
import AboutSection from "./components/AboutSection";
import QuoteSection from "./components/QuoteSection";
import MoodSpacePreview from "./components/MoodSpacePreview";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

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
