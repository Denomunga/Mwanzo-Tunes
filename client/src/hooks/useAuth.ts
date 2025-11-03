import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "https://mwanzo-tunes-server.onrender.com";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: [`${API_URL}/api/auth/user`],
    queryFn: getQueryFn<User | null>({ on401: "returnNull" }),
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
