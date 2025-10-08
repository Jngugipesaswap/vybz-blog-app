import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Clock, ArrowRight, Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import ShareButton from "@/components/ShareButton";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  publishDate: string;
  readTime: string;
  image: string;
  category: string;
  likes: number;
  comments: number;
  featured?: boolean;
}

interface BlogSectionProps {
  posts: BlogPost[];
}

const BlogSection = ({ posts }: BlogSectionProps) => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  return (
    <section id="blog" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 px-4">
          <Badge className="mb-4 bg-primary text-white px-4 py-2">
            Latest Stories
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Entertainment <span className="text-gradient">Insights</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest trends, venue reviews, and insider tips from Nairobi's entertainment scene.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post) => (
            <Card
              key={post.id}
              className={`group cursor-pointer hover-lift overflow-hidden ${
                post.featured ? 'ring-2 ring-primary shadow-hover' : 'shadow-card'
              }`}
            >
              <CardHeader className="p-0 relative">
                <div className="relative h-48 sm:h-52 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {post.featured && (
                    <Badge className="absolute top-3 left-3 bg-primary text-white text-xs">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  <Badge className="absolute bottom-3 left-3 bg-white/90 text-primary text-xs">
                    {post.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                <p className="text-muted-foreground mb-4 line-clamp-3 text-sm sm:text-base">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{post.author}</div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.publishDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(post.id);
                      }}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedPosts.has(post.id) ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                      <span className="hidden sm:inline">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                    </button>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">{post.comments}</span>
                    </div>
                    <ShareButton 
                      title={post.title}
                      description={post.excerpt}
                    />
                  </div>
                  <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 text-xs sm:text-sm">
                    <span className="hidden sm:inline">Read More</span>
                    <span className="sm:hidden">Read</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Button size="lg" variant="outline" className="hover:bg-primary hover:text-white w-full sm:w-auto">
            View All Articles
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;