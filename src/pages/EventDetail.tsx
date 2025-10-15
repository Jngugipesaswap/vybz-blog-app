import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SocialShare from "@/components/SocialShare";
import { ContentUpload } from "@/components/ContentUpload";
import { ReviewsSection } from "@/components/ReviewsSection";
import { useNavigate } from "react-router-dom";

// Example event detail page showing all Phase 6 features
export default function EventDetail() {
  const navigate = useNavigate();
  const [eventData] = useState({
    id: "sample-event-1",
    title: "Nairobi Music Festival 2024",
    description: "Experience the biggest music festival in East Africa featuring top artists and incredible performances.",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    location: "Uhuru Gardens, Nairobi",
    date: "December 15-17, 2024"
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <img
              src={eventData.image}
              alt={eventData.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{eventData.title}</h1>
              <p className="text-muted-foreground mb-4">{eventData.description}</p>
              <div className="space-y-2 text-sm">
                <p><strong>Location:</strong> {eventData.location}</p>
                <p><strong>Date:</strong> {eventData.date}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Share this event</h3>
              <SocialShare
                title={eventData.title}
                description={eventData.description}
                imageUrl={eventData.image}
                contentType="event"
                contentId={eventData.id}
              />
            </div>

            <ContentUpload
              referenceType="event"
              referenceId={eventData.id}
              onUploadComplete={() => {
                console.log("Content uploaded!");
              }}
            />

            <Button size="lg" className="w-full">
              Get Tickets
            </Button>
          </div>
        </div>

        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="reviews">Reviews & Ratings</TabsTrigger>
            <TabsTrigger value="details">Event Details</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-6">
            <ReviewsSection
              referenceType="event"
              referenceId={eventData.id}
            />
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">About This Event</h3>
                <p className="text-muted-foreground">
                  This is where detailed event information would appear, including lineup,
                  schedule, ticket information, venue details, and more.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
