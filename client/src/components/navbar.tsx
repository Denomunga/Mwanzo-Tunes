import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
    { path: "/about", label: "About" },
    { path: "/songs", label: "Songs" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-card border-b border-border fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl font-bold text-primary cursor-pointer" data-testid="nav-logo">
                Kiarutara MWANZOBOYS
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <button
                    className={cn(
                      "nav-link px-3 py-2 transition-colors",
                      isActive(item.path) ? "text-primary" : "text-foreground hover:text-primary"
                    )}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </button>
                </Link>
              ))}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm" data-testid="nav-admin">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4" />
                    <span data-testid="nav-username">{user?.firstName || user?.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="nav-logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="nav-login"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="nav-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "w-full text-left px-4 py-2 rounded-lg transition-colors",
                          isActive(item.path) 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-secondary"
                        )}
                        data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                      >
                        {item.label}
                      </button>
                    </Link>
                  ))}
                  
                  {isAuthenticated ? (
                    <>
                      {user?.role === 'admin' && (
                        <Link href="/admin">
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => setMobileMenuOpen(false)}
                            data-testid="nav-mobile-admin"
                          >
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                      <div className="border-t border-border pt-4">
                        <div className="flex items-center space-x-2 px-4 py-2 text-sm">
                          <User className="h-4 w-4" />
                          <span data-testid="nav-mobile-username">{user?.firstName || user?.email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => window.location.href = "/api/logout"}
                          data-testid="nav-mobile-logout"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={() => window.location.href = "/api/login"}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid="nav-mobile-login"
                    >
                      Login
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
