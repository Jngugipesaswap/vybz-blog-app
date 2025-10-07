import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TrendingEvents from "@/components/TrendingEvents";
import VenueShowcase from "@/components/VenueShowcase";
import BlogSection from "@/components/BlogSection";
import PatatixCTA from "@/components/PatatixCTA";
import LoyaltySystem from "@/components/LoyaltySystem";
import VybzWallet from "@/components/VybzWallet";
import Footer from "@/components/Footer";
import concertVenue from "@/assets/concert-venue.jpg";
import outdoorVenue from "@/assets/outdoor-venue.jpg";
import authorAvatar from "@/assets/author-avatar.jpg";

const blogPosts = [
  {
    id: "1",
    title: "Navigate Nairobi's Nightlife: Your +18 Events Guide",
    excerpt: "From exclusive rooftop parties to underground clubs - discover the hottest spots where the night truly comes alive in Kenya's capital.",
    author: "Alex Kimani",
    authorAvatar: authorAvatar,
    publishDate: "Dec 20, 2024",
    readTime: "7 min read",
    image: concertVenue,
    category: "+18 Events",
    likes: 189,
    comments: 34,
    featured: true
  },
  {
    id: "2",
    title: "Family Fun in Nairobi: Kid-Friendly Events This Month",
    excerpt: "Create lasting memories with events designed for the whole family. From interactive museums to outdoor adventures.",
    author: "Grace Wanjiru",
    authorAvatar: authorAvatar,
    publishDate: "Dec 18, 2024",
    readTime: "5 min read",
    image: outdoorVenue,
    category: "Family Fun",
    likes: 156,
    comments: 28
  },
  {
    id: "3",
    title: "Tech Conferences & Networking: Building Kenya's Future",
    excerpt: "Your guide to the most impactful tech events, startup meetups, and innovation conferences happening in Nairobi.",
    author: "David Ochieng",
    authorAvatar: authorAvatar,
    publishDate: "Dec 15, 2024",
    readTime: "6 min read",
    image: concertVenue,
    category: "Conferences",
    likes: 203,
    comments: 45
  }
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <TrendingEvents />
        <VenueShowcase />
        <PatatixCTA />
        <LoyaltySystem />
        <VybzWallet />
        <BlogSection posts={blogPosts} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
