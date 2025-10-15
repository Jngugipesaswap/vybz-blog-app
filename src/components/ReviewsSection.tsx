import { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  helpful_count: number;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReviewsSectionProps {
  referenceType: 'event' | 'venue' | 'post';
  referenceId: string;
}

export const ReviewsSection = ({ referenceType, referenceId }: ReviewsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [referenceType, referenceId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          rating,
          title,
          content,
          helpful_count,
          created_at
        `)
        .eq('review_type', referenceType)
        .eq('reference_id', referenceId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data.map((r: any) => r.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      // Merge profiles with reviews
      const reviewsWithProfiles = data.map((review: any) => ({
        ...review,
        profiles: profilesData?.find(p => p.user_id === review.user_id) || null
      }));

      setReviews(reviewsWithProfiles as Review[]);

      // Check if current user has reviewed
      if (user) {
        const userReview = data.find((r: any) => r.user_id === user.id);
        setUserHasReviewed(!!userReview);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review",
        variant: "destructive"
      });
      return;
    }

    if (rating === 0 || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a rating and review content",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          review_type: referenceType,
          reference_id: referenceId,
          rating,
          title: title.trim() || null,
          content: content.trim(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Your review will appear after moderation"
      });

      setRating(0);
      setTitle("");
      setContent("");
      setDialogOpen(false);
      setUserHasReviewed(true);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to mark reviews as helpful",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('review_helpful')
        .insert({
          review_id: reviewId,
          user_id: user.id
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already marked",
            description: "You've already marked this review as helpful"
          });
        } else {
          throw error;
        }
        return;
      }

      // Update helpful count
      await supabase
        .from('reviews')
        .update({ helpful_count: reviews.find(r => r.id === reviewId)!.helpful_count + 1 })
        .eq('id', reviewId);

      fetchReviews();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const StarRating = ({ value, interactive = false, onHover, onClick }: any) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            star <= (interactive ? (hoveredRating || value) : value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          }`}
          onMouseEnter={() => interactive && onHover?.(star)}
          onMouseLeave={() => interactive && onHover?.(0)}
          onClick={() => interactive && onClick?.(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Reviews ({reviews.length})
            </CardTitle>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating value={Math.round(parseFloat(averageRating))} />
                <span className="text-lg font-semibold">{averageRating}</span>
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>
          {!userHasReviewed && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Write a Review</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Write Your Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating *</label>
                    <StarRating
                      value={rating}
                      interactive
                      onHover={setHoveredRating}
                      onClick={setRating}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title (optional)</label>
                    <Input
                      placeholder="Summarize your experience"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review *</label>
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={1000}
                      rows={5}
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting || rating === 0 || !content.trim()}
                    className="w-full"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Your review will be published after moderation
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {review.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {review.profiles?.full_name || 'Anonymous User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <StarRating value={review.rating} />
                      </div>
                      {review.title && (
                        <p className="font-medium">{review.title}</p>
                      )}
                      <p className="text-sm">{review.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleMarkHelpful(review.id)}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful_count})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
