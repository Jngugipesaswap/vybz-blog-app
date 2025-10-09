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
    <section id="blog" className="py-16 bg-black relative overflow-hidden">
      {/* Subtle decorative element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 px-4 pt-16">
          <Badge className="mb-6 bg-black border-2 border-primary text-primary px-6 py-3 text-sm font-bold uppercase tracking-widest">
            Latest Stories
          </Badge>
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black mb-6 leading-tight uppercase tracking-tight text-white">
            Entertainment <span className="text-primary">Insights</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed uppercase tracking-wide">
            Stay updated with the latest trends and insider tips
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className={`${post.featured ? 'lg:col-span-2 lg:row-span-1' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card
                className={`group cursor-pointer overflow-hidden h-full transition-all duration-500 bg-black/60 backdrop-blur-sm ${
                  post.featured 
                    ? 'border-2 border-primary' 
                    : 'border-2 border-primary/30 hover:border-primary'
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
                      <Badge className="absolute top-4 left-4 bg-primary text-black text-sm font-black px-4 py-2 uppercase">
                        Featured
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

                    <Badge className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border-2 border-primary/40 text-primary text-sm font-bold px-4 py-2 uppercase">
                      {post.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className={`${post.featured ? 'p-6 sm:p-8' : 'p-5 sm:p-7'}`}>
                  <h3 className={`${post.featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black mb-4 line-clamp-2 text-white uppercase tracking-tight group-hover:text-primary transition-colors`}>
                    {post.title}
                  </h3>

                  <p className={`text-white/60 mb-6 line-clamp-3 ${post.featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      className={`${post.featured ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-full object-cover border-2 border-primary/40`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold ${post.featured ? 'text-base' : 'text-sm'} truncate text-white`}>{post.author}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-white/50">
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
                        className="flex items-center gap-2 text-base text-white/60 hover:text-red-500 transition-all duration-300"
                      >
                        <Heart
                          className={`w-5 h-5 transition-all ${
                            likedPosts.has(post.id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                        <span className="hidden sm:inline font-semibold">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                      </button>
                      <div className="flex items-center gap-2 text-base text-white/60 cursor-pointer hover:text-primary transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="hidden sm:inline font-semibold">{post.comments}</span>
                      </div>
                      <div>
                        <ShareButton 
                          title={post.title}
                          description={post.excerpt}
                        />
                      </div>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary/80 text-black font-black text-sm sm:text-base px-5 py-2 uppercase">
                      <span className="hidden sm:inline">Read</span>
                      <ArrowRight className="w-4 h-4 sm:ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/80 text-black font-black text-lg px-12 py-6 uppercase tracking-wider w-full sm:w-auto"
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