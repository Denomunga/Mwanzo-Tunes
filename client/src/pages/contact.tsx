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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Phone, MapPin, Plus, Trash2, Edit, Sparkles, Star, MessageCircle, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Contact } from "@/types";

export default function Contact() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const createContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      await apiRequest("POST", "/api/contacts", contactData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Contact added successfully",
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
        description: "Failed to add contact",
        variant: "destructive",
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      await apiRequest("DELETE", `/api/contacts/${contactId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
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
        description: "Failed to delete contact",
        variant: "destructive",
      });
    },
  });

  const handleCreateContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contactData = {
      type: formData.get("type") as string,
      label: formData.get("label") as string,
      value: formData.get("value") as string,
      icon: formData.get("icon") as string,
    };
    createContactMutation.mutate(contactData);
  };

  const handleContactForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "Thank you for your message. We'll get back to you soon.",
    });
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-5 w-5" />;
      case "phone": return <Phone className="h-5 w-5" />;
      case "location": return <MapPin className="h-5 w-5" />;
      default: return <Mail className="h-5 w-5" />;
    }
  };

  const getContactColor = (type: string) => {
    switch (type) {
      case "email": return "bg-primary text-primary-foreground";
      case "phone": return "bg-green-600 text-white";
      case "location": return "bg-blue-600 text-white";
      default: return "bg-primary text-primary-foreground";
    }
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
        
        {/* Pulsing Circles */}
        <div className="absolute top-20 right-1/4">
          <div className="w-12 h-12 border-2 border-primary/25 rounded-full animate-ping-slow"></div>
        </div>
        <div className="absolute bottom-40 left-1/3">
          <div className="w-8 h-8 border-2 border-primary/20 rounded-full animate-ping-medium delay-300"></div>
        </div>
        
        {/* Particle System */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(8)].map((_, i) => (
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
                <MessageCircle className="h-8 w-8 text-primary animate-spin-slow" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Get In Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Reach out for bookings, collaborations, or just to say hello to <span className="text-primary font-semibold">MWANZO BOYS</span>
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6 animate-pulse-gentle"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Enhanced Contact Information Section */}
            <div className="animate-fade-in-left">
              <div className="glass rounded-2xl p-8 backdrop-blur-lg">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gradient">Contact Information</h2>
                  {isAdmin && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="hover-lift animate-bounce-gentle glass" data-testid="button-add-contact">
                          <Plus className="mr-2 h-4 w-4" />
                          <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                          Add Contact
                          <Star className="ml-2 h-4 w-4 animate-pulse" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass backdrop-blur-lg border-primary/20 animate-fade-in-up">
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-gradient text-center">Add Contact Information</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateContact} className="space-y-6" data-testid="form-add-contact">
                          <div className="space-y-2">
                            <Label htmlFor="type" className="text-sm font-medium">Type</Label>
                            <Select name="type" required>
                              <SelectTrigger className="glass border-primary/20" data-testid="select-contact-type">
                                <SelectValue placeholder="Select contact type" />
                              </SelectTrigger>
                              <SelectContent className="glass backdrop-blur-lg border-primary/20">
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="location">Location</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="label" className="text-sm font-medium">Label</Label>
                            <Input 
                              id="label" 
                              name="label" 
                              required 
                              className="glass border-primary/20 focus:border-primary"
                              placeholder="e.g., Business Email" 
                              data-testid="input-contact-label" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value" className="text-sm font-medium">Value</Label>
                            <Input 
                              id="value" 
                              name="value" 
                              required 
                              className="glass border-primary/20 focus:border-primary"
                              placeholder="e.g., contact@kiarutara.com" 
                              data-testid="input-contact-value" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="icon" className="text-sm font-medium">Icon Class (optional)</Label>
                            <Input 
                              id="icon" 
                              name="icon" 
                              className="glass border-primary/20 focus:border-primary"
                              placeholder="e.g., fas fa-envelope" 
                              data-testid="input-contact-icon" 
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full hover-lift glass animate-pulse-gentle" 
                            disabled={createContactMutation.isPending}
                            data-testid="button-submit-contact"
                          >
                            {createContactMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Adding...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Add Contact
                                <MessageCircle className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                <div className="space-y-6">
                  {contacts?.length ? (
                    contacts.map((contact: any, index: number) => (
                      <div 
                        key={contact.id} 
                        className="glass backdrop-blur-lg rounded-xl p-6 flex items-center space-x-4 hover-lift group animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                        data-testid={`contact-item-${contact.id}`}
                      >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getContactColor(contact.type)} group-hover:animate-glow transition-all`}>
                          {getContactIcon(contact.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg group-hover:text-primary transition-colors" data-testid={`text-contact-label-${contact.id}`}>
                            {contact.label}
                          </p>
                          <p className="text-muted-foreground" data-testid={`text-contact-value-${contact.id}`}>
                            {contact.value}
                          </p>
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteContactMutation.mutate(contact.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 hover-lift transition-all"
                            data-testid={`button-delete-contact-${contact.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="glass rounded-2xl p-12 text-center backdrop-blur-lg animate-fade-in">
                      <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-6 animate-pulse" />
                      <h3 className="text-2xl font-semibold mb-3">No Contact Information</h3>
                      <p className="text-muted-foreground text-lg mb-6">
                        Contact details will be available soon.
                      </p>
                      {isAdmin && (
                        <Button className="hover-lift animate-bounce-gentle glass">
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Contact
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enhanced Contact Form Section */}
            <div className="animate-fade-in-right">
              <Card className="glass backdrop-blur-lg hover-lift">
                <CardContent className="p-8">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4 animate-pulse-gentle">
                      <Send className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-gradient">Send us a message</h3>
                  </div>
                  
                  <form onSubmit={handleContactForm} className="space-y-6" data-testid="form-contact-message">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                      <Input 
                        id="name" 
                        required 
                        className="glass border-primary/20 focus:border-primary"
                        placeholder="Your name" 
                        data-testid="input-contact-name" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        required 
                        className="glass border-primary/20 focus:border-primary"
                        placeholder="your@email.com" 
                        data-testid="input-contact-email" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                      <Select required>
                        <SelectTrigger className="glass border-primary/20" data-testid="select-contact-subject">
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
                        required 
                        className="glass border-primary/20 focus:border-primary"
                        placeholder="Your message..."
                        data-testid="textarea-contact-message"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full hover-lift glass animate-pulse-gentle" 
                      data-testid="button-send-contact-message"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                      Send Message
                      <Star className="ml-2 h-4 w-4 animate-pulse" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Additional Info Card */}
              <Card className="glass backdrop-blur-lg mt-6 hover-lift animate-fade-in-up delay-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      <MessageCircle className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <h4 className="text-lg font-semibold">Quick Response</h4>
                  </div>
                  <p className="text-muted-foreground">
                    We typically respond to all inquiries within 24 hours. For urgent matters, please call us directly.
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping delay-300"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping delay-600"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Call to Action Section */}
          <div className="mt-20 text-center animate-fade-in-up delay-500">
            <div className="glass rounded-2xl p-12 backdrop-blur-lg max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-gradient">Let's Create Something Amazing Together</h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Whether you're looking to book a performance, collaborate on a project, or just want to connect, 
                we'd love to hear from you. Reach out and let's make something special happen.
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="hover-lift glass animate-bounce-gentle">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Us Now
                </Button>
                <Button variant="outline" className="hover-lift glass">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Directly
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}