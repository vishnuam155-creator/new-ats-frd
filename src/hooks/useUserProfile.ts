// hooks/useUserProfile.ts
import { useState, useEffect } from "react";

export interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  plan: string;
  uploads_used: number;
  upload_limit: number;
  date_joined: string;
  is_email_verified: boolean;
  profile_picture?: string;
}

export function useUserProfile(authToken: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = "http://127.0.0.1:8000";

  const fetchProfile = async () => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/profile/`, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to load profile");
      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error("Profile fetch failed:", err);
      setError("Unable to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [authToken]);

  return { profile, isLoading, error, refreshProfile: fetchProfile };
}
