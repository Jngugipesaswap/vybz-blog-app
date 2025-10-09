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
    <section id="blog" className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 px-4 scroll-reveal">
          <Badge className="mb-6 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 text-base font-bold interactive-badge">
            Latest Stories
          </Badge>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Entertainment <span className="text-gradient-animated neon-glow">Insights</span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest trends, venue reviews, and insider tips from Nairobi's entertainment scene.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className={`scroll-reveal ${post.featured ? 'lg:col-span-2 lg:row-span-1' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={post.featured ? 'gradient-border' : ''}>
                <Card
                  className={`group cursor-pointer magnetic-hover tilt-3d overflow-hidden h-full transition-all duration-500 ${
                    post.featured 
                      ? 'gradient-border-content spotlight shadow-hover scale-105' 
                      : 'shadow-card hover:shadow-hover'
                  }`}
                >
                <CardHeader className="p-0 relative">
                  <div className={`relative overflow-hidden ${post.featured ? 'h-64 sm:h-80' : 'h-56 sm:h-64'}`}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {post.featured && (
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-primary to-accent text-white text-sm font-bold px-4 py-2 animate-pulse-glow">
                        ⭐ Featured
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/80 transition-all duration-500"></div>

                    <Badge className="absolute bottom-4 left-4 bg-white/95 text-primary text-sm font-bold px-4 py-2 interactive-badge backdrop-blur-sm">
                      {post.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className={`${post.featured ? 'p-6 sm:p-8' : 'p-5 sm:p-7'}`}>
                  <h3 className={`${post.featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold mb-4 line-clamp-2 group-hover:text-gradient-animated transition-all duration-300`}>
                    {post.title}
                  </h3>

                  <p className={`text-muted-foreground mb-6 line-clamp-3 ${post.featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      className={`${post.featured ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-full object-cover ring-2 ring-primary/20 hover-scale`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold ${post.featured ? 'text-base' : 'text-sm'} truncate`}>{post.author}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{post.publishDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t-2 border-primary/20">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(post.id);
                        }}
                        className="flex items-center gap-2 text-base text-muted-foreground hover:text-red-500 transition-all duration-300 hover-scale"
                      >
                        <Heart
                          className={`w-5 h-5 transition-all ${
                            likedPosts.has(post.id) ? 'fill-red-500 text-red-500 animate-heartbeat' : ''
                          }`}
                        />
                        <span className="hidden sm:inline font-semibold">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                      </button>
                      <div className="flex items-center gap-2 text-base text-muted-foreground hover-scale cursor-pointer hover:text-primary transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="hidden sm:inline font-semibold">{post.comments}</span>
                      </div>
                      <div className="hover-scale">
                        <ShareButton 
                          title={post.title}
                          description={post.excerpt}
                        />
                      </div>
                    </div>
                    <Button size="sm" className="cta-gradient text-white font-bold text-sm sm:text-base px-5 py-2 hover-lift hover-glow">
                      <span className="hidden sm:inline">Read More</span>
                      <span className="sm:hidden">Read</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="cta-gradient text-white font-bold text-xl px-12 py-6 hover-lift hover-glow transition-spring w-full sm:w-auto"
          >
            View All Articles
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;