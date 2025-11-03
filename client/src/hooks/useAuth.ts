import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }), // Use returnNull for auth
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}