import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

export function MediaManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Media Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Image className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Media Management</h3>
          <p className="text-muted-foreground">
            Upload and manage images, videos, and other media files. This feature will be implemented with file storage integration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
