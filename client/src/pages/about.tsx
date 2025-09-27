import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AboutContent } from "@shared/schema";

export default function About() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: aboutContent } = useQuery<AboutContent>({
    queryKey: ["/api/about"],
  });

  const updateAboutMutation = useMutation({
    mutationFn: async (contentData: any) => {
      await apiRequest("PUT", "/api/about", contentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "About content updated successfully",
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
        description: "Failed to update about content",
        variant: "destructive",
      });
    },
  });

  const handleUpdateAbout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contentData = {
      content: formData.get("content") as string,
      stats: {
        albums: parseInt(formData.get("albums") as string) || 0,
        concerts: formData.get("concerts") as string,
        fans: formData.get("fans") as string,
      },
    };
    updateAboutMutation.mutate(contentData);
  };

  const isAdmin = user?.role === 'admin';

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center shadow-2xl">
                <User className="h-24 w-24 text-primary" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">About Kiarutara</h1>
                {isAdmin && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid="button-edit-about">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit About Content</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdateAbout} className="space-y-4" data-testid="form-edit-about">
                        <div>
                          <Label htmlFor="content">About Content</Label>
                          <Textarea 
                            id="content" 
                            name="content" 
                            rows={8}
                            defaultValue={aboutContent?.content || ""}
                            required 
                            data-testid="textarea-about-content"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="albums">Albums</Label>
                            <Input 
                              id="albums" 
                              name="albums" 
                              type="number"
                              defaultValue={aboutContent?.stats?.albums || 12}
                              data-testid="input-albums-count"
                            />
                          </div>
                          <div>
                            <Label htmlFor="concerts">Concerts</Label>
                            <Input 
                              id="concerts" 
                              name="concerts"
                              defaultValue={aboutContent?.stats?.concerts || "150+"}
                              data-testid="input-concerts-count"
                            />
                          </div>
                          <div>
                            <Label htmlFor="fans">Fans</Label>
                            <Input 
                              id="fans" 
                              name="fans"
                              defaultValue={aboutContent?.stats?.fans || "50K+"}
                              data-testid="input-fans-count"
                            />
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={updateAboutMutation.isPending}
                          data-testid="button-save-about"
                        >
                          {updateAboutMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <div className="space-y-6 text-muted-foreground mb-8" data-testid="text-about-content">
                {aboutContent?.content ? (
                  <p>{aboutContent.content}</p>
                ) : (
                  <>
                    <p>
                      Kiarutara MWANZOBOYS is a rising star in the music industry, known for their unique blend of traditional and contemporary sounds. With roots deeply embedded in cultural heritage, their music tells stories that resonate across generations.
                    </p>
                    
                    <p>
                      Starting their musical journey at a young age, Kiarutara has evolved into a versatile artist capable of delivering powerful performances across multiple genres. Their dedication to authenticity and innovation has earned them a loyal following and critical acclaim.
                    </p>
                    
                    <p>
                      With several successful releases and memorable live performances, Kiarutara MWANZOBOYS continues to push boundaries and create music that inspires and entertains audiences worldwide.
                    </p>
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-1" data-testid="text-stat-albums">
                      {aboutContent?.stats?.albums || 12}
                    </div>
                    <div className="text-sm text-muted-foreground">Albums</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-1" data-testid="text-stat-concerts">
                      {aboutContent?.stats?.concerts || "150+"}
                    </div>
                    <div className="text-sm text-muted-foreground">Concerts</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-1" data-testid="text-stat-fans">
                      {aboutContent?.stats?.fans || "50K+"}
                    </div>
                    <div className="text-sm text-muted-foreground">Fans</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
