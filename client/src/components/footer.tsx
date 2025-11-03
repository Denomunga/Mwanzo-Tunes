import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, MessageCircle, Video, ExternalLink, Music, Sparkles, Heart, ArrowUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SocialMedia } from "@/types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function Footer() {
  const { data: socialMedia } = useQuery<SocialMedia[]>({
    queryKey: ["/api/social-media"],
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "facebook": return <Facebook className="h-4 w-4" />;
      case "instagram": return <Instagram className="h-4 w-4" />;
      case "whatsapp": return <MessageCircle className="h-4 w-4" />;
      case "tiktok": return <Video className="h-4 w-4" />;
      case "x": return <ExternalLink className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getSocialColor = (platform: string) => {
    switch (platform) {
      case "facebook": return "hover:bg-blue-600/20 hover:text-blue-400 border-blue-500/30";
      case "instagram": return "hover:bg-pink-600/20 hover:text-pink-400 border-pink-500/30";
      case "whatsapp": return "hover:bg-green-600/20 hover:text-green-400 border-green-500/30";
      case "tiktok": return "hover:bg-gray-800/20 hover:text-gray-300 border-gray-500/30";
      case "x": return "hover:bg-gray-800/20 hover:text-gray-300 border-gray-500/30";
      default: return "hover:bg-primary/20 hover:text-primary border-primary/30";
    }
  };

  const footerLinks = [
    { path: "/", label: "Home", testId: "footer-link-home" },
    { path: "/events", label: "Events", testId: "footer-link-events" },
    { path: "/about", label: "About", testId: "footer-link-about" },
    { path: "/songs", label: "Songs", testId: "footer-link-songs" },
    { path: "/contact", label: "Contact", testId: "footer-link-contact" },
  ];

  const supportLinks = [
    { label: "Help Center", testId: "footer-link-help" },
    { label: "Privacy Policy", testId: "footer-link-privacy" },
    { label: "Terms of Service", testId: "footer-link-terms" },
  ];

  return (
    <>
      {/* Back to Top Button */}
      {isVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full glass backdrop-blur-lg border border-primary/20 shadow-xl hover-lift animate-bounce-gentle"
          size="icon"
          data-testid="footer-back-to-top"
        >
          <ArrowUp className="h-5 w-5 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
        </Button>
      )}

      <footer className="glass backdrop-blur-lg border-t border-primary/20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full animate-pulse-slow"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/5 rounded-full animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary/10 rounded-full animate-bounce-gentle"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
            {/* Enhanced Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4 group" data-testid="footer-brand">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-glow group-hover:animate-pulse-gentle">
                  <Music className="h-6 w-6 text-white animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient group-hover:animate-pulse-gentle">
                    Kiarutara <span className="text-primary">MWANZO BOYS</span>
                  </h3>
                  <div className="w-0 group-hover:w-full h-0.5 bg-primary transition-all duration-300 animate-pulse-gentle"></div>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 max-w-md text-lg leading-relaxed">
                Experience authentic music that transcends boundaries. Follow our journey and stay connected with the latest updates, releases, and performances.
              </p>
              
              {/* Enhanced Social Media Icons */}
              <div className="flex space-x-3">
                {socialMedia?.length ? (
                  socialMedia
                    .filter((social: any) => social.isActive)
                    .map((social: any) => (
                      <Button
                        key={social.id}
                        size="icon"
                        variant="outline"
                        className={cn(
                          "glass backdrop-blur-lg border hover-lift transition-all duration-300 transform hover:scale-110",
                          getSocialColor(social.platform)
                        )}
                        asChild
                        data-testid={`social-${social.platform}`}
                      >
                        <a 
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="relative group"
                        >
                          {getSocialIcon(social.platform)}
                          <div className="absolute inset-0 bg-current rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        </a>
                      </Button>
                    ))
                ) : (
                  <>
                    {['facebook', 'instagram', 'whatsapp', 'tiktok', 'x'].map((platform) => (
                      <Button
                        key={platform}
                        size="icon"
                        variant="outline"
                        className={cn(
                          "glass backdrop-blur-lg border hover-lift transition-all duration-300 transform hover:scale-110 animate-pulse-gentle",
                          getSocialColor(platform)
                        )}
                        data-testid={`social-${platform}-default`}
                      >
                        {getSocialIcon(platform)}
                      </Button>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            {/* Enhanced Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg flex items-center space-x-2">
                <Sparkles className="h-4 w-4 animate-spin-slow text-primary" />
                <span>Quick Links</span>
              </h4>
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.path}>
                    <Link href={link.path}>
                      <button 
                        className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center space-x-2 group hover-lift px-3 py-2 rounded-lg hover:bg-primary/5 w-full text-left"
                        data-testid={link.testId}
                      >
                        <div className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                        <span>{link.label}</span>
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Enhanced Support Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg flex items-center space-x-2">
                <Heart className="h-4 w-4 animate-pulse text-primary" />
                <span>Support</span>
              </h4>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <button 
                      className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center space-x-2 group hover-lift px-3 py-2 rounded-lg hover:bg-primary/5 w-full text-left"
                      data-testid={link.testId}
                    >
                      <div className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                      <span>{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Enhanced Bottom Section */}
          <div className="border-t border-primary/20 py-8 text-center relative">
            {/* Animated divider */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-muted-foreground flex items-center space-x-2 animate-fade-in">
                <span>&copy; 2024 Kiarutara MWANZO BOYS.</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center space-x-1">
                  <span>All rights reserved.</span>
                  <Heart className="h-4 w-4 text-primary animate-pulse" />
                </span>
              </p>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping delay-300"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping delay-600"></div>
                </div>
                <span>Made with passion for authentic music</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Music Notes */}
        <div className="absolute bottom-4 left-4 opacity-10 animate-bounce-gentle">
          <Music className="h-8 w-8" />
        </div>
        <div className="absolute top-4 right-4 opacity-10 animate-bounce-gentle delay-1000">
          <Music className="h-6 w-6" />
        </div>
      </footer>
    </>
  );
}