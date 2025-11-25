"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCallback, useEffect } from "react";

export function useConvexAuth() {
  const { signIn, signOut } = useAuthActions();

  return {
    signIn,
    signOut,
  };
}

export function useCurrentUser() {
  // Get the current user's profile from Convex
  // This assumes you have a way to get the current user's clerk/auth ID
  // and link it to a profile
  return null; // Will be implemented based on auth setup
}

export function useProfile(profileId: string | null) {
  const profile = useQuery(
    api.profiles.getById,
    profileId ? { id: profileId as any } : "skip"
  );
  return profile;
}

export function useProfileByClerkId(clerkId: string | null) {
  const profile = useQuery(
    api.profiles.getByClerkId,
    clerkId ? { clerkId } : "skip"
  );
  return profile;
}

export function useCreateProfile() {
  const createProfile = useMutation(api.profiles.create);
  return createProfile;
}

export function useUpdateProfile() {
  const updateProfile = useMutation(api.profiles.update);
  return updateProfile;
}
