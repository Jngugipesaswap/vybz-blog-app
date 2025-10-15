import { useState, useEffect } from "react";
import { Check, X, Eye, Video, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface ContentItem {
  id: string;
  user_id: string;
  content_type: string;
  content_url: string;
  title: string;
  description: string | null;
  content_reference_type: string;
  content_reference_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface Review {
  id: string;
  user_id: string;
  review_type: string;
  reference_id: string;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export const ContentModeration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userContent, setUserContent] = useState<ContentItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      // Fetch pending user content
      const { data: contentData, error: contentError } = await supabase
        .from('user_content')
        .select(`
          id,
          user_id,
          content_type,
          content_url,
          title,
          description,
          content_reference_type,
          content_reference_id,
          status,
          created_at
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;

      // Fetch pending reviews
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          review_type,
          reference_id,
          rating,
          title,
          content,
          status,
          created_at
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (reviewError) throw reviewError;

      // Fetch profiles for content
      const contentUserIds = [...new Set(contentData.map((c: any) => c.user_id))];
      const { data: contentProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', contentUserIds);

      // Fetch profiles for reviews
      const reviewUserIds = [...new Set(reviewData.map((r: any) => r.user_id))];
      const { data: reviewProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', reviewUserIds);

      // Merge profiles
      const contentWithProfiles = contentData.map((item: any) => ({
        ...item,
        profiles: contentProfiles?.find(p => p.user_id === item.user_id) || null
      }));

      const reviewsWithProfiles = reviewData.map((item: any) => ({
        ...item,
        profiles: reviewProfiles?.find(p => p.user_id === item.user_id) || null
      }));

      setUserContent(contentWithProfiles as ContentItem[]);
      setReviews(reviewsWithProfiles as Review[]);
    } catch (error) {
      console.error('Error fetching pending content:', error);
      toast({
        title: "Error",
        description: "Failed to load pending content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerateContent = async (contentId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('user_content')
        .update({
          status,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString(),
          moderation_notes: moderationNotes || null
        })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? "Content approved" : "Content rejected",
        description: `Content has been ${status}`
      });

      setModerationNotes("");
      setPreviewItem(null);
      fetchPendingContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to moderate content",
        variant: "destructive"
      });
    }
  };

  const handleModerateReview = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? "Review approved" : "Review rejected",
        description: `Review has been ${status}`
      });

      fetchPendingContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to moderate review",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">
            User Content ({userContent.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                Loading pending content...
              </CardContent>
            </Card>
          ) : userContent.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending content to review
              </CardContent>
            </Card>
          ) : (
            userContent.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {item.content_type === 'video' ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 text-sm">
                    <p><strong>Submitted by:</strong> {item.profiles?.full_name || 'Unknown'}</p>
                    <p><strong>Type:</strong> {item.content_type}</p>
                    <p><strong>Reference:</strong> {item.content_reference_type} #{item.content_reference_id}</p>
                    <p><strong>Date:</strong> {format(new Date(item.created_at), 'PPp')}</p>
                    {item.description && <p><strong>Description:</strong> {item.description}</p>}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewItem(item)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleModerateContent(item.id, 'approved')}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleModerateContent(item.id, 'rejected')}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                Loading pending reviews...
              </CardContent>
            </Card>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending reviews to moderate
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {review.title || `Review for ${review.review_type}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 text-sm">
                    <p><strong>Submitted by:</strong> {review.profiles?.full_name || 'Unknown'}</p>
                    <p><strong>Rating:</strong> {review.rating}/5 stars</p>
                    <p><strong>Type:</strong> {review.review_type} #{review.reference_id}</p>
                    <p><strong>Date:</strong> {format(new Date(review.created_at), 'PPp')}</p>
                    <div>
                      <strong>Content:</strong>
                      <p className="mt-1 p-3 bg-muted rounded-md">{review.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleModerateReview(review.id, 'approved')}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleModerateReview(review.id, 'rejected')}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewItem?.content_type === 'video' ? (
              <video src={previewItem.content_url} controls className="w-full rounded-lg" />
            ) : (
              <img src={previewItem?.content_url} alt={previewItem?.title} className="w-full rounded-lg" />
            )}
            
            {previewItem?.description && (
              <p className="text-sm">{previewItem.description}</p>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Moderation Notes (optional)</label>
              <Textarea
                placeholder="Add notes about why this content was approved/rejected"
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => previewItem && handleModerateContent(previewItem.id, 'approved')}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => previewItem && handleModerateContent(previewItem.id, 'rejected')}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
