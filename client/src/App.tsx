import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Events from "@/pages/events";
import About from "@/pages/about";
import Songs from "@/pages/songs";
import Contact from "@/pages/contact";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  // Loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Loading...
      </div>
    );
  }

  // Redirect helper for protected routes
  const requireAuth = (Component: React.ComponentType) => () => {
    if (!isAuthenticated) {
      window.location.href = `${import.meta.env.VITE_ISSUER_BASE_URL}/authorize?client_id=${
        import.meta.env.VITE_CLIENT_ID
      }&response_type=code&scope=openid profile email&redirect_uri=${encodeURIComponent(
        window.location.origin
      )}`;
      return null;
    }
    return <Component />;
  };

  // Admin route guard
  const requireAdmin = (Component: React.ComponentType) => () => {
    if (!isAuthenticated) {
      window.location.href = `${import.meta.env.VITE_ISSUER_BASE_URL}/authorize?client_id=${
        import.meta.env.VITE_CLIENT_ID
      }&response_type=code&scope=openid profile email&redirect_uri=${encodeURIComponent(
        window.location.origin
      )}`;
      return null;
    }
    if (user?.role !== "admin") {
      setLocation("/");
      return null;
    }
    return <Component />;
  };

  return (
    <Switch>
      {/* Public route */}
      <Route path="/" component={isAuthenticated ? Home : Landing} />

      {/* Protected routes */}
      <Route path="/events" component={requireAuth(Events)} />
      <Route path="/about" component={requireAuth(About)} />
      <Route path="/songs" component={requireAuth(Songs)} />
      <Route path="/contact" component={requireAuth(Contact)} />
      <Route path="/admin" component={requireAdmin(Admin)} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
