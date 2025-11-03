import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, Plus, Trash2, Heart, Image as ImageIcon, Sparkles, Star, Music, X, ZoomIn } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Event } from "@/types";

declare global {
  interface Window {
    google: any;
  }
}

// ✅ ADDED: Interface for like response
interface LikeResponse {
  liked: boolean;
}

export default function Events() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  
  // ✅ SIMPLIFIED: Location state without Google Maps coordinates
  const [locationData, setLocationData] = useState<{ name: string } | null>(null);
  
  // Image viewer state
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>("");

  // ✅ ADDED: State to track which events user has liked
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // ✅ ADDED: Fetch user's liked events when authenticated
  useEffect(() => {
    if (isAuthenticated && events) {
      // In a real app, you'd fetch this from an API endpoint
      // For now, we'll initialize with empty set and update on like actions
      setLikedEvents(new Set());
    }
  }, [isAuthenticated, events]);

  // ✅ NEW: Simple location input handler (replaces Google Maps autocomplete)
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const locationName = e.target.value;
    setLocationData(locationName ? { name: locationName } : null);
  };

  // ✅ Image viewer function - opens image in full screen
  const openImageViewer = (imageUrl: string, altText: string = "Event poster") => {
    setSelectedImage(imageUrl);
    setSelectedImageAlt(altText);
    setImageViewerOpen(true);
  };

  // ✅ Image viewer function - closes full screen image
  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage(null);
    setSelectedImageAlt("");
  };

  // ✅ Keyboard event listener for closing image viewer with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && imageViewerOpen) {
        closeImageViewer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageViewerOpen]);

  // ✅ FIXED: Updated event creation mutation using FormData
  const createEventMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Event creation failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setDialogOpen(false);
      setImageFile(null);
      setImagePreview(null);
      setLocationData(null);
      toast({
        title: "Success",
        description: "Event created successfully",
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
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });

  // ✅ Mutation for deleting events
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("DELETE", `/api/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
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
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  // ✅ FIXED: Like event mutation with proper API call and optimistic updates
  const likeEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Like failed: ${response.status} ${errorText}`);
      }
      
      return response.json() as Promise<LikeResponse>;
    },
    onMutate: async (eventId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/events"] });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData<Event[]>(["/api/events"]);

      // Optimistically update to the new value
      if (previousEvents) {
        queryClient.setQueryData<Event[]>(["/api/events"], (old) => 
          old?.map(event => {
            if (event.id === eventId) {
              const isCurrentlyLiked = likedEvents.has(eventId);
              return {
                ...event,
                likes: isCurrentlyLiked ? Math.max(0, (event.likes || 0) - 1) : (event.likes || 0) + 1
              };
            }
            return event;
          }) || []
        );

        // Update local liked events state
        setLikedEvents(prev => {
          const newSet = new Set(prev);
          if (newSet.has(eventId)) {
            newSet.delete(eventId);
          } else {
            newSet.add(eventId);
          }
          return newSet;
        });
      }

      return { previousEvents };
    },
    onSuccess: (data: LikeResponse, eventId: string) => {
      // Invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      toast({
        title: data.liked ? "Liked! ❤️" : "Unliked!",
        description: data.liked ? "Event  liked" : "Event unliked",
      });
    },
    onError: (error, eventId, context) => {
      console.error("Like error:", error);
      
      // Rollback to the previous state on error
      if (context?.previousEvents) {
        queryClient.setQueryData(["/api/events"], context.previousEvents);
      }

      // Rollback local liked state
      setLikedEvents(prev => {
        const newSet = new Set(prev);
        if (newSet.has(eventId)) {
          newSet.delete(eventId);
        } else {
          newSet.add(eventId);
        }
        return newSet;
      });

      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to like events",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
    },
  });

  // ✅ Handle file input change for event images
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ Handle drag and drop for event images
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ FIXED: Handle event creation using FormData approach
  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // ✅ Append the image file directly to FormData if exists
    if (imageFile) {
      formData.append("image", imageFile);
    }

    // ✅ Append location data
    if (locationData?.name) {
      formData.append("location", locationData.name);
    }

    createEventMutation.mutate(formData);
  };

  // ✅ ADDED: Check if user has liked a specific event
  const hasUserLikedEvent = (eventId: string) => {
    return likedEvents.has(eventId);
  };

  // Check if user has permission to manage events
  const canManageEvents = user && (user.role === "admin" || user.role === "staff");

  // Loading state
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
                <Calendar className="h-8 w-8 text-primary animate-spin-slow" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Upcoming Events</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the magic of <span className="text-primary font-semibold">MWANZO BOYS</span> live in concert
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6 animate-pulse-gentle"></div>
          </div>

          <div className="flex justify-between items-center mb-12 animate-fade-in-up delay-200">
            <div className="glass rounded-2xl p-6 backdrop-blur-lg">
              <h2 className="text-2xl font-semibold mb-2">Don't Miss Out!</h2>
              <p className="text-muted-foreground">Best experience!</p>
            </div>

            {canManageEvents && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="hover-lift animate-bounce-gentle glass">
                    <Plus className="mr-2 h-5 w-5" />
                    <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                    Add Event
                    <Star className="ml-2 h-4 w-4 animate-pulse" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass backdrop-blur-lg border-primary/20 max-h-[90vh] overflow-y-auto w-[95vw] max-w-md sm:max-w-lg md:max-w-xl mx-auto my-8">
                  <DialogHeader className="space-y-4">
                    <DialogTitle className="text-2xl text-gradient text-center flex items-center justify-center gap-2">
                      <Sparkles className="h-6 w-6 text-primary animate-spin-slow" />
                      Create New Event
                      <Sparkles className="h-6 w-6 text-primary animate-spin-slow" />
                    </DialogTitle>
                    <div className="w-16 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full animate-pulse"></div>
                  </DialogHeader>

                  <form onSubmit={handleCreateEvent} className="space-y-6 mt-4">
                    {/* Event Title */}
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        Event Title
                      </Label>
                      <Input 
                        id="title" 
                        name="title" 
                        required 
                        className="glass border-primary/20 focus:border-primary transition-all duration-300 hover:bg-primary/5"
                        placeholder="Enter event title..."
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        Description
                      </Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        required 
                        className="glass border-primary/20 focus:border-primary transition-all duration-300 hover:bg-primary/5 min-h-[100px] resize-vertical"
                        placeholder="Describe your event..."
                      />
                    </div>

                    {/* Event Date */}
                    <div className="space-y-3">
                      <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary animate-pulse" />
                        Event Date
                      </Label>
                      <Input 
                        id="date" 
                        name="date" 
                        type="date"
                        required 
                        className="glass border-primary/20 focus:border-primary transition-all duration-300 hover:bg-primary/5"
                      />
                    </div>

                    {/* ✅ UPDATED: Location Field - Simple input without Google Maps */}
                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary animate-pulse" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        ref={locationInputRef}
                        onChange={handleLocationChange}
                        className="glass border-primary/20 focus:border-primary transition-all duration-300 hover:bg-primary/5"
                        placeholder="Enter event location..."
                        required
                      />
                      {/* Helper text for Google Maps status */}
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 Google Maps autocomplete temporarily disabled
                      </p>
                    </div>

                    {/* Event Image */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary animate-pulse" />
                        Event Image
                      </Label>
                      <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="glass border-2 border-dashed border-primary/25 rounded-xl p-6 text-center cursor-pointer hover:bg-primary/5 transition-all duration-300 group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <div className="relative">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="mx-auto h-40 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full animate-ping"></div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <ImageIcon className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                              <ImageIcon className="h-8 w-8 text-primary animate-pulse" />
                            </div>
                            <div>
                              <p className="text-base font-medium text-foreground">Drop your image here</p>
                              <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                            </div>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          hidden
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t border-primary/10">
                      <Button 
                        type="button"
                        variant="outline" 
                        className="flex-1 hover-lift transition-all duration-300 hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 hover-lift glass animate-pulse-gentle transition-all duration-300" 
                        disabled={createEventMutation.isPending}
                      >
                        {createEventMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create Event
                            <Music className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Enhanced Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events?.length ? (
              events.map((event: any, index: number) => (
                <Card 
                  key={event.id} 
                  className="hover-lift glass backdrop-blur-lg animate-fade-in-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 relative">
                      {event.imageUrl ? (
                        <div className="relative overflow-hidden rounded-xl cursor-pointer" 
                             onClick={() => openImageViewer(event.imageUrl, event.title)}>
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-black/50 rounded-full p-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <ZoomIn className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Click to view
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-xl flex items-center justify-center animate-pulse-gentle group-hover:animate-glow">
                          <Calendar className="h-12 w-12 text-primary animate-bounce" />
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-ping-slow">
                        <Star className="h-4 w-4 text-white animate-spin-slow" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        {canManageEvents && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEventMutation.mutate(event.id)}
                            className="text-destructive hover:text-destructive hover:scale-110 transition-transform"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <p className="text-muted-foreground line-clamp-2">{event.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4 text-primary animate-pulse" />
                          <span className="font-medium">{new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        {event.coordinates ? (
                          <a
                            href={`https://www.google.com/maps?q=${event.coordinates}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors flex items-center group/link"
                          >
                            <MapPin className="mr-2 h-4 w-4 animate-bounce-gentle" />
                            <span className="group-hover/link:underline">{event.location}</span>
                          </a>
                        ) : (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                        {/* ✅ FIXED: Enhanced Like Button with Visual Feedback */}
                        {isAuthenticated ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likeEventMutation.mutate(event.id)}
                            disabled={likeEventMutation.isPending}
                            className={`hover:scale-105 transition-transform duration-200 group/like ${
                              hasUserLikedEvent(event.id) 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-muted-foreground hover:text-primary'
                            }`}
                          >
                            <Heart 
                              className={`mr-2 h-4 w-4 transition-all duration-200 ${
                                hasUserLikedEvent(event.id) 
                                  ? 'fill-red-500 scale-110' 
                                  : 'group-hover/like:scale-110'
                              } ${likeEventMutation.isPending ? 'animate-pulse' : ''}`} 
                            />
                            <span className="font-semibold">{event.likes || 0}</span>
                            {likeEventMutation.isPending && (
                              <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            )}
                          </Button>
                        ) : (
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Heart className="mr-2 h-4 w-4 text-red-400" />
                            <span className="font-semibold">{event.likes || 0}</span>
                            <span className="ml-1">Likes</span>
                          </div>
                        )}
                        {/* Buy Tickets!*
                        <Button size="sm" className="hover-lift glass">
                           
                          <Sparkles className="ml-2 h-3 w-3" />
                        </Button> */}
                      </div>
                    </div>
                  </CardContent>
                </Card> 
                
              ))
            ) : (
              <div className="col-span-full text-center py-20 animate-fade-in">
                <div className="glass rounded-2xl p-12 max-w-md mx-auto backdrop-blur-lg">
                  <Calendar className="h-20 w-20 text-muted-foreground mx-auto mb-6 animate-pulse" />
                  <h3 className="text-2xl font-semibold mb-3">No Events Scheduled</h3>
                  <p className="text-muted-foreground text-lg mb-6">
                    Stay tuned for upcoming performances!
                  </p>
                  {canManageEvents && (
                    <Button 
                      onClick={() => setDialogOpen(true)}
                      className="hover-lift animate-bounce-gentle"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Event
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Full Screen Image Viewer Modal */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="fixed inset-0 z-[100] max-w-none w-screen h-screen bg-black/95 backdrop-blur-md border-none rounded-none p-0 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12 backdrop-blur-sm border border-white/20"
              onClick={closeImageViewer}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image Container */}
            {selectedImage && (
              <div className="max-w-full max-h-full p-4 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt={selectedImageAlt}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  onClick={closeImageViewer}
                />
              </div>
            )}

            {/* Image Alt Text */}
            {selectedImageAlt && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 max-w-2xl text-center">
                <p className="text-sm font-medium truncate">{selectedImageAlt}</p>
              </div>
            )}

            {/* Download Button */}
            {selectedImage && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
                onClick={() => {
                  if (selectedImage) {
                    const link = document.createElement('a');
                    link.href = selectedImage;
                    link.download = `event-poster-${selectedImageAlt || 'image'}`;
                    link.click();
                  }
                }}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}