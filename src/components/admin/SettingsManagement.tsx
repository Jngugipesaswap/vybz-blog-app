import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function SettingsManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Platform Settings</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Configure site title, logo, SEO settings, email templates, notification preferences,
            security settings, and third-party integrations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
