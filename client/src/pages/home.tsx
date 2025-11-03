import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Music, Users, TrendingUp, Sparkles, Star, Play, X, Minimize2, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Event, Song } from "@/types";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // State for managing the YouTube player
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: songs } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  useEffect(() => {
    if (!isLoading && user) {
      toast({
        title: "Welcome back!",
        description: `Good to see you again,🎧 ${user.firstName || user.email}`,
      });
    }
  }, [user, isLoading, toast]);

  // Function to extract YouTube video ID from URL
  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Function to handle playing a YouTube song
  const playYoutubeSong = (song: Song) => {
    setSelectedSong(song);
    setIsPlayerVisible(true);
    setIsPlayerMinimized(false);
  };

  // Function to close the player completely
  const closePlayer = () => {
    setIsPlayerVisible(false);
    setSelectedSong(null);
    setIsPlayerMinimized(false);
  };

  // Function to minimize the player
  const minimizePlayer = () => {
    setIsPlayerMinimized(true);
  };

  // Function to maximize the player
  const maximizePlayer = () => {
    setIsPlayerMinimized(false);
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

  // Show maximum of 6 songs on home page
  const recentEvents = events?.slice(0, 3) || [];
  const recentSongs = songs?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 hero-gradient-animated opacity-20"></div>
        
        {/* Floating Music Notes with enhanced animations */}
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
        <div className="absolute bottom-1/3 right-8 animate-float-medium delay-200">
          <div className="text-primary/20 text-5xl">♪</div>
        </div>
        
        {/* Enhanced Pulsing Circles */}
        <div className="absolute top-20 right-1/4">
          <div className="w-12 h-12 border-2 border-primary/25 rounded-full animate-ping-slow"></div>
        </div>
        <div className="absolute bottom-40 left-1/3">
          <div className="w-8 h-8 border-2 border-primary/20 rounded-full animate-ping-medium delay-300"></div>
        </div>
        <div className="absolute top-40 left-10">
          <div className="w-6 h-6 border-2 border-primary/15 rounded-full animate-ping-slow delay-600"></div>
        </div>
        
        {/* Morphing Shapes */}
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-primary/10 animate-morph delay-400"></div>
        <div className="absolute bottom-20 right-20 w-12 h-12 bg-primary/5 animate-morph delay-800"></div>
        
        {/* Enhanced Moving Waves */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="w-full h-32 bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 animate-wave opacity-60"></div>
        </div>

        {/* Particle System */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(15)].map((_, i) => (
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
      
      <main className="pt-16">
        {/* Enhanced Welcome Section */}
        <section className="hero-gradient py-24 relative overflow-hidden">
          {/* Animated Background for Hero */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-10 w-24 h-24 bg-primary/10 rounded-full animate-pulse-slow animate-morph"></div>
            <div className="absolute top-20 right-20 w-20 h-20 bg-primary/15 rounded-full animate-pulse-medium animate-morph delay-500"></div>
            <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-primary/10 rounded-full animate-pulse-fast animate-morph delay-700"></div>
            <div className="absolute bottom-10 right-1/4 w-16 h-16 bg-primary/15 rounded-full animate-pulse-slow animate-morph delay-300"></div>
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 animate-shimmer"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="glass rounded-full p-4 animate-glow">
                  <Sparkles className="h-8 w-8 text-primary animate-spin-slow" />
                </div>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 animate-fade-in-up">
                Welcome to{" "}
                <span className="text-gradient animate-pulse-gentle">Kiarutara</span>
                <br />
                <span className="text-primary animate-neon-flicker">MWANZO BOYS</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">
                Hello <span className="text-primary font-semibold">{user?.firstName || 'there'}</span>! 
                Discover my latest music, upcoming events, and exclusive content
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
                <Button asChild size="lg" data-testid="button-explore-music" className="animate-bounce-gentle hover-lift hover-glow">
                  <Link href="/songs">
                    <Music className="mr-2 h-5 w-5 animate-spin-slow" />
                    Explore Music
                    <Star className="ml-2 h-4 w-4 animate-pulse" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild data-testid="button-view-events" className="hover-lift glass border-primary/30">
                  <Link href="/events">
                    <Calendar className="mr-2 h-5 w-5 animate-pulse" />
                    View Events
                    <Sparkles className="ml-2 h-4 w-4 animate-spin-slow" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Dashboard Stats */}
        <section className="py-20 bg-secondary/30 backdrop-blur-lg relative">
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/15 animate-gradient-x"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card className="hover-lift glass animate-fade-in-up delay-75">
                <CardContent className="p-8 text-center relative">
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary rounded-full animate-ping-medium"></div>
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
                  <div className="text-3xl font-bold text-gradient" data-testid="text-total-total-events">{events?.length || 0}</div>
                  <div className="text-sm text-muted-foreground mt-2">Total Events</div>
                </CardContent>
              </Card>
              
              <Card className="hover-lift glass animate-fade-in-up delay-150">
                <CardContent className="p-8 text-center relative">
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary rounded-full animate-ping-medium delay-300"></div>
                  <Music className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                  <div className="text-3xl font-bold text-gradient" data-testid="text-total-songs">{songs?.length || 0}</div>
                  <div className="text-sm text-muted-foreground mt-2">Total Songs</div>
                </CardContent>
              </Card>
              
              <Card className="hover-lift glass animate-fade-in-up delay-225">
                <CardContent className="p-8 text-center relative">
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary rounded-full animate-ping-medium delay-600"></div>
                  <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce delay-500" />
                  <div className="text-3xl font-bold text-gradient">50K+</div>
                  <div className="text-sm text-muted-foreground mt-2">Fans Worldwide</div>
                </CardContent>
              </Card>
              
              <Card className="hover-lift glass animate-fade-in-up delay-300">
                <CardContent className="p-8 text-center relative">
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary rounded-full animate-ping-medium delay-900"></div>
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse delay-700" />
                  <div className="text-3xl font-bold text-gradient">Growing</div>
                  <div className="text-sm text-muted-foreground mt-2">Global Community</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced Recent Events */}
        <section className="py-20 relative">
          {/* Background Animation */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full animate-ping-slow"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/15 rounded-full animate-ping-medium delay-500"></div>
            <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-primary/5 rounded-full animate-ping-slow delay-800"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-bold animate-fade-in-left">
                <span className="text-gradient">Recent Events</span>
                <div className="w-20 h-1 bg-primary mt-2 animate-pulse-gentle"></div>
              </h2>
              <Button variant="outline" asChild data-testid="button-view-all-events" className="hover-lift glass">
                <Link href="/events">
                  <Calendar className="mr-2 h-4 w-4" />
                  View All Events
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentEvents.length > 0 ? (
                recentEvents.map((event: any, index: number) => (
                  <Card 
                    key={event.id} 
                    className="hover-lift glass animate-fade-in-up group"
                    style={{ animationDelay: `${index * 150}ms` }}
                    data-testid={`card-recent-event-${event.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 relative">
                        <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-xl flex items-center justify-center animate-pulse-gentle group-hover:animate-glow">
                          <Calendar className="h-12 w-12 text-primary animate-bounce" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-white animate-spin-slow" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors" data-testid={`text-recent-event-title-${event.id}`}>
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid={`text-recent-event-description-${event.id}`}>
                        {event.description}
                      </p>
                      <div className="text-xs text-primary font-medium flex items-center" data-testid={`text-recent-event-date-${event.id}`}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {event.date} • {event.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-4">
                        <Heart className="h-4 w-4 text-red-400 mr-1" />
                        {event.likes || 0} Likes
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 animate-fade-in">
                  <div className="glass rounded-2xl p-8 max-w-md mx-auto">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground text-lg">No recent events to show.</p>
                    <p className="text-sm text-muted-foreground mt-2">Check back later for upcoming events!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Enhanced Recent Songs - Now with Play Buttons */}
        <section className="py-20 bg-secondary/30 backdrop-blur-lg relative">
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-10 left-10 animate-float-slow delay-200">
              <div className="text-primary/15 text-3xl">♪</div>
            </div>
            <div className="absolute top-20 right-20 animate-float-medium delay-400">
              <div className="text-primary/15 text-4xl">♫</div>
            </div>
            <div className="absolute bottom-20 left-1/3 animate-float-fast delay-600">
              <div className="text-primary/15 text-3xl">♩</div>
            </div>
            <div className="absolute bottom-10 right-1/4 animate-float-slow delay-800">
              <div className="text-primary/15 text-5xl">♬</div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-bold animate-fade-in-right">
                <span className="text-gradient">Latest Releases</span>
                <div className="w-20 h-1 bg-primary mt-2 animate-pulse-gentle"></div>
              </h2>
              <Button variant="outline" asChild data-testid="button-view-all-songs" className="hover-lift glass">
                <Link href="/songs">
                  <Music className="mr-2 h-4 w-4" />
                  View All Songs
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentSongs.length > 0 ? (
                recentSongs.map((song: any, index: number) => (
                  <Card 
                    key={song.id} 
                    className="hover-lift glass animate-fade-in-up group"
                    style={{ animationDelay: `${index * 150}ms` }}
                    data-testid={`card-recent-song-${song.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 relative">
                        <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-xl flex items-center justify-center animate-pulse-gentle group-hover:animate-glow">
                          <Music className="h-12 w-12 text-primary animate-spin-slow" />
                        </div>
                        {/* Play Button - positioned absolutely over the song thumbnail */}
                        {song.youtubeUrl && (
                          <Button
                            size="icon"
                            className="absolute bottom-3 right-3 bg-primary hover:bg-primary/90 hover:scale-110 transition-transform rounded-full animate-pulse-gentle"
                            onClick={() => playYoutubeSong(song)}
                            data-testid={`button-play-song-${song.id}`}
                          >
                            <Play className="h-5 w-5 ml-0.5" />
                          </Button>
                        )}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white animate-pulse" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors" data-testid={`text-recent-song-title-${song.id}`}>
                        {song.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4" data-testid={`text-recent-song-artist-${song.id}`}>
                        {song.artist || "MWANZO BOYS"}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 animate-fade-in">
                  <div className="glass rounded-2xl p-8 max-w-md mx-auto">
                    <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin-slow" />
                    <p className="text-muted-foreground text-lg">No recent songs to show.</p>
                    <p className="text-sm text-muted-foreground mt-2">New music coming soon!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Enhanced Quick Actions */}
        {user?.role === 'admin' && (
          <section className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="text-4xl font-bold mb-4">
                  <span className="text-gradient">Admin Dashboard</span>
                </h2>
                <p className="text-muted-foreground text-lg">Manage your content and engage with your audience</p>
                <div className="w-24 h-1 bg-primary mx-auto mt-4 animate-pulse-gentle"></div>
              </div>
              
              <div className="flex flex-wrap gap-6 justify-center animate-fade-in-up">
                <Button asChild data-testid="button-admin-panel" className="hover-lift animate-pulse-gentle glass px-8 py-6">
                  <Link href="/admin" className="text-lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Admin Panel
                    <Star className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* YouTube Player Component - Only shows when a song is selected */}
      {isPlayerVisible && selectedSong && selectedSong.youtubeUrl && (
        <div className={`fixed glass backdrop-blur-lg border border-primary/20 rounded-2xl shadow-2xl transition-all duration-300 ${
          isPlayerMinimized 
            ? 'bottom-4 right-4 w-80 h-24'  // Minimized state - small player at bottom right
            : 'bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 w-full max-w-2xl h-96'  // Full state - centered player
        }`}>
          {/* Player Header with Controls */}
          <div className="flex justify-between items-center p-4 border-b border-primary/20 bg-primary/5 rounded-t-2xl">
            <h3 className="font-semibold text-lg truncate flex-1 mr-4">
              Now Playing: {selectedSong.title}
            </h3>
            <div className="flex space-x-2">
              {/* Minimize/Maximize Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={isPlayerMinimized ? maximizePlayer : minimizePlayer}
                className="hover:bg-primary/10 transition-colors"
                data-testid="button-minimize-player"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closePlayer}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                data-testid="button-close-player"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* YouTube Iframe - Only show when not minimized */}
          {!isPlayerMinimized && (
            <div className="w-full h-[calc(100%-4rem)]">
              <iframe
                src={`https://www.youtube.com/embed/${extractVideoId(selectedSong.youtubeUrl)}?autoplay=1&enablejsapi=1`}
                className="w-full h-full rounded-b-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`YouTube video player for ${selectedSong.title}`}
                data-testid="youtube-iframe"
              />
            </div>
          )}

          {/* Minimized Player View - Shows when player is minimized */}
          {isPlayerMinimized && (
            <div className="flex items-center justify-between p-4 h-full">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{selectedSong.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedSong.artist || "MWANZO BOYS"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={maximizePlayer}
                className="hover-lift glass"
                data-testid="button-maximize-player"
              >
                <Play className="h-4 w-4 mr-1" />
                Expand
              </Button>
            </div>
          )}
        </div>
      )}
      
      <Footer />
    </div>
  );
}