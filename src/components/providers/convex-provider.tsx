"use client";

import { ReactNode, useState, useEffect } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

// Create singleton client only on the client side
let convexClient: ConvexReactClient | null = null;

function getConvexUrl(): string {
  // Priority: Self-hosted URL > Convex Cloud URL
  const selfHostedUrl = process.env.NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL;
  const cloudUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const url = selfHostedUrl || cloudUrl;

  if (!url) {
    throw new Error(
      "Neither NEXT_PUBLIC_CONVEX_SELF_HOSTED_URL nor NEXT_PUBLIC_CONVEX_URL is set. Please check your environment configuration."
    );
  }

  return url;
}

function getConvexClient(): ConvexReactClient {
  if (convexClient) {
    return convexClient;
  }

  const url = getConvexUrl();
  convexClient = new ConvexReactClient(url);
  return convexClient;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    // Initialize client only on the client side
    setClient(getConvexClient());
  }, []);

  // During SSR/SSG, render children without Convex provider
  // This allows static generation to complete
  if (!client) {
    return <>{children}</>;
  }

  return (
    <ConvexAuthProvider client={client}>
      {children}
    </ConvexAuthProvider>
  );
}
