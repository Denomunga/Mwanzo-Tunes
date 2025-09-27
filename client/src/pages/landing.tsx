import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Music, User, Phone, MapPin, Mail, Play, ExternalLink, Facebook, Instagram, MessageCircle, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Event, AboutContent, Contact, Song, SocialMedia } from "@shared/schema";

export default function Landing() {
  const [activeSection, setActiveSection] = useState("home");

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

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">Kiarutara MWANZOBOYS</h1>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button 
                  onClick={() => scrollToSection("home")}
                  className={cn("nav-link px-3 py-2", activeSection === "home" && "text-primary")}
                  data-testid="nav-home"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection("events")}
                  className={cn("nav-link px-3 py-2", activeSection === "events" && "text-primary")}
                  data-testid="nav-events"
                >
                  Events
                </button>
                <button 
                  onClick={() => scrollToSection("about")}
                  className={cn("nav-link px-3 py-2", activeSection === "about" && "text-primary")}
                  data-testid="nav-about"
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection("songs")}
                  className={cn("nav-link px-3 py-2", activeSection === "songs" && "text-primary")}
                  data-testid="nav-songs"
                >
                  Songs
                </button>
                <button 
                  onClick={() => scrollToSection("contact")}
                  className={cn("nav-link px-3 py-2", activeSection === "contact" && "text-primary")}
                  data-testid="nav-contact"
                >
                  Contact
                </button>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-login"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-gradient min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Kiarutara<br />
                <span className="text-primary">MWANZOBOYS</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Experience the rhythm, feel the vibe. Join us on a musical journey that transcends boundaries and touches souls.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => scrollToSection("songs")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-listen-now"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Listen Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => scrollToSection("events")}
                  data-testid="button-view-events"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Events
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Music className="h-24 w-24 text-primary" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">Now Playing</p>
                      <p className="font-semibold">Latest Hit Single</p>
                    </div>
                    <Button 
                      size="icon" 
                      className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90"
                      data-testid="button-play-hero"
                    >
                      <Play className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-muted-foreground text-lg">Don't miss out on our live performances</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events?.length ? (
              events.map((event: any) => (
                <Card key={event.id} className="bg-card hover:shadow-lg transition-shadow" data-testid={`card-event-${event.id}`}>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold" data-testid={`text-event-title-${event.id}`}>{event.title}</h3>
                      <p className="text-muted-foreground" data-testid={`text-event-description-${event.id}`}>{event.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <span data-testid={`text-event-date-${event.id}`}>
                          <Calendar className="inline mr-1 h-3 w-3" />
                          {event.date}
                        </span>
                        <span data-testid={`text-event-location-${event.id}`}>
                          <MapPin className="inline mr-1 h-3 w-3" />
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-muted-foreground text-sm" data-testid={`text-event-likes-${event.id}`}>
                          ❤️ {event.likes || 0}
                        </span>
                        <Button size="sm" data-testid={`button-get-tickets-${event.id}`}>
                          Get Tickets
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming events at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <User className="h-24 w-24 text-primary" />
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold mb-6">About Kiarutara</h2>
              
              {aboutContent ? (
                <div className="space-y-6 text-muted-foreground" data-testid="text-about-content">
                  <p>{aboutContent.content}</p>
                </div>
              ) : (
                <div className="space-y-6 text-muted-foreground">
                  <p>
                    Kiarutara MWANZOBOYS is a rising star in the music industry, known for their unique blend of traditional and contemporary sounds.
                  </p>
                </div>
              )}
              
              <div className="mt-8 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary" data-testid="text-stat-albums">
                    {aboutContent?.stats?.albums || 12}
                  </div>
                  <div className="text-sm text-muted-foreground">Albums</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary" data-testid="text-stat-concerts">
                    {aboutContent?.stats?.concerts || "150+"}
                  </div>
                  <div className="text-sm text-muted-foreground">Concerts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary" data-testid="text-stat-fans">
                    {aboutContent?.stats?.fans || "50K+"}
                  </div>
                  <div className="text-sm text-muted-foreground">Fans</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Songs Section */}
      <section id="songs" className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Latest Songs</h2>
            <p className="text-muted-foreground text-lg">Listen to our latest tracks and favorites</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs?.length ? (
              songs.map((song: any) => (
                <Card key={song.id} className="bg-card" data-testid={`card-song-${song.id}`}>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                        <Music className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold" data-testid={`text-song-title-${song.id}`}>{song.title}</h3>
                        <p className="text-sm text-muted-foreground" data-testid={`text-song-artist-${song.id}`}>{song.artist}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Button 
                          size="icon" 
                          className="rounded-full bg-primary hover:bg-primary/90"
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
                            data-testid={`button-youtube-${song.id}`}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            YouTube
                          </Button>
                        )}
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1"
                          data-testid={`button-website-${song.id}`}
                        >
                          <Music className="mr-1 h-3 w-3" />
                          Website
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No songs available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-muted-foreground text-lg">Reach out for bookings, collaborations, or just to say hello</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                {contacts?.length ? (
                  contacts.map((contact: any) => (
                    <div key={contact.id} className="flex items-center space-x-4" data-testid={`contact-item-${contact.id}`}>
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        {contact.type === "email" && <Mail className="text-primary-foreground h-5 w-5" />}
                        {contact.type === "phone" && <Phone className="text-primary-foreground h-5 w-5" />}
                        {contact.type === "location" && <MapPin className="text-primary-foreground h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold" data-testid={`text-contact-label-${contact.id}`}>{contact.label}</p>
                        <p className="text-muted-foreground" data-testid={`text-contact-value-${contact.id}`}>{contact.value}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Contact information will be available soon.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <form className="space-y-6" data-testid="form-contact">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" data-testid="input-name" />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" data-testid="input-email" />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select>
                    <SelectTrigger data-testid="select-subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking Inquiry</SelectItem>
                      <SelectItem value="collaboration">Collaboration</SelectItem>
                      <SelectItem value="media">Media Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={5} placeholder="Your message..." data-testid="textarea-message" />
                </div>
                
                <Button type="submit" className="w-full" data-testid="button-send-message">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-primary mb-4">Kiarutara MWANZOBOYS</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Experience authentic music that transcends boundaries. Follow our journey and stay connected with the latest updates, releases, and performances.
              </p>
              
              <div className="flex space-x-4">
                {socialMedia?.length ? (
                  socialMedia.filter((social: any) => social.isActive).map((social: any) => (
                    <Button
                      key={social.id}
                      size="icon"
                      variant="outline"
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
                    <Button size="icon" variant="outline" data-testid="button-social-facebook">
                      <Facebook className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="outline" data-testid="button-social-instagram">
                      <Instagram className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="outline" data-testid="button-social-whatsapp">
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><button onClick={() => scrollToSection("home")} className="hover:text-primary transition-colors" data-testid="link-footer-home">Home</button></li>
                <li><button onClick={() => scrollToSection("events")} className="hover:text-primary transition-colors" data-testid="link-footer-events">Events</button></li>
                <li><button onClick={() => scrollToSection("about")} className="hover:text-primary transition-colors" data-testid="link-footer-about">About</button></li>
                <li><button onClick={() => scrollToSection("songs")} className="hover:text-primary transition-colors" data-testid="link-footer-songs">Songs</button></li>
                <li><button onClick={() => scrollToSection("contact")} className="hover:text-primary transition-colors" data-testid="link-footer-contact">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><button className="hover:text-primary transition-colors" data-testid="link-help-center">Help Center</button></li>
                <li><button className="hover:text-primary transition-colors" data-testid="link-privacy-policy">Privacy Policy</button></li>
                <li><button className="hover:text-primary transition-colors" data-testid="link-terms-service">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Kiarutara MWANZOBOYS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
