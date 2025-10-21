import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SearchFilters {
  query: string;
  category?: string;
  contentType?: string;
  status?: string;
  dateRange?: string;
  sortBy?: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  categories?: Array<{ id: string; name: string }>;
}

export const AdvancedSearch = ({ onSearch, categories = [] }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Count active filters
    const count = Object.values({ ...filters, [key]: value }).filter(v => v && v !== '').length - 1; // -1 to exclude query
    setActiveFiltersCount(count);
  };

  const clearFilters = () => {
    setFilters({ query: filters.query });
    setActiveFiltersCount(0);
    onSearch({ query: filters.query });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="search"
            placeholder="Search events, venues, content..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 flex items-center justify-center p-0"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>
                Refine your search with detailed filters
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => updateFilter('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select 
                  value={filters.contentType} 
                  onValueChange={(value) => updateFilter('contentType', value)}
                >
                  <SelectTrigger id="contentType">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="photo">Photos</SelectItem>
                    <SelectItem value="review">Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateRange">Date Range</Label>
                <Select 
                  value={filters.dateRange} 
                  onValueChange={(value) => updateFilter('dateRange', value)}
                >
                  <SelectTrigger id="dateRange">
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue placeholder="Relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Relevance</SelectItem>
                    <SelectItem value="date_desc">Newest first</SelectItem>
                    <SelectItem value="date_asc">Oldest first</SelectItem>
                    <SelectItem value="popular">Most popular</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  onClick={handleSearch}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button type="submit">Search</Button>
      </form>
    </div>
  );
};
