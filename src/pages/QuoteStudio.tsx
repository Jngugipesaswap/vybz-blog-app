import Navigation from "@/components/Navigation";
import { QuoteCardStudio } from "@/components/QuoteCardStudio";
import Footer from "@/components/Footer";

const QuoteStudio = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Quote Card Studio</h1>
            <p className="text-muted-foreground">
              Extract quotable lines from your content and create beautiful shareable cards
            </p>
          </div>
          <QuoteCardStudio />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuoteStudio;
