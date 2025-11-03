import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Music, Sparkles, Star, Home, Calendar, Info, Contact, Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/about", label: "About", icon: Info },
    { path: "/songs", label: "Songs", icon: Disc3 },
    { path: "/contact", label: "Contact", icon: Contact },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled 
        ? "glass backdrop-blur-lg shadow-xl border-b border-primary/20" 
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer group" data-testid="nav-logo">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center animate-glow group-hover:animate-pulse-gentle">
                  <Music className="h-5 w-5 text-white animate-spin-slow" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient group-hover:animate-pulse-gentle">
                    Kiarutara <span className="text-primary">MWANZO BOYS</span>
                  </h1>
                  <div className="w-0 group-hover:w-full h-0.5 bg-primary transition-all duration-300 animate-pulse-gentle"></div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      className={cn(
                        "nav-link px-4 py-2 transition-all duration-300 flex items-center space-x-2 hover-lift rounded-xl",
                        isActive(item.path) 
                          ? "glass text-primary animate-pulse-gentle" 
                          : "text-foreground hover:text-primary hover:bg-primary/10"
                      )}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.label}</span>
                      {isActive(item.path) && (
                        <Sparkles className="h-3 w-3 animate-spin-slow" />
                      )}
                    </button>
                  </Link>
                );
              })}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 ml-4">
                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover-lift glass animate-bounce-gentle"
                        data-testid="nav-admin"
                      >
                        <Sparkles className="mr-2 h-3 w-3 animate-spin-slow" />
                        Admin Panel
                        <Star className="ml-2 h-3 w-3 animate-pulse" />
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center space-x-3 glass rounded-xl px-4 py-2 backdrop-blur-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg animate-glow">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium" data-testid="nav-username">
                      {user?.firstName || user?.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.location.href = "/api/logout"}
                    className="hover-lift hover:bg-destructive/10 hover:text-destructive"
                    data-testid="nav-logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  className="hover-lift glass animate-bounce-gentle"
                  data-testid="nav-login"
                >
                  <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                  Login
                  <Star className="ml-2 h-4 w-4 animate-pulse" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Enhanced Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover-lift glass animate-pulse-gentle"
                  data-testid="nav-mobile-menu"
                >
                  <Menu className="h-6 w-6" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-80 glass backdrop-blur-lg border-l border-primary/20 animate-fade-in-right"
              >
                {/* Mobile Header */}
                <div className="flex items-center space-x-3 mb-8 pt-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-glow">
                    <Music className="h-6 w-6 text-white animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gradient">Kiarutara</h2>
                    <p className="text-sm text-primary">MWANZO BOYS</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link key={item.path} href={item.path}>
                        <button
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "w-full text-left px-4 py-4 rounded-xl transition-all duration-300 flex items-center space-x-3 hover-lift",
                            isActive(item.path) 
                              ? "glass text-primary animate-pulse-gentle border border-primary/20" 
                              : "hover:bg-primary/10 hover:text-primary"
                          )}
                          data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                          {isActive(item.path) && (
                            <Sparkles className="h-4 w-4 animate-spin-slow ml-auto" />
                          )}
                        </button>
                      </Link>
                    );
                  })}
                  
                  {isAuthenticated ? (
                    <>
                      {user?.role === 'admin' && (
                        <Link href="/admin">
                          <Button 
                            variant="outline" 
                            className="w-full mt-4 hover-lift glass" 
                            onClick={() => setMobileMenuOpen(false)}
                            data-testid="nav-mobile-admin"
                          >
                            <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                            Admin Panel
                            <Star className="ml-2 h-4 w-4 animate-pulse" />
                          </Button>
                        </Link>
                      )}
                      <div className="border-t border-primary/20 pt-4 mt-4">
                        <div className="flex items-center space-x-3 px-4 py-3 glass rounded-xl mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm" data-testid="nav-mobile-username">
                              {user?.firstName || user?.email}
                            </p>
                            <p className="text-xs text-muted-foreground">Welcome back!</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover-lift hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            window.location.href = "/api/logout";
                          }}
                          data-testid="nav-mobile-logout"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.location.href = "/api/login";
                      }}
                      className="w-full mt-4 hover-lift glass animate-bounce-gentle"
                      data-testid="nav-mobile-login"
                    >
                      <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                      Login
                      <Star className="ml-2 h-4 w-4 animate-pulse" />
                    </Button>
                  )}
                </div>

                {/* Mobile Footer */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-center">
                    <div className="flex justify-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-ping delay-300"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-ping delay-600"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Kiarutara MWANZO BOYS © 2024
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Indicator */}
      <div className={cn(
        "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary transition-all duration-500",
        isScrolled ? "opacity-100" : "opacity-0"
      )}
      style={{
        width: isScrolled ? '100%' : '0%',
        backgroundSize: '200% 100%',
        animation: isScrolled ? 'gradient-x 3s ease infinite' : 'none'
      }}></div>
    </nav>
  );
}