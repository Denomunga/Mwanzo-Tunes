import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import YoutubePlayer from "@/components/youtube-player";
import SongPlayer from "@/components/song-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Music, Plus, Trash2, Play, ExternalLink, Upload, Youtube, Sparkles, Star, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useDropzone } from "react-dropzone";
import  { Song } from "@/types";

export default function Songs() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [playerType, setPlayerType] = useState<'youtube' | 'local' | null>(null);

  const { data: songs } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  const createSongMutation = useMutation({
    mutationFn: async (songData: any) => {
      await apiRequest("POST", "/api/songs", songData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      setYoutubeDialogOpen(false);
      toast({
        title: "Success",
        description: "Song added successfully",
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
        description: "Failed to add song",
        variant: "destructive",
      });
    },
  });

  const uploadSongsMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const response = await fetch('/api/songs/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({
        title: "Success",
        description: "Songs uploaded successfully",
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
        description: "Failed to upload songs",
        variant: "destructive",
      });
    },
  });

  const deleteSongMutation = useMutation({
    mutationFn: async (songId: string) => {
      await apiRequest("DELETE", `/api/songs/${songId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({
        title: "Success",
        description: "Song deleted successfully",
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
        description: "Failed to delete song",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadSongsMutation.mutate(acceptedFiles);
    }
  }, [uploadSongsMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'video/*': ['.mp4', '.webm'],
    },
    multiple: true,
  });

  const handleAddYoutubeSong = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const songData = {
      title: formData.get("title") as string,
      youtubeUrl: formData.get("youtubeUrl") as string,
      thumbnailUrl: formData.get("thumbnailUrl") as string,
    };
    createSongMutation.mutate(songData);
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const playYoutubeSong = (song: any) => {
    setSelectedSong(song);
    setPlayerType('youtube');
  };

  const playLocalSong = (song: any) => {
    setSelectedSong(song);
    setPlayerType('local');
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
                <Music className="h-8 w-8 text-primary animate-spin-slow" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Latest Songs</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Listen to our latest tracks and favorites from <span className="text-primary font-semibold">MWANZO BOYS</span>
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6 animate-pulse-gentle"></div>
          </div>

          {/* Enhanced Admin Controls */}
          {isAdmin && (
            <div className="glass rounded-2xl p-6 mb-12 backdrop-blur-lg animate-fade-in-up delay-200">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-semibold mb-2">Manage Music</h2>
                  <p className="text-muted-foreground">Add new songs from YouTube or upload audio files</p>
                </div>
                
                <div className="flex gap-4 flex-wrap justify-center">
                  <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="hover-lift animate-bounce-gentle glass" data-testid="button-add-youtube-song">
                        <Youtube className="mr-2 h-5 w-5" />
                        <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                        Add YouTube Song
                        <Star className="ml-2 h-4 w-4 animate-pulse" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass backdrop-blur-lg border-primary/20 animate-fade-in-up">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-gradient text-center">Add YouTube Song</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddYoutubeSong} className="space-y-6" data-testid="form-add-youtube-song">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-sm font-medium">Song Title</Label>
                          <Input 
                            id="title" 
                            name="title" 
                            required 
                            className="glass border-primary/20 focus:border-primary"
                            placeholder="Enter song title..."
                            data-testid="input-song-title" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="youtubeUrl" className="text-sm font-medium">
                            <Youtube className="inline h-4 w-4 mr-1" />
                            YouTube URL
                          </Label>
                          <Input 
                            id="youtubeUrl" 
                            name="youtubeUrl" 
                            type="url" 
                            required 
                            className="glass border-primary/20 focus:border-primary"
                            placeholder="https://www.youtube.com/watch?v=..."
                            data-testid="input-youtube-url"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="thumbnailUrl" className="text-sm font-medium">Thumbnail URL (optional)</Label>
                          <Input 
                            id="thumbnailUrl" 
                            name="thumbnailUrl" 
                            type="url"
                            className="glass border-primary/20 focus:border-primary"
                            data-testid="input-thumbnail-url"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full hover-lift glass animate-pulse-gentle" 
                          disabled={createSongMutation.isPending}
                          data-testid="button-submit-youtube-song"
                        >
                          {createSongMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adding Song...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Add Song
                              <Music className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced File Upload Area */}
          {isAdmin && (
            <Card className="mb-12 glass backdrop-blur-lg animate-fade-in-up delay-300">
              <CardContent className="p-8">
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                    isDragActive 
                      ? 'border-primary bg-primary/10 animate-glow' 
                      : 'border-primary/25 hover:border-primary hover:bg-primary/5 hover-lift'
                  }`}
                  data-testid="dropzone-upload"
                >
                  <input {...getInputProps()} />
                  <Upload className="h-16 w-16 text-primary mx-auto mb-6 animate-bounce" />
                  <p className="text-xl font-medium mb-3">
                    {isDragActive ? "🎵 Drop the music files! 🎵" : "Drag and drop audio/video files here"}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Supports MP3, MP4, WAV, OGG, M4A, and WebM formats
                  </p>
                  <Button variant="outline" className="glass">
                    <Plus className="mr-2 h-4 w-4" />
                    Browse Files
                  </Button>
                  {uploadSongsMutation.isPending && (
                    <div className="mt-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-3">Uploading your music...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Enhanced Songs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {songs?.length ? (
              songs.map((song: any, index: number) => (
                <Card 
                  key={song.id} 
                  className="hover-lift glass backdrop-blur-lg animate-fade-in-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                  data-testid={`card-song-${song.id}`}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 relative">
                      {song.thumbnailUrl ? (
                        <div className="relative overflow-hidden rounded-xl">
                          <img 
                            src={song.thumbnailUrl} 
                            alt={song.title}
                            className="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                            data-testid={`img-song-thumbnail-${song.id}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-xl flex items-center justify-center animate-pulse-gentle group-hover:animate-glow">
                          <Music className="h-12 w-12 text-primary animate-spin-slow" />
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-ping-slow">
                        <Star className="h-4 w-4 text-white animate-spin-slow" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors" data-testid={`text-song-title-${song.id}`}>
                            {song.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1" data-testid={`text-song-artist-${song.id}`}>
                            {song.artist || "MWANZO BOYS"}
                          </p>
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSongMutation.mutate(song.id)}
                            className="text-destructive hover:text-destructive hover:scale-110 transition-transform flex-shrink-0"
                            data-testid={`button-delete-song-${song.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Button 
                          size="icon" 
                          className="rounded-full bg-primary hover:bg-primary/90 hover:scale-110 transition-transform animate-pulse-gentle group/play"
                          onClick={() => song.youtubeUrl ? playYoutubeSong(song) : playLocalSong(song)}
                          data-testid={`button-play-song-${song.id}`}
                        >
                          <Play className="h-5 w-5 ml-0.5 group-hover/play:animate-ping" />
                        </Button>
                        <div className="flex space-x-6 text-sm">
                          <span className="flex items-center text-muted-foreground" data-testid={`text-song-likes-${song.id}`}>
                            <Heart className="mr-1 h-4 w-4 text-red-400 animate-pulse" />
                            {song.likes || 0}
                          </span>
                          <span className="flex items-center text-muted-foreground" data-testid={`text-song-views-${song.id}`}>
                            <span className="mr-1">👁️</span>
                            {song.views || 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {song.youtubeUrl && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1 hover-lift group/youtube"
                            onClick={() => playYoutubeSong(song)}
                            data-testid={`button-youtube-play-${song.id}`}
                          >
                            <Youtube className="mr-2 h-4 w-4 group-hover/youtube:animate-bounce" />
                            YouTube
                          </Button>
                        )}
                        {song.localFileUrl && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1 hover-lift group/local"
                            onClick={() => playLocalSong(song)}
                            data-testid={`button-local-play-${song.id}`}
                          >
                            <Music className="mr-2 h-4 w-4 group-hover/local:animate-spin-slow" />
                            Website
                          </Button>
                        )}
                        {song.youtubeUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover-lift glass"
                            asChild
                            data-testid={`button-external-youtube-${song.id}`}
                          >
                            <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 animate-fade-in">
                <div className="glass rounded-2xl p-12 max-w-md mx-auto backdrop-blur-lg">
                  <Music className="h-20 w-20 text-muted-foreground mx-auto mb-6 animate-spin-slow" />
                  <h3 className="text-2xl font-semibold mb-3">No Songs Available</h3>
                  <p className="text-muted-foreground text-lg mb-6">
                    Music will appear here once it's added to the collection.
                  </p>
                  {isAdmin && (
                    <Button className="hover-lift animate-bounce-gentle glass">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Song
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Music Players */}
          {selectedSong && playerType === 'youtube' && selectedSong.youtubeUrl && (
            <YoutubePlayer 
              videoId={extractVideoId(selectedSong.youtubeUrl) ?? null} 
              title={selectedSong.title}
              onClose={() => {
                setSelectedSong(null);
                setPlayerType(null);
              }}
            />
          )}

          {selectedSong && playerType === 'local' && selectedSong.localFileUrl && (
            <SongPlayer 
              audioUrl={selectedSong.localFileUrl}
              title={selectedSong.title}
              artist={selectedSong.artist}
              onClose={() => {
                setSelectedSong(null);
                setPlayerType(null);
              }}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}