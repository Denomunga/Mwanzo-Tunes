import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Music, 
  Settings, 
  Plus, 
  Trash2, 
  Edit,
  UserPlus,
  Share2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, Event, Song, Contact, SocialMedia } from "@shared/schema";

export default function Admin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Queries
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === 'admin',
  });

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: songs } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: socialMedia } = useQuery<SocialMedia[]>({
    queryKey: ["/api/social-media"],
  });

  // Mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const createSocialMediaMutation = useMutation({
    mutationFn: async (socialData: any) => {
      await apiRequest("POST", "/api/social-media", socialData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media"] });
      setSocialDialogOpen(false);
      toast({
        title: "Success",
        description: "Social media link added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add social media link",
        variant: "destructive",
      });
    },
  });

  const deleteSocialMediaMutation = useMutation({
    mutationFn: async (socialId: string) => {
      await apiRequest("DELETE", `/api/social-media/${socialId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media"] });
      toast({
        title: "Success",
        description: "Social media link deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete social media link",
        variant: "destructive",
      });
    },
  });

  const handleUpdateUserRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get("role") as string;
    if (editingUser) {
      updateUserRoleMutation.mutate({ userId: editingUser.id, role });
    }
  };

  const handleCreateSocialMedia = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const socialData = {
      platform: formData.get("platform") as string,
      url: formData.get("url") as string,
      isActive: true,
    };
    createSocialMediaMutation.mutate(socialData);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500 hover:bg-red-600";
      case "staff": return "bg-yellow-500 hover:bg-yellow-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your website content and users</p>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard" data-testid="admin-tab-dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="admin-tab-users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="content" data-testid="admin-tab-content">
                <Settings className="mr-2 h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="social" data-testid="admin-tab-social">
                <Share2 className="mr-2 h-4 w-4" />
                Social Media
              </TabsTrigger>
              <TabsTrigger value="settings" data-testid="admin-tab-settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Events</p>
                        <p className="text-3xl font-bold" data-testid="admin-stat-events">{events?.length || 0}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Songs</p>
                        <p className="text-3xl font-bold" data-testid="admin-stat-songs">{songs?.length || 0}</p>
                      </div>
                      <Music className="h-8 w-8 text-accent" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Users</p>
                        <p className="text-3xl font-bold" data-testid="admin-stat-users">{users?.length || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Contact Info</p>
                        <p className="text-3xl font-bold" data-testid="admin-stat-contacts">{contacts?.length || 0}</p>
                      </div>
                      <Settings className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">System initialized successfully</span>
                      <span className="text-muted-foreground text-xs ml-auto">Just now</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Admin panel accessed</span>
                      <span className="text-muted-foreground text-xs ml-auto">Now</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Management */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <Button variant="outline" data-testid="admin-add-staff">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Staff
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">User</th>
                          <th className="text-left p-4">Role</th>
                          <th className="text-left p-4">Email</th>
                          <th className="text-left p-4">Joined</th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users?.map((user: any) => (
                          <tr key={user.id} className="border-b" data-testid={`admin-user-row-${user.id}`}>
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                                </div>
                                <span>{user.firstName || user.email}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={getRoleBadgeColor(user.role)} data-testid={`admin-user-role-${user.id}`}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="p-4" data-testid={`admin-user-email-${user.id}`}>{user.email}</td>
                            <td className="p-4" data-testid={`admin-user-date-${user.id}`}>
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingUser(user)}
                                  data-testid={`admin-edit-user-${user.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {user.id !== 'admin-default' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteUserMutation.mutate(user.id)}
                                    className="text-destructive hover:text-destructive"
                                    data-testid={`admin-delete-user-${user.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Management */}
            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start" asChild data-testid="admin-manage-events">
                      <a href="/events">
                        <Calendar className="mr-2 h-4 w-4" />
                        Manage Events
                      </a>
                    </Button>
                    <Button className="w-full justify-start" asChild data-testid="admin-manage-songs">
                      <a href="/songs">
                        <Music className="mr-2 h-4 w-4" />
                        Manage Songs
                      </a>
                    </Button>
                    <Button className="w-full justify-start" asChild data-testid="admin-manage-about">
                      <a href="/about">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit About Section
                      </a>
                    </Button>
                    <Button className="w-full justify-start" asChild data-testid="admin-manage-contacts">
                      <a href="/contact">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Contacts
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Published Events</span>
                        <span className="font-semibold">{events?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Songs</span>
                        <span className="font-semibold">{songs?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contact Methods</span>
                        <span className="font-semibold">{contacts?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Social Media Links</span>
                        <span className="font-semibold">{socialMedia?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Social Media Management */}
            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Social Media Links</CardTitle>
                  <Dialog open={socialDialogOpen} onOpenChange={setSocialDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="admin-add-social">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Social Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Social Media Link</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateSocialMedia} className="space-y-4" data-testid="admin-form-social">
                        <div>
                          <Label htmlFor="platform">Platform</Label>
                          <Select name="platform" required>
                            <SelectTrigger data-testid="admin-select-platform">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="x">X (Twitter)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="url">URL</Label>
                          <Input 
                            id="url" 
                            name="url" 
                            type="url" 
                            required 
                            placeholder="https://..."
                            data-testid="admin-input-social-url"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={createSocialMediaMutation.isPending}
                          data-testid="admin-submit-social"
                        >
                          {createSocialMediaMutation.isPending ? "Adding..." : "Add Link"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialMedia?.length ? (
                      socialMedia.map((social: any) => (
                        <Card key={social.id} data-testid={`admin-social-${social.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold capitalize">{social.platform}</h4>
                                <p className="text-sm text-muted-foreground">{social.url}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteSocialMediaMutation.mutate(social.id)}
                                  className="text-destructive hover:text-destructive"
                                  data-testid={`admin-delete-social-${social.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No social media links configured yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Additional settings will be available here.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit User Role Modal */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUserRole} className="space-y-4" data-testid="admin-form-edit-user">
              <div>
                <Label>User: {editingUser.firstName || editingUser.email}</Label>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={editingUser.role} required>
                  <SelectTrigger data-testid="admin-select-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={updateUserRoleMutation.isPending}
                data-testid="admin-submit-user-role"
              >
                {updateUserRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
      
      <Footer />
    </div>
  );
}
