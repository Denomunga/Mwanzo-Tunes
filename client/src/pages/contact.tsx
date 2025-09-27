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
import { Mail, Phone, MapPin, Plus, Trash2, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Contact } from "@shared/schema";

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
            <p className="text-muted-foreground text-lg">Reach out for bookings, collaborations, or just to say hello</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Contact Information</h2>
                {isAdmin && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-add-contact">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Contact
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Contact Information</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateContact} className="space-y-4" data-testid="form-add-contact">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select name="type" required>
                            <SelectTrigger data-testid="select-contact-type">
                              <SelectValue placeholder="Select contact type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="location">Location</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="label">Label</Label>
                          <Input id="label" name="label" required placeholder="e.g., Business Email" data-testid="input-contact-label" />
                        </div>
                        <div>
                          <Label htmlFor="value">Value</Label>
                          <Input id="value" name="value" required placeholder="e.g., contact@kiarutara.com" data-testid="input-contact-value" />
                        </div>
                        <div>
                          <Label htmlFor="icon">Icon Class (optional)</Label>
                          <Input id="icon" name="icon" placeholder="e.g., fas fa-envelope" data-testid="input-contact-icon" />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={createContactMutation.isPending}
                          data-testid="button-submit-contact"
                        >
                          {createContactMutation.isPending ? "Adding..." : "Add Contact"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <div className="space-y-6">
                {contacts?.length ? (
                  contacts.map((contact: any) => (
                    <div key={contact.id} className="flex items-center space-x-4" data-testid={`contact-item-${contact.id}`}>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getContactColor(contact.type)}`}>
                        {getContactIcon(contact.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold" data-testid={`text-contact-label-${contact.id}`}>{contact.label}</p>
                        <p className="text-muted-foreground" data-testid={`text-contact-value-${contact.id}`}>{contact.value}</p>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteContactMutation.mutate(contact.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-contact-${contact.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No contact information</h3>
                      <p className="text-muted-foreground">Contact details will be available soon.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            <div>
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6">Send us a message</h3>
                  <form onSubmit={handleContactForm} className="space-y-6" data-testid="form-contact-message">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" required placeholder="Your name" data-testid="input-contact-name" />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" required placeholder="your@email.com" data-testid="input-contact-email" />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select required>
                        <SelectTrigger data-testid="select-contact-subject">
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
                      <Textarea 
                        id="message" 
                        rows={5} 
                        required 
                        placeholder="Your message..."
                        data-testid="textarea-contact-message"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" data-testid="button-send-contact-message">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
