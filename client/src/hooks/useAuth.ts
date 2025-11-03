import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`);
      if (res.status === 401) return null; // ← Added: 401 = not logged in
      if (!res.ok) throw new Error("Auth failed");
      return res.json();
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}