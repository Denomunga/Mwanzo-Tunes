import { useState } from "react";
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
import { Calendar, MapPin, Plus, Trash2, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Event } from "@shared/schema";

export default function Events() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      await apiRequest("POST", "/api/events", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setDialogOpen(false);
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

  const likeEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("POST", `/api/events/${eventId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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
        description: "Failed to update like",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      location: formData.get("location") as string,
      imageUrl: formData.get("imageUrl") as string,
    };
    createEventMutation.mutate(eventData);
  };

  const canManageEvents = user && (user.role === 'admin' || user.role === 'staff');

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
              <h1 className="text-4xl font-bold mb-2">Upcoming Events</h1>
              <p className="text-muted-foreground">Don't miss out on our live performances</p>
            </div>
            
            {canManageEvents && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-event">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4" data-testid="form-create-event">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" required data-testid="input-event-title" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" required data-testid="textarea-event-description" />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" required placeholder="e.g., Dec 25, 2024" data-testid="input-event-date" />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" required data-testid="input-event-location" />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Image URL (optional)</Label>
                      <Input id="imageUrl" name="imageUrl" type="url" data-testid="input-event-image" />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createEventMutation.isPending}
                      data-testid="button-submit-event"
                    >
                      {createEventMutation.isPending ? "Creating..." : "Create Event"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events?.length ? (
              events.map((event: any) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow" data-testid={`card-event-${event.id}`}>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-lg"
                          data-testid={`img-event-${event.id}`}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold" data-testid={`text-event-title-${event.id}`}>{event.title}</h3>
                        {canManageEvents && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEventMutation.mutate(event.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-event-${event.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
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
                        {isAuthenticated ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likeEventMutation.mutate(event.id)}
                            className="hover:text-primary"
                            data-testid={`button-like-event-${event.id}`}
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            <span data-testid={`text-event-likes-${event.id}`}>{event.likes || 0}</span>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm" data-testid={`text-event-likes-${event.id}`}>
                            ❤️ {event.likes || 0}
                          </span>
                        )}
                        <Button size="sm" data-testid={`button-get-tickets-${event.id}`}>
                          Get Tickets
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events scheduled</h3>
                <p className="text-muted-foreground">Check back soon for upcoming performances!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
