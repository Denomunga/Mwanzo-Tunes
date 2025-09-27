import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, MessageCircle, Video, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SocialMedia } from "@shared/schema";

export default function Footer() {
  const { data: socialMedia } = useQuery<SocialMedia[]>({
    queryKey: ["/api/social-media"],
  });

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

  const getSocialColor = (platform: string) => {
    switch (platform) {
      case "facebook": return "bg-blue-600 hover:bg-blue-700";
      case "instagram": return "bg-pink-600 hover:bg-pink-700";
      case "whatsapp": return "bg-green-600 hover:bg-green-700";
      case "tiktok": return "bg-black hover:bg-gray-800";
      case "x": return "bg-black hover:bg-gray-800";
      default: return "bg-primary hover:bg-primary/90";
    }
  };

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-primary mb-4">Kiarutara MWANZOBOYS</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Experience authentic music that transcends boundaries. Follow our journey and stay connected with the latest updates, releases, and performances.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              {socialMedia?.length ? (
                socialMedia
                  .filter((social: any) => social.isActive)
                  .map((social: any) => (
                    <Button
                      key={social.id}
                      size="icon"
                      className={`${getSocialColor(social.platform)} text-white`}
                      asChild
                      data-testid={`social-${social.platform}`}
                    >
                      <a href={social.url} target="_blank" rel="noopener noreferrer">
                        {getSocialIcon(social.platform)}
                      </a>
                    </Button>
                  ))
              ) : (
                <>
                  <Button 
                    size="icon" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="social-facebook-default"
                  >
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                    data-testid="social-instagram-default"
                  >
                    <Instagram className="h-5 w-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid="social-whatsapp-default"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="bg-black hover:bg-gray-800 text-white"
                    data-testid="social-tiktok-default"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="bg-black hover:bg-gray-800 text-white"
                    data-testid="social-x-default"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/">
                  <button className="hover:text-primary transition-colors" data-testid="footer-link-home">
                    Home
                  </button>
                </Link>
              </li>
              <li>
                <Link href="/events">
                  <button className="hover:text-primary transition-colors" data-testid="footer-link-events">
                    Events
                  </button>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <button className="hover:text-primary transition-colors" data-testid="footer-link-about">
                    About
                  </button>
                </Link>
              </li>
              <li>
                <Link href="/songs">
                  <button className="hover:text-primary transition-colors" data-testid="footer-link-songs">
                    Songs
                  </button>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <button className="hover:text-primary transition-colors" data-testid="footer-link-contact">
                    Contact
                  </button>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <button className="hover:text-primary transition-colors" data-testid="footer-link-help">
                  Help Center
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors" data-testid="footer-link-privacy">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors" data-testid="footer-link-terms">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Kiarutara MWANZOBOYS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
