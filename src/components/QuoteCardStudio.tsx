import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const QuoteCardStudio = () => {
  const { toast } = useToast();
  const quoteCardRef = useRef<HTMLDivElement>(null);
  const [sourceText, setSourceText] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [extractedQuotes, setExtractedQuotes] = useState<string[]>([]);
  const [bgStyle, setBgStyle] = useState("gradient1");

  const extractQuotableLines = () => {
    if (!sourceText.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to extract quotes from",
        variant: "destructive",
      });
      return;
    }

    const sentences = sourceText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && s.length < 200);

    const quotable = sentences.filter((s) => {
      const words = s.split(" ");
      return (
        words.length > 5 &&
        words.length < 30 &&
        (s.includes("is") ||
          s.includes("are") ||
          s.includes("will") ||
          s.includes("can") ||
          s.includes("must") ||
          s.includes("always") ||
          s.includes("never"))
      );
    });

    if (quotable.length === 0) {
      toast({
        title: "No quotes found",
        description: "Try adding more descriptive sentences",
      });
    } else {
      setExtractedQuotes(quotable.slice(0, 5));
      setSelectedQuote(quotable[0]);
      toast({
        title: "Quotes extracted!",
        description: `Found ${quotable.length} quotable lines`,
      });
    }
  };

  const exportAsImage = async () => {
    if (!quoteCardRef.current || !selectedQuote) {
      toast({
        title: "Nothing to export",
        description: "Please select a quote first",
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = await html2canvas(quoteCardRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `quote-${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast({
            title: "Quote exported!",
            description: "Your quote card has been downloaded",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate image",
        variant: "destructive",
      });
    }
  };

  const bgStyles = {
    gradient1: "bg-gradient-to-br from-primary via-primary/80 to-accent",
    gradient2: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500",
    gradient3: "bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500",
    gradient4: "bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600",
    solid: "bg-primary",
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Extract Quotes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="source-text">Source Text</Label>
              <Textarea
                id="source-text"
                placeholder="Paste your blog post or article here..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={8}
                className="mt-2"
              />
            </div>
            <Button onClick={extractQuotableLines} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Extract Quotable Lines
            </Button>

            {extractedQuotes.length > 0 && (
              <div className="space-y-2">
                <Label>Select a Quote</Label>
                <Select value={selectedQuote} onValueChange={setSelectedQuote}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {extractedQuotes.map((quote, idx) => (
                      <SelectItem key={idx} value={quote}>
                        {quote.slice(0, 50)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="author">Author / Attribution</Label>
              <Input
                id="author"
                placeholder="Your name or brand"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="bg-style">Background Style</Label>
              <Select value={bgStyle} onValueChange={setBgStyle}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient1">Gradient 1 (Brand)</SelectItem>
                  <SelectItem value="gradient2">Gradient 2 (Vibrant)</SelectItem>
                  <SelectItem value="gradient3">Gradient 3 (Ocean)</SelectItem>
                  <SelectItem value="gradient4">Gradient 4 (Sunset)</SelectItem>
                  <SelectItem value="solid">Solid Color</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview & Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              ref={quoteCardRef}
              className={`${bgStyles[bgStyle as keyof typeof bgStyles]} rounded-lg p-8 min-h-[400px] flex flex-col justify-center items-center text-white shadow-xl`}
            >
              {selectedQuote ? (
                <>
                  <blockquote className="text-2xl font-semibold text-center leading-relaxed mb-6">
                    "{selectedQuote}"
                  </blockquote>
                  {author && (
                    <p className="text-lg font-medium opacity-90">— {author}</p>
                  )}
                </>
              ) : (
                <p className="text-xl opacity-60 text-center">
                  Your quote will appear here
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={exportAsImage} className="flex-1" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Export as Image
              </Button>
              <Button
                onClick={() => {
                  setSourceText("");
                  setSelectedQuote("");
                  setExtractedQuotes([]);
                  setAuthor("");
                }}
                variant="outline"
                size="lg"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
