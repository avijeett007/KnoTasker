import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface User {
  id: number;
  email: string;
  username: string;
}

type RequestResult = {
  ok: true;
} | {
  ok: false;
  message: string;
};

async function handleRequest(
  url: string,
  method: string,
  body?: { email: string; password: string }
): Promise<RequestResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status >= 500) {
        return { ok: false, message: response.statusText };
      }

      const message = await response.text();
      return { ok: false, message };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e.toString() };
  }
}

export function useUser() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        return {
          id: data.user.id,
          email: data.user.email,
          username: data.user.email.split("@")[0], // Use email username as display name
        };
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation<RequestResult, Error, { email: string; password: string }>({
    mutationFn: (userData) => handleRequest('/api/login', 'POST', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const logoutMutation = useMutation<RequestResult, Error>({
    mutationFn: () => handleRequest('/api/logout', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const registerMutation = useMutation<RequestResult, Error, { email: string; password: string }>({
    mutationFn: (userData) => handleRequest('/api/register', 'POST', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    register: registerMutation.mutateAsync,
  };
}
