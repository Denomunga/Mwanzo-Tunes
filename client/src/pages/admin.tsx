//client/src/pages/admin.tsx
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
  Share2,
  Sparkles,
  Star,
  Heart,
  TrendingUp,
  Activity
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
  // Only redirect after we're certain about the user state
  if (!isLoading) {
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      window.location.href = "/api/login";
    } else if (user && user.role !== 'admin') {
      console.log(`User role is ${user.role}, not admin - redirecting`);
      // Consider redirecting to a "access denied" page instead of login
      window.location.href = "/unauthorized";
    }
  }
}, [isAuthenticated, isLoading, user]);

  // Queries
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    //enabled: user?.role === 'admin',
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 hero-gradient-animated opacity-20"></div>
        
        {/* Floating Music Notes */}
        <div className="absolute top-1/4 left-5 animate-float-slow delay-100">
          <div className="text-primary/25 text-5xl">♪</div>
        </div>
        <div className="absolute top-1/3 right-16 animate-float-medium delay-300">
          <div className="text-primary/20 text-4xl">♫</div>
        </div>
        <div className="absolute bottom-1/4 left-1/4 animate-float-fast delay-500">
          <div className="text-primary/15 text-6xl">♩</div>
        </div>
        
        {/* Pulsing Circles */}
        <div className="absolute top-20 right-1/4">
          <div className="w-12 h-12 border-2 border-primary/25 rounded-full animate-ping-slow"></div>
        </div>
        <div className="absolute bottom-40 left-1/3">
          <div className="w-8 h-8 border-2 border-primary/20 rounded-full animate-ping-medium delay-300"></div>
        </div>
        
        {/* Particle System */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="particle animate-particle-float"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      <Navbar />
      
      <main className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Enhanced Header Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="glass rounded-full p-4 animate-glow">
                <Settings className="h-8 w-8 text-primary animate-spin-slow" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Admin Panel</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your website content, users, and settings
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6 animate-pulse-gentle"></div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 glass backdrop-blur-lg p-1">
              <TabsTrigger value="dashboard" className="hover-lift data-[state=active]:glass" data-testid="admin-tab-dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="users" className="hover-lift data-[state=active]:glass" data-testid="admin-tab-users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="content" className="hover-lift data-[state=active]:glass" data-testid="admin-tab-content">
                <Settings className="mr-2 h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="social" className="hover-lift data-[state=active]:glass" data-testid="admin-tab-social">
                <Share2 className="mr-2 h-4 w-4" />
                Social Media
              </TabsTrigger>
              <TabsTrigger value="settings" className="hover-lift data-[state=active]:glass" data-testid="admin-tab-settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Dashboard */}
            <TabsContent value="dashboard" className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="hover-lift glass backdrop-blur-lg animate-fade-in-up delay-100 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Events</p>
                        <p className="text-3xl font-bold text-gradient" data-testid="admin-stat-events">{events?.length || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:animate-glow">
                        <Calendar className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover-lift glass backdrop-blur-lg animate-fade-in-up delay-200 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Songs</p>
                        <p className="text-3xl font-bold text-gradient" data-testid="admin-stat-songs">{songs?.length || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:animate-glow">
                        <Music className="h-6 w-6 text-primary animate-bounce" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover-lift glass backdrop-blur-lg animate-fade-in-up delay-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Users</p>
                        <p className="text-3xl font-bold text-gradient" data-testid="admin-stat-users">{users?.length || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:animate-glow">
                        <Users className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover-lift glass backdrop-blur-lg animate-fade-in-up delay-400 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Contact Info</p>
                        <p className="text-3xl font-bold text-gradient" data-testid="admin-stat-contacts">{contacts?.length || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:animate-glow">
                        <Activity className="h-6 w-6 text-primary animate-spin-slow" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass backdrop-blur-lg animate-fade-in-up delay-500">
                <CardHeader>
                  <CardTitle className="text-gradient flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 animate-pulse" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                      <span className="text-sm">System initialized successfully</span>
                      <span className="text-muted-foreground text-xs ml-auto">Just now</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping delay-300"></div>
                      <span className="text-sm">Admin panel accessed</span>
                      <span className="text-muted-foreground text-xs ml-auto">Now</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping delay-600"></div>
                      <span className="text-sm">Dashboard statistics updated</span>
                      <span className="text-muted-foreground text-xs ml-auto">Now</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Users Management */}
            <TabsContent value="users" className="space-y-6 animate-fade-in-up">
              <Card className="glass backdrop-blur-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gradient">User Management</CardTitle>
                  <Button variant="outline" className="hover-lift glass" data-testid="admin-add-staff">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <Sparkles className="mr-2 h-3 w-3 animate-spin-slow" />
                    Add Staff
                    <Star className="ml-2 h-3 w-3 animate-pulse" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-primary/20">
                          <th className="text-left p-4 text-muted-foreground">User</th>
                          <th className="text-left p-4 text-muted-foreground">Role</th>
                          <th className="text-left p-4 text-muted-foreground">Email</th>
                          <th className="text-left p-4 text-muted-foreground">Joined</th>
                          <th className="text-left p-4 text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users?.map((user: any, index: number) => (
                          <tr key={user.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}} data-testid={`admin-user-row-${user.id}`}>
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                                </div>
                                <span className="font-medium">{user.firstName || user.email}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={`${getRoleBadgeColor(user.role)} text-white font-semibold`} data-testid={`admin-user-role-${user.id}`}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium" data-testid={`admin-user-email-${user.id}`}>{user.email}</td>
                            <td className="p-4 text-muted-foreground" data-testid={`admin-user-date-${user.id}`}>
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingUser(user)}
                                  className="hover-lift hover:bg-blue-500/10"
                                  data-testid={`admin-edit-user-${user.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {user.id !== 'admin-default' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteUserMutation.mutate(user.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 hover-lift"
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

            {/* Enhanced Content Management */}
            <TabsContent value="content" className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass backdrop-blur-lg hover-lift">
                  <CardHeader>
                    <CardTitle className="text-gradient flex items-center">
                      <Settings className="mr-2 h-5 w-5 animate-pulse" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start hover-lift glass" asChild data-testid="admin-manage-events">
                      <a href="/events" className="flex items-center">
                        <Calendar className="mr-3 h-5 w-5 text-primary animate-bounce" />
                        Manage Events
                        <Sparkles className="ml-auto h-4 w-4 animate-spin-slow" />
                      </a>
                    </Button>
                    <Button className="w-full justify-start hover-lift glass" asChild data-testid="admin-manage-songs">
                      <a href="/songs" className="flex items-center">
                        <Music className="mr-3 h-5 w-5 text-primary animate-pulse" />
                        Manage Songs
                        <Star className="ml-auto h-4 w-4 animate-pulse" />
                      </a>
                    </Button>
                    <Button className="w-full justify-start hover-lift glass" asChild data-testid="admin-manage-about">
                      <a href="/about" className="flex items-center">
                        <Edit className="mr-3 h-5 w-5 text-primary animate-bounce" />
                        Edit About Section
                        <Sparkles className="ml-auto h-4 w-4 animate-spin-slow" />
                      </a>
                    </Button>
                    <Button className="w-full justify-start hover-lift glass" asChild data-testid="admin-manage-contacts">
                      <a href="/contact" className="flex items-center">
                        <Activity className="mr-3 h-5 w-5 text-primary animate-pulse" />
                        Manage Contacts
                        <Star className="ml-auto h-4 w-4 animate-pulse" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass backdrop-blur-lg hover-lift">
                  <CardHeader>
                    <CardTitle className="text-gradient flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 animate-pulse" />
                      Content Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          Published Events
                        </span>
                        <span className="font-semibold text-gradient text-lg">{events?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="flex items-center">
                          <Music className="mr-2 h-4 w-4 text-primary" />
                          Available Songs
                        </span>
                        <span className="font-semibold text-gradient text-lg">{songs?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="flex items-center">
                          <Activity className="mr-2 h-4 w-4 text-primary" />
                          Contact Methods
                        </span>
                        <span className="font-semibold text-gradient text-lg">{contacts?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                        <span className="flex items-center">
                          <Share2 className="mr-2 h-4 w-4 text-primary" />
                          Social Media Links
                        </span>
                        <span className="font-semibold text-gradient text-lg">{socialMedia?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Enhanced Social Media Management */}
            <TabsContent value="social" className="space-y-6 animate-fade-in-up">
              <Card className="glass backdrop-blur-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gradient">Social Media Links</CardTitle>
                  <Dialog open={socialDialogOpen} onOpenChange={setSocialDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="hover-lift animate-bounce-gentle glass" data-testid="admin-add-social">
                        <Plus className="mr-2 h-4 w-4" />
                        <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                        Add Social Link
                        <Star className="ml-2 h-4 w-4 animate-pulse" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass backdrop-blur-lg border-primary/20 animate-fade-in-up">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-gradient text-center">Add Social Media Link</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateSocialMedia} className="space-y-6" data-testid="admin-form-social">
                        <div className="space-y-2">
                          <Label htmlFor="platform" className="text-sm font-medium">Platform</Label>
                          <Select name="platform" required>
                            <SelectTrigger className="glass border-primary/20" data-testid="admin-select-platform">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent className="glass backdrop-blur-lg border-primary/20">
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="x">X (Twitter)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="url" className="text-sm font-medium">URL</Label>
                          <Input 
                            id="url" 
                            name="url" 
                            type="url" 
                            required 
                            className="glass border-primary/20 focus:border-primary"
                            placeholder="https://..."
                            data-testid="admin-input-social-url"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full hover-lift glass animate-pulse-gentle" 
                          disabled={createSocialMediaMutation.isPending}
                          data-testid="admin-submit-social"
                        >
                          {createSocialMediaMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Add Link
                              <Share2 className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {socialMedia?.length ? (
                      socialMedia.map((social: any, index: number) => (
                        <Card key={social.id} className="hover-lift glass backdrop-blur-lg animate-fade-in-up group" style={{animationDelay: `${index * 100}ms`}} data-testid={`admin-social-${social.id}`}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:animate-glow">
                                  <Share2 className="h-5 w-5 text-primary animate-pulse" />
                                </div>
                                <div>
                                  <h4 className="font-semibold capitalize text-gradient">{social.platform}</h4>
                                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">{social.url}</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteSocialMediaMutation.mutate(social.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 hover-lift"
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
                      <div className="col-span-full text-center py-12 animate-fade-in">
                        <div className="glass rounded-2xl p-8 max-w-md mx-auto">
                          <Share2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                          <h3 className="text-xl font-semibold mb-2">No Social Links</h3>
                          <p className="text-muted-foreground">Add your first social media link to get started.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Settings */}
            <TabsContent value="settings" className="space-y-6 animate-fade-in-up">
              <Card className="glass backdrop-blur-lg hover-lift">
                <CardHeader>
                  <CardTitle className="text-gradient flex items-center">
                    <Settings className="mr-2 h-5 w-5 animate-spin-slow" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 text-center py-8">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-gentle">
                      <Settings className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-lg">Additional settings will be available in future updates.</p>
                    <div className="flex justify-center space-x-2 mt-4">
                      <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-ping delay-300"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-ping delay-600"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Enhanced Edit User Role Modal */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="glass backdrop-blur-lg border-primary/20 animate-fade-in-up">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gradient text-center">Edit User Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUserRole} className="space-y-6" data-testid="admin-form-edit-user">
              <div className="text-center">
                <Label className="text-lg font-medium">User: {editingUser.firstName || editingUser.email}</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <Select name="role" defaultValue={editingUser.role} required>
                  <SelectTrigger className="glass border-primary/20" data-testid="admin-select-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass backdrop-blur-lg border-primary/20">
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full hover-lift glass animate-pulse-gentle" 
                disabled={updateUserRoleMutation.isPending}
                data-testid="admin-submit-user-role"
              >
                {updateUserRoleMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Update Role
                    <Star className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
      
      <Footer />
    </div>
  );
}