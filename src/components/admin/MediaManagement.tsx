import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Upload, Folder, File, TrendingUp, HardDrive, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function MediaManagement() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mediaStats = {
    totalFiles: 156,
    totalSize: "2.4 GB",
    images: 98,
    videos: 12,
    documents: 46,
  };

  const mockFiles = [
    { id: 1, name: "hero-image.jpg", type: "image", size: "2.4 MB", date: "2024-01-15" },
    { id: 2, name: "event-poster.png", type: "image", size: "1.8 MB", date: "2024-01-14" },
    { id: 3, name: "presentation.pdf", type: "document", size: "5.2 MB", date: "2024-01-13" },
    { id: 4, name: "intro-video.mp4", type: "video", size: "24.8 MB", date: "2024-01-12" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-cta bg-clip-text text-transparent">
            Media Library
          </h1>
          <p className="text-muted-foreground mt-1">Manage your media files and assets</p>
        </div>
        <Button className="btn-gradient shadow-hover">
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle>
            <File className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mediaStats.totalFiles}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+12</span>
              <span className="ml-1">this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
            <HardDrive className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mediaStats.totalSize}</div>
            <p className="text-xs text-muted-foreground mt-2">of 10 GB</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Images</CardTitle>
            <Image className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mediaStats.images}</div>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Videos</CardTitle>
            <File className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mediaStats.videos}</div>
            <p className="text-xs text-muted-foreground mt-2">MP4, MOV</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
            <Folder className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mediaStats.documents}</div>
            <p className="text-xs text-muted-foreground mt-2">PDF, DOC, etc</p>
          </CardContent>
        </Card>
      </div>

      {/* Media Browser */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Media Files
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {mockFiles.map((file) => (
                <Card key={file.id} className="hover-lift group cursor-pointer overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    {file.type === "image" && <Image className="h-12 w-12 text-primary" />}
                    {file.type === "video" && <File className="h-12 w-12 text-primary" />}
                    {file.type === "document" && <Folder className="h-12 w-12 text-primary" />}
                  </div>
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-sm truncate">{file.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {file.size}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{file.date}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {mockFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {file.type === "image" && <Image className="h-5 w-5 text-primary" />}
                      {file.type === "video" && <File className="h-5 w-5 text-primary" />}
                      {file.type === "document" && <Folder className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">{file.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Badge variant="secondary">{file.size}</Badge>
                    <span className="text-sm text-muted-foreground w-24">{file.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
