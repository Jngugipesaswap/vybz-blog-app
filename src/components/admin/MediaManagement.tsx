import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MediaManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground mt-1">Manage your media files</p>
        </div>
        <Button className="btn-gradient">
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </div>

      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Media Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No media files uploaded yet
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
