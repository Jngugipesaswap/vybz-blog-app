import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Shield } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchUsers();
    fetchUserRoles();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch users");
      return;
    }

    setUsers(data || []);
  };

  const fetchUserRoles = async () => {
    const { data, error } = await supabase.from("user_roles").select("*");

    if (error) {
      toast.error("Failed to fetch user roles");
      return;
    }

    const rolesMap: Record<string, string[]> = {};
    data?.forEach((role: UserRole) => {
      if (!rolesMap[role.user_id]) {
        rolesMap[role.user_id] = [];
      }
      rolesMap[role.user_id].push(role.role);
    });

    setUserRoles(rolesMap);
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "content_creator" | "user") => {
    // First, remove existing role
    await supabase.from("user_roles").delete().eq("user_id", userId);

    // Then, insert new role
    const { error } = await supabase.from("user_roles").insert([
      { user_id: userId, role: newRole },
    ]);

    if (error) {
      toast.error("Failed to update user role");
      return;
    }

    toast.success("User role updated successfully");
    fetchUserRoles();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Assign Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || "No name set"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {user.user_id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  {userRoles[user.user_id]?.map((role) => (
                    <Badge key={role} variant="secondary" className="mr-1">
                      <Shield className="h-3 w-3 mr-1" />
                      {role === 'admin' ? 'Master Admin' : role === 'content_creator' ? 'Content Creator' : 'User'}
                    </Badge>
                  )) || <Badge variant="outline">User</Badge>}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={userRoles[user.user_id]?.[0] || "user"}
                    onValueChange={(value) => handleRoleChange(user.user_id, value as "admin" | "content_creator" | "user")}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Master Admin</SelectItem>
                      <SelectItem value="content_creator">Content Creator</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
