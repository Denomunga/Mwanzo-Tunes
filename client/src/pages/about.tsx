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
import { Edit, User, Sparkles, Star, Music, Users, Mic2, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AboutContent } from "@/types";

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
        <div className="absolute top-1/2 right-1/3 animate-float-slow delay-700">
          <div className="text-primary/25 text-3xl">♬</div>
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
          {[...Array(10)].map((_, i) => (
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
                <Users className="h-8 w-8 text-primary animate-spin-slow" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gradient">About Kiarutara</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the story behind <span className="text-primary font-semibold">MWANZO BOYS</span>
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6 animate-pulse-gentle"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Enhanced Image Section */}
            <div className="animate-fade-in-left">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-gentle group hover:animate-glow">
                  <User className="h-24 w-24 text-primary animate-bounce" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-ping-slow">
                  <Star className="h-6 w-6 text-white animate-spin-slow" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-primary/80 rounded-full flex items-center justify-center animate-ping-medium delay-500">
                  <Music className="h-4 w-4 text-white animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Enhanced Content Section */}
            <div className="animate-fade-in-right">
              <div className="glass rounded-2xl p-8 backdrop-blur-lg">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-gradient">Our Story</h2>
                  {isAdmin && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover-lift animate-bounce-gentle"
                          data-testid="button-edit-about"
                        >
                          <Edit className="h-5 w-5" />
                          <Sparkles className="h-3 w-3 absolute -top-1 -right-1 animate-pulse" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass backdrop-blur-lg border-primary/20 max-w-2xl animate-fade-in-up">
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-gradient text-center">Edit About Content</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateAbout} className="space-y-6" data-testid="form-edit-about">
                          <div className="space-y-2">
                            <Label htmlFor="content" className="text-sm font-medium">About Content</Label>
                            <Textarea 
                              id="content" 
                              name="content" 
                              rows={8}
                              className="glass border-primary/20 focus:border-primary"
                              defaultValue={aboutContent?.content || ""}
                              required 
                              data-testid="textarea-about-content"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="albums" className="text-sm font-medium flex items-center">
                                <Music className="h-4 w-4 mr-1" />
                                Albums
                              </Label>
                              <Input 
                                id="albums" 
                                name="albums" 
                                type="number"
                                className="glass border-primary/20 focus:border-primary"
                                defaultValue={aboutContent?.stats?.albums || 12}
                                data-testid="input-albums-count"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="concerts" className="text-sm font-medium flex items-center">
                                <Mic2 className="h-4 w-4 mr-1" />
                                Concerts
                              </Label>
                              <Input 
                                id="concerts" 
                                name="concerts"
                                className="glass border-primary/20 focus:border-primary"
                                defaultValue={aboutContent?.stats?.concerts || "150+"}
                                data-testid="input-concerts-count"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fans" className="text-sm font-medium flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                Fans
                              </Label>
                              <Input 
                                id="fans" 
                                name="fans"
                                className="glass border-primary/20 focus:border-primary"
                                defaultValue={aboutContent?.stats?.fans || "50K+"}
                                data-testid="input-fans-count"
                              />
                            </div>
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full hover-lift glass animate-pulse-gentle" 
                            disabled={updateAboutMutation.isPending}
                            data-testid="button-save-about"
                          >
                            {updateAboutMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving Changes...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Save Changes
                                <Star className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                <div className="space-y-6 text-muted-foreground mb-8 leading-relaxed" data-testid="text-about-content">
                  {aboutContent?.content ? (
                    <p className="text-lg">{aboutContent.content}</p>
                  ) : (
                    <>
                      <p className="text-lg">
                        Kiarutara MWANZOBOYS is a rising star in the music industry, known for their unique blend of traditional and contemporary sounds. With roots deeply embedded in cultural heritage, their music tells stories that resonate across generations.
                      </p>
                      
                      <p className="text-lg">
                        Starting their musical journey at a young age, Kiarutara has evolved into a versatile artist capable of delivering powerful performances across multiple genres. Their dedication to authenticity and innovation has earned them a loyal following and critical acclaim.
                      </p>
                      
                      <p className="text-lg">
                        With several successful releases and memorable live performances, Kiarutara MWANZOBOYS continues to push boundaries and create music that inspires and entertains audiences worldwide.
                      </p>
                    </>
                  )}
                </div>
                
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-3 gap-6">
                  <Card className="hover-lift glass backdrop-blur-lg animate-fade-in-up delay-100 group">
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:animate-glow">
                          <Music className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gradient mb-1" data-testid="text-stat-albums">
                        {aboutContent?.stats?.albums || 12}
                      </div>
                      <div className="text-sm text-muted-foreground">Albums</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover-lift glass backdrop-blur-lg animate-fade-in-up delay-200 group">
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:animate-glow">
                          <Mic2 className="h-6 w-6 text-primary animate-bounce" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gradient mb-1" data-testid="text-stat-concerts">
                        {aboutContent?.stats?.concerts || "150+"}
                      </div>
                      <div className="text-sm text-muted-foreground">Concerts</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover-lift glass backdrop-blur-lg animate-fade-in-up delay-300 group">
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:animate-glow">
                          <Heart className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gradient mb-1" data-testid="text-stat-fans">
                        {aboutContent?.stats?.fans || "50K+"}
                      </div>
                      <div className="text-sm text-muted-foreground">Fans</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Mission Section */}
          <div className="mt-20 text-center animate-fade-in-up delay-500">
            <div className="glass rounded-2xl p-12 backdrop-blur-lg max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-gradient">Our Mission</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                To create music that transcends boundaries, connects cultures, and inspires generations through authentic storytelling and innovative soundscapes.
              </p>
              <div className="flex justify-center mt-8 space-x-4">
                <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-ping delay-300"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-ping delay-600"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}