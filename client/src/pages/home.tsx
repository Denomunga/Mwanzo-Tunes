import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Music, Users, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Event, Song } from "@shared/schema";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

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
        description: `Good to see you again, ${user.firstName || user.email}`,
      });
    }
  }, [user, isLoading, toast]);

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

  const recentEvents = events?.slice(0, 3) || [];
  const recentSongs = songs?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Welcome Section */}
        <section className="hero-gradient py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6">
                Welcome to Kiarutara
                <br />
                <span className="text-primary">MWANZOBOYS</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Hello {user?.firstName || 'there'}! Discover the latest music, upcoming events, and exclusive content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" data-testid="button-explore-music">
                  <Link href="/songs">
                    <Music className="mr-2 h-5 w-5" />
                    Explore Music
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild data-testid="button-view-events">
                  <Link href="/events">
                    <Calendar className="mr-2 h-5 w-5" />
                    View Events
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Stats */}
        <section className="py-16 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold" data-testid="text-total-events">{events?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Music className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold" data-testid="text-total-songs">{songs?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Songs</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm text-muted-foreground">Fans</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">Growing</div>
                  <div className="text-sm text-muted-foreground">Community</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recent Events */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Recent Events</h2>
              <Button variant="outline" asChild data-testid="button-view-all-events">
                <Link href="/events">View All</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentEvents.length > 0 ? (
                recentEvents.map((event: any) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow" data-testid={`card-recent-event-${event.id}`}>
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2" data-testid={`text-recent-event-title-${event.id}`}>{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3" data-testid={`text-recent-event-description-${event.id}`}>
                        {event.description}
                      </p>
                      <div className="text-xs text-muted-foreground" data-testid={`text-recent-event-date-${event.id}`}>
                        {event.date} • {event.location}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent events to show.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Recent Songs */}
        <section className="py-16 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Latest Songs</h2>
              <Button variant="outline" asChild data-testid="button-view-all-songs">
                <Link href="/songs">View All</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentSongs.length > 0 ? (
                recentSongs.map((song: any) => (
                  <Card key={song.id} className="hover:shadow-lg transition-shadow" data-testid={`card-recent-song-${song.id}`}>
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                          <Music className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-semibold mb-1" data-testid={`text-recent-song-title-${song.id}`}>{song.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3" data-testid={`text-recent-song-artist-${song.id}`}>{song.artist}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span data-testid={`text-recent-song-likes-${song.id}`}>❤️ {song.likes || 0}</span>
                        <span data-testid={`text-recent-song-views-${song.id}`}>👁️ {song.views || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent songs to show.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        {user?.role === 'admin' && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Admin Quick Actions</h2>
                <p className="text-muted-foreground">Manage your content from here</p>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild data-testid="button-admin-panel">
                  <Link href="/admin">Admin Panel</Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
