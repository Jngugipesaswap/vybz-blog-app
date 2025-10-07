import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TrendingEvents from "@/components/TrendingEvents";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <HeroSection />
        <TrendingEvents />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
