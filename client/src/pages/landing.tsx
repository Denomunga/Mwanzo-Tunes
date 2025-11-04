import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Music, User, Phone, MapPin, Mail, Play, ExternalLink, Facebook, Instagram, MessageCircle, Video, Sparkles, Star, Heart, TrendingUp, Users, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Event, AboutContent, Contact, Song, SocialMedia } from "@/types";

export default function Landing() {
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: aboutContent } = useQuery<AboutContent>({
    queryKey: ["/api/about"],
  });

  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: songs } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  const { data: socialMedia } = useQuery<SocialMedia[]>({
    queryKey: ["/api/social-media"],
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "facebook": return <Facebook className="h-5 w-5" />;
      case "instagram": return <Instagram className="h-5 w-5" />;
      case "whatsapp": return <MessageCircle className="h-5 w-5" />;
      case "tiktok": return <Video className="h-5 w-5" />;
      case "x": return <ExternalLink className="h-5 w-5" />;
      default: return <ExternalLink className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
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

      {/* Enhanced Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "glass backdrop-blur-lg shadow-lg border-b border-primary/20"
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center animate-glow">
                  <Music className="h-5 w-5 text-white animate-spin-slow" />
                </div>
                <h1 className="text-xl font-bold text-gradient">Kiarutara MWANZOBOYS</h1>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button
                  onClick={() => scrollToSection("home")}
                  className={cn(
                    "nav-link px-3 py-2 text-lg font-medium transition-all hover-lift",
                    activeSection === "home"
                      ? "text-primary animate-pulse-gentle"
                      : "text-foreground hover:text-primary"
                  )}
                  data-testid="nav-home"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection("events")}
                  className={cn(
                    "nav-link px-3 py-2 text-lg font-medium transition-all hover-lift",
                    activeSection === "events"
                      ? "text-primary animate-pulse-gentle"
                      : "text-foreground hover:text-primary"
                  )}
                  data-testid="nav-events"
                >
                  Events
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className={cn(
                    "nav-link px-3 py-2 text-lg font-medium transition-all hover-lift",
                    activeSection === "about"
                      ? "text-primary animate-pulse-gentle"
                      : "text-foreground hover:text-primary"
                  )}
                  data-testid="nav-about"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("songs")}
                  className={cn(
                    "nav-link px-3 py-2 text-lg font-medium transition-all hover-lift",
                    activeSection === "songs"
                      ? "text-primary animate-pulse-gentle"
                      : "text-foreground hover:text-primary"
                  )}
                  data-testid="nav-songs"
                >
                  Songs
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className={cn(
                    "nav-link px-3 py-2 text-lg font-medium transition-all hover-lift",
                    activeSection === "contact"
                      ? "text-primary animate-pulse-gentle"
                      : "text-foreground hover:text-primary"
                  )}
                  data-testid="nav-contact"
                >
                  Contact
                </button>

                {/* ✅ Real Auth0 Login Button */}
                <a
                  href="/login"
                  className="hover-lift glass px-6 py-2 rounded-xl flex items-center font-semibold text-white bg-primary hover:bg-primary/90 transition-all duration-300 animate-bounce-gentle"
                >
                  <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                  Login
                  <Star className="ml-2 h-4 w-4 animate-pulse" />
                </a>

              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section id="home" className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
        {/* Hero Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full animate-pulse-slow animate-morph"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-primary/15 rounded-full animate-pulse-medium animate-morph delay-500"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-primary/10 rounded-full animate-pulse-fast animate-morph delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="glass rounded-full p-4 animate-glow">
                  <Music className="h-8 w-8 text-primary animate-spin-slow" />
                </div>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Kiarutara<br />
                <span className="text-primary animate-neon-flicker">MWANZOBOYS</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Experience the rhythm, feel the vibe. Join us on a musical journey that transcends boundaries and touches souls.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => scrollToSection("songs")}
                  className="hover-lift animate-bounce-gentle glass"
                  data-testid="button-listen-now"
                >
                  <Play className="mr-2 h-4 w-4" />
                  <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                  Listen Now
                  <Star className="ml-2 h-4 w-4 animate-pulse" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => scrollToSection("events")}
                  className="hover-lift glass"
                  data-testid="button-view-events"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Events
                  <Sparkles className="ml-2 h-4 w-4 animate-spin-slow" />
                </Button>
              </div>
            </div>

            <div className="relative animate-fade-in-right">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl glass backdrop-blur-lg hover-lift group">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center animate-pulse-gentle group-hover:animate-glow">
                  <Music className="h-24 w-24 text-primary animate-spin-slow" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">Now Playing</p>
                      <p className="font-semibold text-white">Latest Hit Single</p>
                    </div>
                    <Button
                      size="icon"
                      className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 hover:scale-110 transition-transform animate-pulse-gentle"
                      data-testid="button-play-hero"
                    >
                      <Play className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-ping-slow">
                  <Star className="h-4 w-4 text-white animate-spin-slow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Events Section */}
      <section id="events" className="py-20 bg-secondary/30 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="glass rounded-full p-4 animate-glow">
                <Calendar className="h-8 w-8 text-primary animate-spin-slow" />
              </div>
            </div>
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Upcoming Events</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't miss out on our live performances and unforgettable experiences
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6 animate-pulse-gentle"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events?.length ? (
              events.map((event: any, index: number) => (
                <Card
                  key={event.id}
                  className="glass backdrop-blur-lg hover-lift animate-fade-in-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                  data-testid={`card-event-${event.id}`}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 relative">
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-lg flex items-center justify-center animate-pulse-gentle group-hover:animate-glow">
                        <Calendar className="h-12 w-12 text-primary animate-bounce" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-ping-slow">
                        <Star className="h-4 w-4 text-white animate-spin-slow" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2" data-testid={`text-event-description-${event.id}`}>
                        {event.description}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <span className="flex items-center" data-testid={`text-event-date-${event.id}`}>
                          <Calendar className="mr-2 h-4 w-4 text-primary animate-pulse" />
                          {event.date}
                        </span>
                        <span className="flex items-center" data-testid={`text-event-location-${event.id}`}>
                          <MapPin className="mr-2 h-4 w-4 text-primary animate-bounce-gentle" />
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                        <span className="text-muted-foreground text-sm flex items-center" data-testid={`text-event-likes-${event.id}`}>
                          <Heart className="mr-1 h-4 w-4 text-red-400 animate-pulse" />
                          {event.likes || 0}
                        </span>
                        <Button size="sm" className="hover-lift glass" data-testid={`button-get-tickets-${event.id}`}>
                          Get Tickets
                          <Sparkles className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 animate-fade-in">
                <div className="glass rounded-2xl p-12 max-w-md mx-auto backdrop-blur-lg">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                  <h3 className="text-2xl font-semibold mb-3">No Upcoming Events</h3>
                  <p className="text-muted-foreground text-lg">
                    Stay tuned for upcoming performances and events!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section id="about" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-2xl flex items-center justify-center animate-pulse-gentle group hover:animate-glow">
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

            <div className="animate-fade-in-right">
              <div className="glass rounded-2xl p-8 backdrop-blur-lg">
                <h2 className="text-4xl font-bold mb-6 text-gradient">About Kiarutara</h2>

                {aboutContent ? (
                  <div className="space-y-6 text-muted-foreground text-lg leading-relaxed" data-testid="text-about-content">
                    <p>{aboutContent.content}</p>
                  </div>
                ) : (
                  <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                    <p>
                      Kiarutara MWANZOBOYS is a rising star in the music industry, known for their unique blend of traditional and contemporary sounds that captivate audiences worldwide.
                    </p>
                    <p>
                      With deep roots in cultural heritage and a modern approach to music production, we create experiences that resonate across generations and cultures.
                    </p>
                  </div>
                )}

                <div className="mt-8 grid grid-cols-3 gap-6">
                  <div className="text-center glass rounded-xl p-6 backdrop-blur-lg hover-lift group animate-fade-in-up delay-100">
                    <div className="text-3xl font-bold text-gradient mb-2" data-testid="text-stat-albums">
                      {aboutContent?.stats?.albums || 12}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center">
                      <Music className="mr-1 h-4 w-4 text-primary animate-pulse" />
                      Albums
                    </div>
                  </div>
                  <div className="text-center glass rounded-xl p-6 backdrop-blur-lg hover-lift group animate-fade-in-up delay-200">
                    <div className="text-3xl font-bold text-gradient mb-2" data-testid="text-stat-concerts">
                      {aboutContent?.stats?.concerts || "150+"}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center">
                      <Calendar className="mr-1 h-4 w-4 text-primary animate-bounce" />
                      Concerts
                    </div>
                  </div>
                  <div className="text-center glass rounded-xl p-6 backdrop-blur-lg hover-lift group animate-fade-in-up delay-300">
                    <div className="text-3xl font-bold text-gradient mb-2" data-testid="text-stat-fans">
                      {aboutContent?.stats?.fans || "50K+"}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center">
                      <Users className="mr-1 h-4 w-4 text-primary animate-pulse" />
                      Fans
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Songs Section */}
      <section id="songs" className="py-20 bg-secondary/30 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="glass rounded-full p-4 animate-glow">
                <Music className="h-8 w-8 text-primary animate-spin-slow" />
              </div>
            </div>
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Latest Songs</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our latest tracks and timeless favorites
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6 animate-pulse-gentle"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {songs?.length ? (
              songs.map((song: any, index: number) => (
                <Card
                  key={song.id}
                  className="glass backdrop-blur-lg hover-lift animate-fade-in-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                  data-testid={`card-song-${song.id}`}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 relative">
                      <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-lg flex items-center justify-center animate-pulse-gentle group-hover:animate-glow">
                        <Music className="h-8 w-8 text-primary animate-spin-slow" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-ping-slow">
                        <Star className="h-4 w-4 text-white animate-spin-slow" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors" data-testid={`text-song-title-${song.id}`}>
                          {song.title}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`text-song-artist-${song.id}`}>
                          {song.artist || "MWANZO BOYS"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          size="icon"
                          className="rounded-full bg-primary hover:bg-primary/90 hover:scale-110 transition-transform animate-pulse-gentle group/play"
                          data-testid={`button-play-song-${song.id}`}
                        >
                          <Play className="h-4 w-4 ml-1 group-hover/play:animate-ping" />
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
                            data-testid={`button-youtube-${song.id}`}
                          >
                            <ExternalLink className="mr-2 h-4 w-4 group-hover/youtube:animate-bounce" />
                            YouTube
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 hover-lift group/website"
                          data-testid={`button-website-${song.id}`}
                        >
                          <Music className="mr-2 h-4 w-4 group-hover/website:animate-spin-slow" />
                          Website
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 animate-fade-in">
                <div className="glass rounded-2xl p-12 max-w-md mx-auto backdrop-blur-lg">
                  <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin-slow" />
                  <h3 className="text-2xl font-semibold mb-3">No Songs Available</h3>
                  <p className="text-muted-foreground text-lg">
                    New music coming soon!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="glass rounded-full p-4 animate-glow">
                <MessageCircle className="h-8 w-8 text-primary animate-spin-slow" />
              </div>
            </div>
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Get In Touch</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Reach out for bookings, collaborations, or just to say hello
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6 animate-pulse-gentle"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-fade-in-left">
              <div className="glass rounded-2xl p-8 backdrop-blur-lg">
                <h3 className="text-2xl font-bold mb-6 text-gradient">Contact Information</h3>

                <div className="space-y-6">
                  {contacts?.length ? (
                    contacts.map((contact: any, index: number) => (
                      <div
                        key={contact.id}
                        className="glass backdrop-blur-lg rounded-xl p-6 flex items-center space-x-4 hover-lift group animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                        data-testid={`contact-item-${contact.id}`}
                      >
                        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center group-hover:animate-glow transition-all">
                          {contact.type === "email" && <Mail className="text-white h-6 w-6" />}
                          {contact.type === "phone" && <Phone className="text-white h-6 w-6" />}
                          {contact.type === "location" && <MapPin className="text-white h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-semibold text-lg group-hover:text-primary transition-colors" data-testid={`text-contact-label-${contact.id}`}>
                            {contact.label}
                          </p>
                          <p className="text-muted-foreground" data-testid={`text-contact-value-${contact.id}`}>
                            {contact.value}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass rounded-2xl p-8 text-center backdrop-blur-lg animate-fade-in">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                      <h3 className="text-xl font-semibold mb-2">No Contact Information</h3>
                      <p className="text-muted-foreground">Contact details will be available soon.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="animate-fade-in-right">
              <Card className="glass backdrop-blur-lg hover-lift">
                <CardContent className="p-8">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4 animate-pulse-gentle">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-gradient">Send us a message</h3>
                  </div>

                  <form className="space-y-6" data-testid="form-contact">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                      <Input
                        id="name"
                        className="glass border-primary/20 focus:border-primary"
                        placeholder="Your name"
                        data-testid="input-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        className="glass border-primary/20 focus:border-primary"
                        placeholder="your@email.com"
                        data-testid="input-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                      <Select>
                        <SelectTrigger className="glass border-primary/20" data-testid="select-subject">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent className="glass backdrop-blur-lg border-primary/20">
                          <SelectItem value="booking">Booking Inquiry</SelectItem>
                          <SelectItem value="collaboration">Collaboration</SelectItem>
                          <SelectItem value="media">Media Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        className="glass border-primary/20 focus:border-primary"
                        placeholder="Your message..."
                        data-testid="textarea-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full hover-lift glass animate-pulse-gentle"
                      data-testid="button-send-message"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                      Send Message
                      <Star className="ml-2 h-4 w-4 animate-pulse" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-card border-t border-border py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center animate-glow">
                  <Music className="h-5 w-5 text-white animate-spin-slow" />
                </div>
                <h3 className="text-xl font-bold text-gradient">Kiarutara MWANZOBOYS</h3>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md text-lg">
                Experience authentic music that transcends boundaries. Follow our journey and stay connected with the latest updates, releases, and performances.
              </p>

              <div className="flex space-x-4">
                {socialMedia?.length ? (
                  socialMedia.filter((social: any) => social.isActive).map((social: any) => (
                    <Button
                      key={social.id}
                      size="icon"
                      variant="outline"
                      className="hover-lift glass"
                      asChild
                      data-testid={`button-social-${social.platform}`}
                    >
                      <a href={social.url} target="_blank" rel="noopener noreferrer">
                        {getSocialIcon(social.platform)}
                      </a>
                    </Button>
                  ))
                ) : (
                  <>
                    <Button size="icon" variant="outline" className="hover-lift glass" data-testid="button-social-facebook">
                      <Facebook className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="outline" className="hover-lift glass" data-testid="button-social-instagram">
                      <Instagram className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="outline" className="hover-lift glass" data-testid="button-social-whatsapp">
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><button onClick={() => scrollToSection("home")} className="hover:text-primary transition-colors hover-lift text-lg" data-testid="link-footer-home">Home</button></li>
                <li><button onClick={() => scrollToSection("events")} className="hover:text-primary transition-colors hover-lift text-lg" data-testid="link-footer-events">Events</button></li>
                <li><button onClick={() => scrollToSection("about")} className="hover:text-primary transition-colors hover-lift text-lg" data-testid="link-footer-about">About</button></li>
                <li><button onClick={() => scrollToSection("songs")} className="hover:text-primary transition-colors hover-lift text-lg" data-testid="link-footer-songs">Songs</button></li>
                <li><button onClick={() => scrollToSection("contact")} className="hover:text-primary transition-colors hover-lift text-lg" data-testid="link-footer-contact">Contact</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><button className="hover:text-primary transition-colors hover-lift text-lg" data-testid="link-help-center">Help Center</button></li>
                <li><button className="hover:text-primary transition-colors hover-lift text-lg" data-testid="link-privacy-policy">Privacy Policy</button></li>
                <li><button className="hover:text-primary transition-colors hover-lift text-lg" data-testid="link-terms-service">Terms of Service</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p className="text-lg">&copy; 2024 Kiarutara MWANZO BOYS. All rights reserved.</p>
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-ping delay-300"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-ping delay-600"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}