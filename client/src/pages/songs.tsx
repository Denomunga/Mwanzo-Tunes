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
import { Music, Plus, Trash2, Play, ExternalLink, Upload, Youtube } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useDropzone } from "react-dropzone";
import type { Song } from "@shared/schema";

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Latest Songs</h1>
              <p className="text-muted-foreground">Listen to our latest tracks and favorites</p>
            </div>
            
            {isAdmin && (
              <div className="flex gap-2">
                <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-add-youtube-song">
                      <Youtube className="mr-2 h-4 w-4" />
                      Add YouTube Song
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add YouTube Song</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddYoutubeSong} className="space-y-4" data-testid="form-add-youtube-song">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required data-testid="input-song-title" />
                      </div>
                      <div>
                        <Label htmlFor="youtubeUrl">YouTube URL</Label>
                        <Input 
                          id="youtubeUrl" 
                          name="youtubeUrl" 
                          type="url" 
                          required 
                          placeholder="https://www.youtube.com/watch?v=..."
                          data-testid="input-youtube-url"
                        />
                      </div>
                      <div>
                        <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
                        <Input 
                          id="thumbnailUrl" 
                          name="thumbnailUrl" 
                          type="url"
                          data-testid="input-thumbnail-url"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={createSongMutation.isPending}
                        data-testid="button-submit-youtube-song"
                      >
                        {createSongMutation.isPending ? "Adding..." : "Add Song"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* File Upload Area */}
          {isAdmin && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  data-testid="dropzone-upload"
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {isDragActive ? "Drop files here..." : "Drag and drop audio/video files here or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports MP3, MP4, WAV, OGG, M4A, and WebM formats
                  </p>
                  {uploadSongsMutation.isPending && (
                    <div className="mt-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Songs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {songs?.length ? (
              songs.map((song: any) => (
                <Card key={song.id} className="hover:shadow-lg transition-shadow" data-testid={`card-song-${song.id}`}>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      {song.thumbnailUrl ? (
                        <img 
                          src={song.thumbnailUrl} 
                          alt={song.title}
                          className="w-full h-32 object-cover rounded-lg"
                          data-testid={`img-song-thumbnail-${song.id}`}
                        />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                          <Music className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold" data-testid={`text-song-title-${song.id}`}>{song.title}</h3>
                          <p className="text-sm text-muted-foreground" data-testid={`text-song-artist-${song.id}`}>{song.artist}</p>
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSongMutation.mutate(song.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-song-${song.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Button 
                          size="icon" 
                          className="rounded-full bg-primary hover:bg-primary/90"
                          onClick={() => song.youtubeUrl ? playYoutubeSong(song) : playLocalSong(song)}
                          data-testid={`button-play-song-${song.id}`}
                        >
                          <Play className="h-4 w-4 ml-1" />
                        </Button>
                        <div className="flex space-x-4 text-sm text-muted-foreground">
                          <span data-testid={`text-song-likes-${song.id}`}>❤️ {song.likes || 0}</span>
                          <span data-testid={`text-song-views-${song.id}`}>👁️ {song.views || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {song.youtubeUrl && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => playYoutubeSong(song)}
                            data-testid={`button-youtube-play-${song.id}`}
                          >
                            <Youtube className="mr-1 h-3 w-3" />
                            YouTube
                          </Button>
                        )}
                        {song.localFileUrl && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => playLocalSong(song)}
                            data-testid={`button-local-play-${song.id}`}
                          >
                            <Music className="mr-1 h-3 w-3" />
                            Website
                          </Button>
                        )}
                        {song.youtubeUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                            data-testid={`button-external-youtube-${song.id}`}
                          >
                            <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No songs available</h3>
                <p className="text-muted-foreground">Songs will appear here once they're added.</p>
              </div>
            )}
          </div>

          {/* Music Players */}
          {selectedSong && playerType === 'youtube' && selectedSong.youtubeUrl && (
            <YoutubePlayer 
              videoId={extractVideoId(selectedSong.youtubeUrl)} 
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
